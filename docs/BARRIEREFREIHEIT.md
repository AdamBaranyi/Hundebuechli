# Barrierefreiheit

Die App wird unterwegs benutzt: mit der Leine in der anderen Hand, in der Tierarztpraxis, abends
müde. Daraus folgen die Grenzen – und sie sind geprüft, nicht behauptet.

## Was gilt

| Grenze | Wie | Beleg |
|---|---|---|
| Schrift nie unter 16 pt, Fliesstext 17 | Tokens in `src/ui/tokens.ts`; `allowFontScaling` bleibt an | Jest (`textSizes`) je Baustein und Bildschirm; Playwright: keine Schrift unter 16 px |
| Grosse Systemschrift | Layouts brechen um, statt zu kürzen | Geräteprotokoll Runde 1 (grösste Stufe) |
| Tippflächen ab 48, Hauptaktionen 56 | Knöpfe, Zeilen, Chips, Stempelfeld 56 | Playwright: keine Tippfläche unter 48 × 48 |
| Kontrast: Text 4,5:1, Kanten 3:1 | aus den Tokens gerechnet, hell und dunkel | `src/ui/__tests__/tokens.test.ts` |
| Zustand nie nur über Farbe | «fällig» mit Zeichen und Text, Stempel mit Datum im Text der Zeile | Bildschirme, axe |
| VoiceOver und TalkBack | Rolle, Name und Zustand je Bedienelement; Überschriften ausgezeichnet; Ansage nach Sichern, Erledigen und Löschen | Jest (Rollen und Namen), Geräteprotokoll |
| Die Gewichtskurve hat ein Gegenstück | Tabelle mit denselben Zahlen, erreichbar über denselben Umschalter | Jest, Playwright |
| Reduzierte Bewegung | Der Stempel blendet nur ein, keine Drehung; die Haptik bleibt | Jest mit Gegenprobe; Playwright: keine Animation |
| Tastatur im Browser | jedes Bedienelement erreichbar, sichtbarer Fokus | Playwright in Chrome, Safari (WebKit) und Firefox |
| Dunkler Modus | nach Systemeinstellung, kontrastgeprüft | Tokens-Test, Geräteprotokoll |
| Umbruch bei 320 px | kein Querscrollen; entspricht 400 % Zoom bei 1280 px | Playwright bei 320, 768 und 1440 |

Jeder Bildschirm der Web-Vorschau läuft zusätzlich durch axe (WCAG 2.0 bis 2.2, A und AA), in
Chrome bei jedem Push und vor jedem Deploy in Safari und Firefox.

## Was nur das Gerät zeigt

Screenreader, grösste Systemschrift und Haptik lassen sich im Browser nicht echt prüfen. Diese
Punkte stehen im Geräteprotokoll (`docs/GERAETETEST.md`) mit Datum und Beobachtung.

## Bekannte Grenzen

- **Zoom bei Dokumenten nur unter iOS:** Dort vergrössert die ScrollView mit zwei Fingern; unter
  Android und im Browser bleibt es beim Vollbild (E-60).
- **Kein Fadenkreuz auf der Kurve:** Der Entwurf zeigt den Wert beim Berühren; die Tabelle zeigt
  dieselben Zahlen für alle, auch für Screenreader.
- **Der Druck im Browser** nutzt die Systemschrift statt Atkinson Hyperlegible Next.
