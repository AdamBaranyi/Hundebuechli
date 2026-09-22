// Babel für Metro (App und Web-Export) und für Jest. Die SQL-Dateien der
// Migrationen werden beim Übersetzen als Text eingesetzt; so tragen App,
// Web-Vorschau und Tests dasselbe Migrationsbündel (src/db/migrations).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
