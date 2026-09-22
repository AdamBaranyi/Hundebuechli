import { drizzle } from 'drizzle-orm/sql-js';
import initSqlJs, { type SqlJsStatic } from 'sql.js';

import { runMigrations } from './migrate';
import migrations from './migrations/migrations';
import * as schema from './schema';
import type { Db } from './types';

let sqlJs: Promise<SqlJsStatic> | undefined;

/**
 * Frische Datenbank für einen Test: sql.js im Speicher, mit denselben
 * Migrationen wie auf dem Gerät und in der Web-Vorschau. Nur für Tests.
 */
export async function createTestDb(): Promise<Db> {
  sqlJs ??= initSqlJs();
  const SQL = await sqlJs;
  const sqlite = new SQL.Database();
  sqlite.exec('PRAGMA foreign_keys = ON;');
  const db: Db = drizzle(sqlite, { schema });
  runMigrations(db, migrations);
  return db;
}
