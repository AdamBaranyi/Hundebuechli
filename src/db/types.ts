import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type * as schema from './schema';

export type Schema = typeof schema;

/**
 * Die Datenbank, wie sie die Repositories sehen. expo-sqlite (Gerät) und
 * sql.js (Web-Vorschau, Tests) arbeiten beide synchron und passen auf diesen
 * Typ; die Zuweisung in client.native.ts, client.web.ts und testing.ts prüft
 * das bei jedem Typecheck.
 */
export type Db = BaseSQLiteDatabase<'sync', unknown, Schema>;

export type OpenDatabase = () => Promise<Db>;
