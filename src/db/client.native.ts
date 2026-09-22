import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import { runMigrations } from './migrate';
import migrations from './migrations/migrations';
import * as schema from './schema';
import type { Db, OpenDatabase } from './types';

const FILE_NAME = 'hundebuechli.db';

/**
 * Gerät: SQLite-Datei im Dokumentverzeichnis der App. Fremdschlüssel sind in
 * SQLite ab Werk aus; ohne sie bliebe beim Löschen eines Hundes etwas zurück.
 */
export const openDatabase: OpenDatabase = async () => {
  const sqlite = openDatabaseSync(FILE_NAME);
  sqlite.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const db: Db = drizzle(sqlite, { schema });
  runMigrations(db, migrations);
  return db;
};
