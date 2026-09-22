/**
 * Metro wählt je Plattform client.native.ts (Gerät) oder client.web.ts
 * (Web-Vorschau). Diese Datei gilt nur für TypeScript und Jest; beide
 * Fassungen erfüllen denselben Typ OpenDatabase aus types.ts.
 */
export { openDatabase } from './client.native';
