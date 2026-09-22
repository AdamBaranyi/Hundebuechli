// SQL der Migrationen: babel-plugin-inline-import setzt den Text beim
// Übersetzen ein (babel.config.js).
declare module '*.sql' {
  const content: string;
  export default content;
}

// sql.js als WebAssembly für die Web-Vorschau: Metro liefert die Datei als
// Asset aus (metro.config.js), expo-asset nennt die Adresse.
declare module '*.wasm' {
  const asset: number;
  export default asset;
}
