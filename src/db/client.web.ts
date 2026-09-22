import { drizzle } from 'drizzle-orm/sql-js';
import { Asset } from 'expo-asset';
import initSqlJs from 'sql.js';
import wasm from 'sql.js/dist/sql-wasm-browser.wasm';

import { runMigrations } from './migrate';
import migrations from './migrations/migrations';
import * as schema from './schema';
import type { Db, OpenDatabase } from './types';

/**
 * Web-Vorschau: SQLite als WebAssembly, nur im Arbeitsspeicher. Jeder Besuch
 * beginnt frisch, im Browser bleibt nichts zurück. Die .wasm-Datei kommt vom
 * eigenen Ursprung.
 */
export const openDatabase: OpenDatabase = async () => {
  const wasmUri = Asset.fromModule(wasm).uri;
  const SQL = await initSqlJs({ locateFile: () => wasmUri });
  const sqlite = new SQL.Database();
  sqlite.exec('PRAGMA foreign_keys = ON;');
  const db: Db = drizzle(sqlite, { schema });
  runMigrations(db, migrations);
  return db;
};
