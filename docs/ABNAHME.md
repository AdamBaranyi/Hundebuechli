# Abnahme

Die Punkte aus Abschnitt 13 des Auftrags, Stand 23.09.2026 nach Tag 5. «Erfüllt» heisst belegt –
durch einen Test, der bei jedem Push läuft, oder durch einen Eintrag im Geräteprotokoll. Was offen
ist, nennt sein Hindernis.

| Punkt | Stand | Beleg oder Hindernis |
|---|---|---|
| Im Flugmodus auf dem iPhone: Hund, Eintrag, Medikament, Gewicht, Tagebuch mit Foto, Dokument, drei PDFs teilen und in «Dateien» sichern | teilweise | Hund, Eintrag und Medikament im Protokoll (Runden 1 und 2); Gewicht, Tagebuch, Dokument und PDFs warten auf Runde 3 am iPhone |
| App beenden und neu starten: alle Daten da | erfüllt | Geräteprotokoll 1.11 (23.09.2026) |
| Erinnerung pünktlich bei geschlossener App; Tippen öffnet den Eintrag; «Erledigt» plant die nächste Fälligkeit | teilweise | pünktlich: Protokoll 2.1; Tippen und «Erledigt» in der Mitteilung warten auf Runde 2 (2.3 bis 2.5); die Wirkung von «Erledigt» ist in Jest geprüft |
| Tests des Benachrichtigungsplans: Grenze, Reihenfolge, Idempotenz, Sommerzeit, Monatsende | erfüllt | `src/domain/__tests__/notifications.test.ts`, `src/notifications/__tests__/sync.test.ts` – auch die Sprungstunde im März |
| Ein Deep Link von aussen kann nichts erledigen, ändern oder löschen | erfüllt | `src/features/__tests__/deep-links.test.tsx`: sechs Ziele, Schnappschuss aller Tabellen vorher und nachher |
| Feindselige Eingaben erscheinen im PDF als Text; keine externe Adresse | erfüllt | `src/pdf/__tests__/templates.test.ts`, `e2e/pdf.spec.ts` |
| Fotos ohne EXIF und GPS; die Prüfung verwirft ein Testbild mit GPS | erfüllt | `src/domain/__tests__/jpeg-metadata.test.ts`, `src/photos/__tests__/import-photo.test.ts`, `e2e/hunde.spec.ts` liest das gespeicherte Bild zurück |
| Löschen eines Hundes hinterlässt weder Zeilen noch Dateien noch Benachrichtigungen | erfüllt | Repository-Tests (Löschkaskade samt Dateipfaden), `sync.test.ts` (keine Benachrichtigung bleibt), `everything.test.ts` |
| Keine Netzwerkanfrage; die Release-APK verlangt nur Berechtigungen auf der Liste | teilweise | App: Lint-Regel und Browsertest. APK: Die Probe-APK vom 23.09.2026 (Lauf 35888448387) verlangt genau Kamera, Benachrichtigungen, Neustart, Vibration und Wake Lock, kein Internet; die signierte Release-APK braucht den Keystore und durchläuft dieselbe Prüfung |
| VoiceOver: Hauptablauf bedienbar | erfüllt | Geräteprotokoll 1.14 (Adam, zusammenfassend) |
| Grösste Systemschrift: nichts abgeschnitten; im Web bei 200 % Zoom | erfüllt | Geräteprotokoll 1.12; Web: Umbruch bei 320 px ohne Querscrollen (entspricht 400 % Zoom) |
| Keine Schrift unter 16, keine Tippfläche unter 48, Kontraste aus den Tokens | erfüllt | Jest (`tokens.test.ts`, `textSizes`) und Playwright je Bildschirm |
| Playwright bei 320, 768 und 1440 grün samt axe, Schrift, Querscrollen, Tastatur, reduzierter Bewegung; `test:e2e:browsers` grün vor dem Deploy | erfüllt | CI bei jedem Push (78 Tests); `test:e2e:browsers` 156 von 156 am 23.09.2026 |
| APK aus einem Tag in der CI, signiert, als Release-Anhang | offen | Workflow baut und prüft (Probe-APK 33 MB in 16 Minuten); es fehlen der Keystore und die vier Secrets (Adam, `docs/RELEASE.md`) und ein Tag `v0.1.0` mit Adams OK |
| Kaltstart bis zur Übersicht und Tierarzt-PDF mit sechs Fotos, gemessen auf dem iPhone, Median aus fünf Läufen | offen | braucht das iPhone ohne Entwicklermodus (`bunx expo start --no-dev --minify`); Anleitung in `docs/GERAETETEST.md`, Runde 4 |
| `expo install --check`, keine Datei über 400 Zeilen, Format, Lint, Typecheck, Tests, täglicher Sicherheitslauf | erfüllt | CI und `sicherheit-taeglich.yml`; Ausnahmen namentlich in `docs/SECURITY.md` |

## Ausserdem offen

- **Hosting der Web-Vorschau:** Subdomain beim Webhosting oder eigener Server – Adams Entscheid.
  Der Export mit Content Security Policy und `.htaccess` liegt fertig vor (`bun run export:web`).
- **SDK-Patches:** Acht Pakete haben neuere Patch-Fassungen (expo, expo-asset, expo-constants,
  expo-image-manipulator, expo-image-picker, expo-notifications, expo-router, expo-sharing). Sie
  werden übernommen, sobald jede älter als sieben Tage ist; die jüngsten erschienen am 18.09.2026,
  also ab dem 25.09.2026 (`docs/RELEASE.md`, «SDK-Patch»).
- **Zwei Wochen Alltag** mit den eigenen Hunden, festgehalten in `docs/ALLTAG.md`.
