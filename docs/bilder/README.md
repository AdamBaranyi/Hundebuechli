# Bilder für die Website

Drei Bildschirme von Hundebüechli, Stand 23. September 2026, Bau an Tag 4 von 5. iPhone-Hochformat
(390 × 844 Punkte, dreifache Auflösung: 1170 × 2532 Pixel), hell, als PNG und WebP. Die Hunde Bäri
und Mila sind erfundene Beispieldaten; die Fotos stehen unter CC0 (Quellen in
`assets/demo/QUELLEN.md`). Aufgenommen aus der Web-Vorschau, die dieselben Bausteine und dieselbe
Schrift zeigt wie die App; darum fehlt oben die Statusleiste des iPhones. Neu erzeugen:
`bun run export:web`, dann `node scripts/screens.mjs`.

| Datei | Bildschirm | Bildunterschrift |
|---|---|---|
| `hundebuechli-als-naechstes` | «Als Nächstes» | Was heute ansteht, über alle Hunde. Ein Tipp aufs Feld stempelt: Der überfällige Zeckenschutz ist erledigt, die Tablette um 8 Uhr gegeben. |
| `hundebuechli-hundeprofil` | Hundeprofil | Bäri auf einen Blick: Chipnummer zum Kopieren, die Tierarztpraxis mit einem Tipp am Telefon. |
| `hundebuechli-gewicht` | Gewicht | Milas Gewicht seit sie aus dem Tierschutz kam – als Kurve oder Tabelle, ohne Bewertung. |

## Was die App heute kann

Hundebüechli ist eine App für iPhone und Android, gebaut mit Expo und React Native. Sie
funktioniert ganz ohne Netz und ohne Konto; alle Daten bleiben auf dem Gerät. Getestet wird sie auf
dem iPhone; die Android-Fassung folgt an Tag 5 als APK.

- **Hunde** mit Profil, Foto, Chipnummer, Tierarztpraxis, Versicherung, Futter und Hinweisen. Fotos
  verlieren beim Speichern ihre Standortdaten.
- **Impfungen, Entwurmung, Zeckenschutz und Tierarztbesuche** mit nächster Fälligkeit. «Als
  Nächstes» zeigt, was überfällig ist, was heute und diese Woche ansteht; ein Tipp stempelt es als
  erledigt, und die nächste Fälligkeit rechnet die App selbst.
- **Erinnerungen** auf dem Sperrbildschirm, auch bei geschlossener App. Die App leitet sie aus den
  Einträgen ab und hält sie bei jeder Änderung aktuell; auf dem iPhone kam die erste Erinnerung
  pünktlich.
- **Medikamente** mit Uhrzeiten und «Gegeben», **Gewicht** mit Kurve und Tabelle, **Tagebuch** und
  **Dokumente** mit Fotos.
- **Drei PDFs** zum Teilen: für die Tierarztpraxis, für den Hundesitter und ein Vermisst-Plakat mit
  Abreissstreifen.
- Barrierefrei gebaut: Schrift nie unter 16 Punkt, grosse Systemschrift, VoiceOver, dunkler Modus,
  reduzierte Bewegung.

## Wo der Bau steht

Tag 4 von 5 ist gebaut. Geprüft wird bei jedem Push: 284 Jest-Tests (Fälligkeiten, der Plan der
Erinnerungen mit Zeitumstellung und Monatsende, PDFs mit feindseligen Eingaben, Löschen samt
Dateien) und 75 Browserprüfungen in drei Breiten mit axe, Schriftgrösse, Tastatur und Content
Security Policy. Auf dem iPhone geprüft sind Tag 1 und 2 und die Erinnerungen von Tag 3; der Rest
von Tag 3 und die PDFs von Tag 4 kommen als Nächstes aufs Gerät.

## Was noch kommt

- **Tag 5:** Die Web-Vorschau zum Ausprobieren im Browser, startet mit den Beispielhunden; die
  Android-App als APK aus GitHub Actions, samt Prüfung, dass sie nur die nötigen Berechtigungen
  verlangt; Dokumentation und Fallstudie.
- **Danach zwei Wochen Alltag** mit meinen eigenen zwei Whippets. Was dabei auffällt, fliesst in
  die App und in die Fallstudie.
- **Später:** Synchronisation im Haushalt, damit zwei Menschen sehen, ob die Tablette schon gegeben
  ist.
