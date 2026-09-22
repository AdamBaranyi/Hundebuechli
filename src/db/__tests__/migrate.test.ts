import { sql } from 'drizzle-orm';

import { type MigrationBundle, runMigrations } from '../migrate';
import migrations from '../migrations/migrations';
import { createTestDb } from '../testing';

const TABLES = [
  'attachments',
  'diary_entries',
  'documents',
  'dogs',
  'dose_log',
  'health_entries',
  'medications',
  'owner',
  'reminders',
  'settings',
  'weights',
];

function tableNames(db: Awaited<ReturnType<typeof createTestDb>>): string[] {
  return db
    .all<{ name: string }>(
      sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '__migrations' ORDER BY name`,
    )
    .map((row) => row.name);
}

function bundleWith(extra: { tag: string; sql: string }[]): MigrationBundle {
  const entries: { idx: number; tag: string }[] = [...migrations.journal.entries];
  const sources: Record<string, string> = { ...migrations.migrations };
  extra.forEach((migration, i) => {
    const idx = entries.length + i;
    entries.push({ idx, tag: migration.tag });
    sources[`m${String(idx).padStart(4, '0')}`] = migration.sql;
  });
  return { journal: { entries }, migrations: sources };
}

describe('Migrationen', () => {
  it('legen alle Tabellen des Datenmodells an', async () => {
    const db = await createTestDb();
    expect(tableNames(db)).toEqual(TABLES);
  });

  it('sind idempotent: ein zweiter Lauf wendet nichts an', async () => {
    const db = await createTestDb();
    expect(runMigrations(db, migrations)).toBe(0);
    expect(db.all(sql`SELECT idx FROM __migrations`)).toHaveLength(1);
  });

  it('lassen die Fremdschlüssel eingeschaltet', async () => {
    const db = await createTestDb();
    let failure: unknown;
    try {
      db.run(
        sql`INSERT INTO weights (id, dog_id, date, grams, created_at, updated_at) VALUES ('w', 'fehlt', '2026-09-22', 13500, 'x', 'x')`,
      );
    } catch (error) {
      failure = error;
    }
    // drizzle umhüllt den Fehler von SQLite; die Ursache steht in `cause`.
    expect(String((failure as Error | undefined)?.cause)).toMatch(/FOREIGN KEY constraint failed/);
  });

  it('rollen eine fehlerhafte Migration ganz zurück', async () => {
    const db = await createTestDb();
    const broken = bundleWith([
      {
        tag: '0001_kaputt',
        sql: 'CREATE TABLE probe (id text);\n--> statement-breakpoint\nSELECT * FROM gibt_es_nicht;',
      },
    ]);
    expect(() => runMigrations(db, broken)).toThrow();
    expect(tableNames(db)).not.toContain('probe');
    expect(db.all(sql`SELECT idx FROM __migrations`)).toHaveLength(1);
  });

  it('bauen eine Tabelle neu, ohne Verweise zu verlieren, und schalten die Prüfung wieder ein', async () => {
    const db = await createTestDb();
    db.run(
      sql`INSERT INTO dogs (id, name, created_at, updated_at) VALUES ('d1', 'Bäri', 'x', 'x')`,
    );
    db.run(
      sql`INSERT INTO weights (id, dog_id, date, grams, created_at, updated_at) VALUES ('w1', 'd1', '2026-09-22', 13500, 'x', 'x')`,
    );
    const rebuild = bundleWith([
      {
        tag: '0001_neubau',
        sql: [
          'PRAGMA foreign_keys=OFF;',
          'CREATE TABLE `__new_dogs` (`id` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `created_at` text NOT NULL, `updated_at` text NOT NULL);',
          'INSERT INTO `__new_dogs` SELECT `id`, `name`, `created_at`, `updated_at` FROM `dogs`;',
          'DROP TABLE `dogs`;',
          'ALTER TABLE `__new_dogs` RENAME TO `dogs`;',
          'PRAGMA foreign_keys=ON;',
        ].join('\n--> statement-breakpoint\n'),
      },
    ]);
    expect(runMigrations(db, rebuild)).toBe(1);
    expect(db.get<{ foreign_keys: number }>(sql`PRAGMA foreign_keys`)).toEqual({ foreign_keys: 1 });
    expect(db.all(sql`SELECT id FROM weights`)).toEqual([{ id: 'w1' }]);
  });

  it('verwerfen einen Neubau, der Verweise verwaisen lässt', async () => {
    const db = await createTestDb();
    db.run(
      sql`INSERT INTO dogs (id, name, created_at, updated_at) VALUES ('d1', 'Bäri', 'x', 'x')`,
    );
    db.run(
      sql`INSERT INTO weights (id, dog_id, date, grams, created_at, updated_at) VALUES ('w1', 'd1', '2026-09-22', 13500, 'x', 'x')`,
    );
    const orphaning = bundleWith([
      {
        tag: '0001_verliert',
        sql: [
          'PRAGMA foreign_keys=OFF;',
          'CREATE TABLE `__new_dogs` (`id` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `created_at` text NOT NULL, `updated_at` text NOT NULL);',
          'INSERT INTO `__new_dogs` SELECT `id`, `name`, `created_at`, `updated_at` FROM `dogs` WHERE 0;',
          'DROP TABLE `dogs`;',
          'ALTER TABLE `__new_dogs` RENAME TO `dogs`;',
          'PRAGMA foreign_keys=ON;',
        ].join('\n--> statement-breakpoint\n'),
      },
    ]);
    expect(() => runMigrations(db, orphaning)).toThrow('hinterlässt 1 verwaiste Verweise');
    expect(db.all(sql`SELECT id FROM dogs`)).toEqual([{ id: 'd1' }]);
    expect(db.get<{ foreign_keys: number }>(sql`PRAGMA foreign_keys`)).toEqual({ foreign_keys: 1 });
  });

  it('brechen ab, wenn eine Migration im Bündel fehlt', async () => {
    const db = await createTestDb();
    const missing: MigrationBundle = {
      journal: { entries: [...migrations.journal.entries, { idx: 1, tag: '0001_fehlt' }] },
      migrations: migrations.migrations,
    };
    expect(() => runMigrations(db, missing)).toThrow('Migration fehlt im Bündel: 0001_fehlt');
  });
});
