import { sql } from 'drizzle-orm';

import type { Db } from './types';

/** Das Bündel, das drizzle-kit mit `driver: 'expo'` als migrations.js schreibt. */
export type MigrationBundle = {
  journal: { entries: readonly { idx: number; tag: string }[] };
  migrations: Record<string, string>;
};

const BREAKPOINT = '--> statement-breakpoint';
const FOREIGN_KEYS_OFF = /^PRAGMA\s+foreign_keys\s*=\s*(OFF|0)\s*;?$/i;
const FOREIGN_KEYS_ON = /^PRAGMA\s+foreign_keys\s*=\s*(ON|1)\s*;?$/i;

/**
 * Wendet alle noch fehlenden Migrationen an, jede in einer eigenen
 * Transaktion. Derselbe Weg für expo-sqlite und sql.js; drizzles eigener
 * Migrator für sql.js liest Dateien vom Datenträger und läuft im Browser nicht.
 *
 * Baut eine Migration eine Tabelle neu, setzt drizzle-kit die Prüfung der
 * Fremdschlüssel aus. Innerhalb einer Transaktion wirkt das in SQLite nicht;
 * darum geschieht es davor und danach, mit einer Prüfung am Schluss.
 *
 * @returns die Anzahl der neu angewandten Migrationen
 */
export function runMigrations(db: Db, bundle: MigrationBundle): number {
  db.run(
    sql`CREATE TABLE IF NOT EXISTS __migrations (idx INTEGER PRIMARY KEY, tag TEXT NOT NULL, applied_at TEXT NOT NULL)`,
  );
  const applied = new Set(
    db.all<{ idx: number }>(sql`SELECT idx FROM __migrations`).map((row) => row.idx),
  );
  const pending = [...bundle.journal.entries]
    .filter((entry) => !applied.has(entry.idx))
    .sort((a, b) => a.idx - b.idx);

  for (const entry of pending) {
    applyMigration(db, entry, statementsOf(bundle, entry));
  }
  return pending.length;
}

function statementsOf(bundle: MigrationBundle, entry: { idx: number; tag: string }): string[] {
  const source = bundle.migrations[`m${String(entry.idx).padStart(4, '0')}`];
  if (source === undefined) throw new Error(`Migration fehlt im Bündel: ${entry.tag}`);
  return source
    .split(BREAKPOINT)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

function applyMigration(db: Db, entry: { idx: number; tag: string }, statements: string[]) {
  const rebuildsTables = statements.some((s) => FOREIGN_KEYS_OFF.test(s));
  const body = statements.filter((s) => !FOREIGN_KEYS_OFF.test(s) && !FOREIGN_KEYS_ON.test(s));

  if (rebuildsTables) db.run(sql`PRAGMA foreign_keys = OFF`);
  try {
    db.transaction((tx) => {
      for (const statement of body) tx.run(sql.raw(statement));
      // Innerhalb der Transaktion: Ein Fund rollt die ganze Migration zurück.
      const broken = tx.all(sql`PRAGMA foreign_key_check`);
      if (broken.length > 0) {
        throw new Error(`Migration ${entry.tag} hinterlässt ${broken.length} verwaiste Verweise.`);
      }
      tx.run(
        sql`INSERT INTO __migrations (idx, tag, applied_at) VALUES (${entry.idx}, ${entry.tag}, ${new Date().toISOString()})`,
      );
    });
  } finally {
    if (rebuildsTables) db.run(sql`PRAGMA foreign_keys = ON`);
  }
}
