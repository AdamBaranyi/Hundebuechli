import { defineConfig } from 'drizzle-kit';

// Ein Schema, ein Migrationsbündel für drei Umgebungen: expo-sqlite auf dem
// Gerät, sql.js in der Web-Vorschau und in den Tests. `driver: 'expo'` lässt
// drizzle-kit zusätzlich migrations.js schreiben, das die SQL-Dateien bündelt.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
});
