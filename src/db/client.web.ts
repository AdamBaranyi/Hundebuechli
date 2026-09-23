import { drizzle } from 'drizzle-orm/sql-js';
import { Asset } from 'expo-asset';
import initSqlJs from 'sql.js';
import wasm from 'sql.js/dist/sql-wasm-browser.wasm';

import { loadDemoData } from '@/demo/demo-data';
import { loadDemoPhotos } from '@/demo/demo-photos';
import { toLocalDate } from '@/domain/local-date';
import { photoStore } from '@/files/photo-store';

import { runMigrations } from './migrate';
import migrations from './migrations/migrations';
import * as schema from './schema';
import type { Db, OpenDatabase } from './types';

/** `?leer` in der Adresse startet ohne Beispieldaten – für die Browsertests. */
function startsEmpty(): boolean {
  return new URLSearchParams(window.location.search).has('leer');
}

/**
 * Web-Vorschau: SQLite als WebAssembly, nur im Arbeitsspeicher. Jeder Besuch
 * beginnt frisch mit Bäri und Mila, im Browser bleibt nichts zurück. Die
 * .wasm-Datei kommt vom eigenen Ursprung.
 */
export const openDatabase: OpenDatabase = async () => {
  const wasmUri = Asset.fromModule(wasm).uri;
  const SQL = await initSqlJs({ locateFile: () => wasmUri });
  const sqlite = new SQL.Database();
  sqlite.exec('PRAGMA foreign_keys = ON;');
  const db: Db = drizzle(sqlite, { schema });
  runMigrations(db, migrations);
  if (!startsEmpty()) {
    loadDemoData(db, toLocalDate(new Date()), await loadDemoPhotos(photoStore));
  }
  return db;
};
