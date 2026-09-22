const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Migrationen von drizzle-kit liegen als .sql-Dateien neben migrations.js.
config.resolver.sourceExts.push('sql');

// Die Web-Vorschau lädt SQLite als WebAssembly (sql.js). Die .wasm-Datei wird
// als eigene Datei ausgeliefert, vom eigenen Ursprung, nie von einem CDN.
config.resolver.assetExts.push('wasm');

module.exports = config;
