# Hundebüechli – Gestaltung

Freigegeben am 22.09.2026. Gilt für die App (Expo, React Native) und die Web-Vorschau. Der
bedienbare Prototyp mit neun Bildschirmen liegt nicht in diesem Repository; die Werte aus
seiner `css/tokens.css` stehen in `src/ui/tokens.ts`, die Prüfung gegen KI-Muster in
`docs/PRUEFUNG-GESTALTUNG.md`.

## Umsetzung in der App

Wo React Native vom Entwurf abweicht, entscheidet die App nahe am Entwurf; jede Abweichung
steht nummeriert in `docs/ENTSCHEIDE.md`.

| Stelle | Entwurf | App | Entscheid |
|---|---|---|---|
| Tippflächen | Chips und Umschalter 44 | überall mindestens 48, Hauptaktionen 56 | E-15 |
| Chipnummer | «756 0981 2345 678» (14 Ziffern, Tippfehler) | 15 Ziffern in Gruppen 3-4-4-4 | E-16 |
| Schrift | Google Fonts im Browser | vier Schnitte als Dateien im Bundle, Schnitt im Namen | E-14 |
| Tab-Leiste | native Leiste mit 16 pt | `labelStyle` erlaubt 16 pt laut Doku SDK 57; Beleg auf dem Gerät an Tag 2 | E-17 |
| Farben, Radien, Abstände | `css/tokens.css` | unverändert in `src/ui/tokens.ts`, Kontraste als Tests | – |


## Auftrag

- **Gegenstand:** eine App, die das Büchlein des Hundes aufs Handy bringt – Impfungen,
  Entwurmung, Zecken- und Flohschutz, Tierarztbesuche, Medikamente, Gewicht, Dokumente – und
  rechtzeitig erinnert.
- **Für wen:** Hundehalterinnen und Hundehalter in der Schweiz zwischen 25 und 70, Adam
  eingeschlossen. Sie schauen kurz aufs Handy, oft unterwegs, die Leine in der anderen Hand.
- **Hauptaufgabe der Oberfläche:** auf einen Blick zeigen, was fällig ist, und es mit einem Tipp
  erledigen. Danach: alles zum Hund griffbereit, auch ohne Netz, in der Tierarztpraxis, beim
  Hundesitter, im Notfall.
- **Wünsche von Adam:** modern und passend, kein KI-Standard, Schrift ab 16 pt, barrierefrei.

## Idee in einem Satz

**Jede Erledigung ist ein Stempel.** Im echten Büechli stempelt die Tierarztpraxis jede Impfung.
In der App wartet jeder fällige Eintrag auf seinen Stempel: ein gestricheltes Stempelfeld, das
beim Erledigen zum Stempel mit Datum wird. Über das Jahr ergibt das eine Stempelreihe, an der man
sieht, ob man regelmässig war. Alles andere bleibt ruhig.

## Grundsätze

1. **Ein Stempel pro Erledigung.** Das Stempelfeld ist das wiederkehrende Motiv und der einzige
   bewegte Moment. Keine weiteren Effekte.
2. **Farbe nur, wenn etwas zu tun ist.** Die App ist Graphit auf Weiss. Karmin erscheint nur bei
   «fällig» und «überfällig» – und in der Marke. Wer die App öffnet und kein Rot sieht, weiss:
   nichts zu tun.
3. **Native Leisten, eigene Inhalte.** Tab-Leiste und Navigationsleisten liefert das System
   (unter iOS 26 Liquid Glass, unter Android Material 3). Der Inhalt trägt die eigene Handschrift.
4. **Mit einer Hand, mit einem Blick.** Fliesstext 17 pt, Tippflächen ab 48, Hauptaktion unten.
5. **Zustand nie nur über Farbe.** «Fällig» steht immer als Text da, überfällig zusätzlich mit
   Zeichen. Das Stempelfeld unterscheidet sich in der Form: gestrichelt offen, voll erledigt.
6. **Das Foto des echten Hundes ist das einzige Bild.** Keine Pfotenabdrücke, keine Knochen,
   keine Comic-Hunde, keine Verläufe.

## Farben

Zwei Modi, jeder mit eigenen, geprüften Werten – kein automatisches Umdrehen.

| Name | Hell | Dunkel | Rolle |
|---|---|---|---|
| Kiesel | `#EEF0EC` | `#000000` | Grund der App |
| Blatt | `#FFFFFF` | `#1B1D1B` | Flächen (Blätter mit Zeilen) |
| Graphit | `#1D2420` | `#F1F3EF` | Text, Hauptaktion, Stempel |
| Bleistift | `#59625C` | `#A9B0AA` | Nebentext |
| Feldrand | `#858E88` | `#7D857F` | Kanten von Eingabefeldern und Knöpfen |
| Linie | `#DCE0DA` | `#2F332F` | Trennlinien, nur Schmuck |
| Karmin | `#B3223F` | `#F76E82` | Marke, «fällig», «überfällig» |

**Geprüfte Kontraste** (WCAG, gerechnet mit `validate_palette.js` aus dem Skill `dataviz`):
Graphit auf Blatt 15,8:1 · Bleistift auf Blatt 6,3:1, auf Kiesel 5,5:1 · Karmin auf Blatt 6,5:1,
auf Kiesel 5,7:1 · Feldrand auf Blatt 3,4:1 (Feldkanten brauchen 3:1) · Weiss auf Graphit 15,8:1.
Dunkel: Text auf Blatt 15,2:1 · Nebentext 7,7:1 · Karmin 6,1:1 · Feldrand 4,5:1.
Feldrand erreicht auf Kiesel nur 2,9:1 – Eingabefelder stehen deshalb immer auf einem Blatt.

**Warum Karmin und nicht Braun:** Der erste Plan hatte Leder-Braun für Stempel und Marke und Rot
für «fällig». Der Prüfer zeigte ΔE 0,7 zwischen beiden unter Protanopie und 11 bei normalem Sehen
– verwechselbar. Jetzt ist der Stempel Graphit (wie Stempeltinte) und Karmin die einzige Farbe.
Karmin statt Zinnober, weil ein oranges Rot auf Schwarz genau das KI-Muster «fast schwarz mit
einem leuchtenden Akzent» wäre.

## Schrift

**Atkinson Hyperlegible Next** (Braille Institute, SIL OFL), eine Familie für alles. Entwickelt
für Lesbarkeit bei eingeschränkter Sicht: Buchstaben wie I, l und 1 oder 0 und O sind klar
verschieden. Auf dem Spaziergang, in der Sonne, mit einem kurzen Blick sieht niemand gut.

| Stufe | Grösse / Zeile | Schnitt | Einsatz |
|---|---|---|---|
| Anzeige | 48 / 52 | 800 | Name des Hundes, aktuelles Gewicht |
| Grosser Titel | 32 / 38 | 800 | Titel der Hauptbildschirme |
| Titel | 24 / 30 | 700 | Blatt-Überschriften in Formularen |
| Zwischentitel | 20 / 26 | 700 | Abschnitte («Heute», «Diese Woche») |
| Text | 17 / 24 | 400, 700 | Zeilen, Formulare |
| Nebentext | 16 / 22 | 400, 500 | Datum, Hund, Hinweise – die Untergrenze |

Überall Satzschreibung, keine Versalien. Ziffern in Tabellen und Uhrzeiten tabellarisch
(`fontVariant: ['tabular-nums']`), grosse Einzelzahlen proportional. Die Schrift wirkt mit
der Systemgrösse (`allowFontScaling`); der Prototyp zeigt 100 %, 135 % und 200 %.

## Form und Raum

- **Raster:** 4 pt. Seitenrand 16, Innenabstand der Blätter 16, Abstand zwischen Abschnitten 32.
- **Radien nach Rang, nicht einer für alles:** Blatt 20 · Foto 24 · Eingabefeld 14 · Knopf und
  Chip als Kapsel · Avatar und Stempel rund.
- **Keine Schatten.** Tiefe entsteht durch Kiesel unter Blatt und durch das Foto; die Leisten des
  Systems bringen ihr eigenes Glas mit.
- **Zeilen statt Karten:** Einträge sind Zeilen auf einem Blatt, getrennt durch eine eingerückte
  Linie. Mindesthöhe 64, mit Stempelfeld 72.
- **Linksbündig.** Zentriert ist nur der leere Zustand.

## Bausteine

**Stempelfeld und Stempel** (Tippfläche 56 × 56):
- *offen* – gestrichelter Ring in Bleistift, darin klein das Stempel-Zeichen. Ohne das Zeichen
  wirkte der leere Kreis wie ein Ladekreis (Fund 4 in `PRUEFUNG.md`).
- *fällig* – gestrichelter Ring in Karmin; in der Zeile steht «heute fällig» oder «seit 4 Tagen
  überfällig» in Karmin, bei überfällig mit Ausrufezeichen im Kreis.
- *erledigt* – voller Doppelring in Graphit, leicht gedreht (je Eintrag fest zwischen −8° und
  +4°, aus der ID abgeleitet), innen das Datum «22.9.» in 16 pt, Schnitt 800.
- *gegeben* (Medikament) – derselbe Stempel mit Uhrzeit «08:04».
- VoiceOver: «Entwurmung für Bäri als erledigt stempeln», danach «Erledigt am 22. September».

**Zeile:** links ein Linien-Symbol (24, Graphit, ohne farbigen Hintergrundkreis), Titel 17/700,
darunter Hund und Zustand in 16. Rechts das Stempelfeld oder ein Pfeil zur Detailansicht.

**Knöpfe:** Hauptaktion Graphit gefüllt, Text weiss 17/700, Höhe 56, volle Breite. Zweitaktion:
Kante 2 px Graphit. Textknopf 17/700 Graphit. Kein Pfeil im Knopftext.

**Chips** (Intervall, Vorschläge): Kapsel, Höhe 44, Kante Feldrand; gewählt Graphit gefüllt mit
Haken.

**Eingabefeld:** Beschriftung darüber (16/500 Bleistift), Feld 52 hoch, Kante 1,5 Feldrand,
Fokus 2 px Graphit mit 2 px Abstand.

**Hundewahl:** runde Fotos 56 mit Namen darunter; gewählt mit Ring 3 px Graphit und fettem Namen.

**Tab-Leiste:** drei Einträge – «Als Nächstes» (Stempel), «Hunde» (Hundemarke), «Einstellungen»
(Regler). Nativ über `expo-router/unstable-native-tabs` (SDK 57), unter iOS mit SF Symbols
`seal`, `tag`, `slider.horizontal.3`. **Achtung Schriftgrösse:** Die Systemleiste beschriftet in
rund 10 pt. Die Beschriftung auf 16 pt setzen, falls die native Leiste das erlaubt; sonst eine
eigene Leiste mit 16 pt bauen und die Abweichung in `docs/ENTSCHEIDE.md` begründen. Adams Regel
«Schrift ab 16» geht vor dem Systemlook. Der aktive Eintrag trägt eine Kapsel in der Farbe
Linie; die Blattfarbe war im dunklen Modus auf dem Glas nicht zu sehen.

**Glas nur für Leisten über Inhalt:** Tab-Leiste und Knöpfe über dem Foto. Wo kein echtes Liquid
Glass wirkt (Web-Vorschau, ältere Systeme), ist die Leiste mindestens 90 % deckend: Bei 72 % fiel
die graue Beschriftung über dem weissen Plakat auf 2,6:1 (axe-Befund im Lauf).

**Gedrückt:** Jede Tippfläche antwortet sofort – Zeilen, Chips, Kacheln und Zweitknöpfe mit der
Fläche «Gedrückt» (`#E6E9E4` hell, `#2A2D2A` dunkel), Hauptknopf mit 82 % Deckkraft, Stempelfeld
mit `scale 0.94` in 120 ms. In React Native der `pressed`-Stil von `Pressable`. Hover nur mit Maus.

**Zustände** (`screens/zustaende.html`): *Nichts fällig* mit grossem leerem Stempelfeld und dem
nächsten Termin; *Erinnerungen ausgeschaltet* als ruhiger Hinweis mit «Einstellungen öffnen»;
*Fehler im Formular* mit Karmin-Rand, Zeichen und einem Satz, der sagt, was zu tun ist; *Rückfrage
vor dem Löschen*, die nennt, was verschwindet.

**Lange Wörter:** Bei 200 % Schrift ist ein Wort wie «Dokumente» breiter als die Zeile. Titel
trennen deshalb nach deutschen Regeln; in React Native bricht `Text` lange Wörter selbst um,
unter Android zusätzlich `android_hyphenationFrequency`.

## Die fünf Kernbildschirme

**Als Nächstes** – grosser Titel, Datum, Hundewahl. Oben «Überfällig» (nur wenn etwas überfällig
ist), dann «Heute» mit den Medikamenten als Fahrplan (Uhrzeit links, tabellarisch), dann «Diese
Woche» und «Später». Erledigte Zeilen bleiben an ihrem Platz, bis der Bildschirm neu geöffnet
wird – nichts springt unter dem Finger weg.

```
Als Nächstes
Dienstag, 22. September
(Alle) (Bäri) (Mila)
Überfällig
┌──────────────────────────────────┐
│ ⚕ Zeckenschutz            ( ! )  │ Karmin, gestrichelt
│   Mila, seit 2 Tagen überfällig  │
└──────────────────────────────────┘
Heute
┌──────────────────────────────────┐
│ 08:00  Apoquel 16 mg      ( 8:04)│ gestempelt
│        Mila, halbe Tablette      │
│ 18:00  Apoquel 16 mg      (    ) │ offen
└──────────────────────────────────┘
Diese Woche
┌──────────────────────────────────┐
│ ⚕ Entwurmung              (    ) │
│   Bäri, fällig am Freitag, 25.9. │
└──────────────────────────────────┘
[ Als Nächstes | Hunde | Einstellungen ]  (nativ)
```

**Hund** – das Foto randlos oben unter der durchsichtigen Navigationsleiste, darüber ein Blatt
mit dem Namen in 48/800, Rasse und Alter, zwei Schnellzugriffe (Chipnummer kopieren,
Tierarztpraxis anrufen). Dann **«Das Jahr in Stempeln»**: je Behandlung eine Reihe über zwölf
Monate – voller Punkt erledigt, gestrichelter Ring fällig, Karmin überfällig –, darunter eine
Legende. Die ganze Reihe ist die Tippfläche zur Geschichte dieser Behandlung. Danach die
Abschnitte Gesundheit, Medikamente, Gewicht (mit Kleinkurve), Tagebuch, Dokumente, PDF.

**Eintrag erfassen** – Blatt von unten: für welchen Hund, Art als vier grosse Kacheln, Datum,
Produkt mit Vorschlägen, «Nächste Fälligkeit» als Chips (1, 3, 6, 12, 36 Monate, Datum wählen),
darunter in Worten, wann erinnert wird. Hauptaktion «Sichern» unten.

**Gewicht** – aktuelles Gewicht als Anzeige (48/800, proportionale Ziffern), Messdatum,
Veränderung neutral in Worten («0,6 kg mehr als im Juni» – die App bewertet nicht). Umschalter
Kurve / Tabelle. Kurve nach `dataviz`: Linie 2 px Graphit, Punkte 8 px mit 2-px-Ring in der
Blattfarbe, drei Gitterlinien als Haarlinien, keine Legende (eine Serie, der Titel nennt sie),
nur der letzte Wert beschriftet, Fadenkreuz mit Wert beim Berühren, Tabelle als Gegenstück.

**Dokumente und PDFs** – Dokumente nach Art mit Seitenvorschau, alles liegt auf dem Gerät.
Das Vermisst-Plakat: A4, druckfreundlich in Graphit auf Weiss, «Vermisst» in 800, grosses Foto,
Name, Merkmale, zuletzt gesehen, Chipnummer, Telefon, unten Abreissstreifen.

Dazu: Erststart mit dem Stempel als Marke, und die Erinnerung auf dem Sperrbildschirm.

## Bewegung (Skill `animate`)

- **Stempeln:** Häufigkeit gelegentlich (einige Male pro Woche) – darf sich bewegen. Zweck:
  Rückmeldung und Zustandswechsel. Der Stempel kommt leicht grösser und gedrehter herein und
  setzt sich: `scale 1.12 → 1`, `rotate −12° → Endwinkel`, `opacity 0 → 1`, 200 ms,
  `cubic-bezier(0.23, 1, 0.32, 1)`, nur `transform` und `opacity`, kein Nachfedern – ein Stempel
  federt nicht. Beim Aufsetzen `Haptics.notificationAsync(Success)`.
- **Rückgängig:** Stempel blendet in 150 ms aus (`opacity`, `scale → 0.96`), als Übergang,
  damit ein schneller Doppeltipp nicht neu startet.
- **Reduzierte Bewegung:** keine Skalierung, keine Drehung, nur Einblenden in 150 ms. Die Haptik
  bleibt, sie ist keine Bewegung.
- In React Native mit `react-native-reanimated` (`withTiming`, `Easing.bezier(0.23, 1, 0.32, 1)`,
  `useReducedMotion`).

## Symbole

Eigene Linien-Symbole auf 24er-Raster, Strich 2 px, runde Enden: Impfung (Spritze), Entwurmung
(Tablette), Zecken- und Flohschutz (Schild mit Tropfen), Tierarzt (Stethoskop), Medikament
(Kapsel), Gewicht (Waage), Tagebuch (Heft), Dokument (Blatt mit Ecke), Teilen, Glocke,
Hundemarke, Stempel, Telefon, Kopieren. Im Prototyp in `js/icons.js`; in der App als
`react-native-svg`-Komponenten.

## Marke

- **Stempel-Marke:** runder Doppelring in Karmin, im Ring «Hundebüechli», in der Mitte das Datum
  des Tages – der Erststart stempelt den heutigen Tag.
- **App-Symbol:** Karmin-Grund, darauf ein weisses Büchlein, leicht gedreht, mit einem
  Graphit-Stempel. Keine Pfote.

## Prüfung gegen das Übliche (zweiter Durchgang nach `frontend-design`)

Verglichen mit dem, was ein Generator für «Hunde-App» liefert (Orange oder Türkis, Karten mit
weichem Schatten, Pfoten, Comic-Hund, grosse Zahl mit Fortschrittsring, fünf Tabs mit
schwebendem Plus):

- **Geändert:** Braun und Rot als Paar verworfen (verwechselbar, siehe oben); Graphit-Stempel und
  Karmin als einzige Farbe.
- **Geändert:** Metazeilen mit Mittelpunkten (Hund · Datum) durch zwei Zeilen oder einen Satz
  ersetzt («Bäri, fällig am Freitag, 25.9.»).
- **Geändert:** Abschnittsköpfe in Satzschreibung statt der iOS-Versalien.
- **Geändert:** Dunkler Grund echtes Schwarz wie iOS, kein getöntes Fast-Schwarz.
- **Geändert:** «Vermisst» auf dem Plakat in Satzschreibung und 800 statt Versalien.
- **Verworfen:** eigene Farbe je Hund (Halsbandfarbe) – zu viel Farbe; das Foto unterscheidet die
  Hunde.
- **Geprüft und behalten:** grosse Zahl beim Gewicht – dort ist sie der Inhalt, nicht Schmuck.

`avoid-ai-design` lief im Erkennungsmodus über Quelltext und Bilder: kein P0, vier Funde behoben,
Einzelheiten in `PRUEFUNG.md`.

## Geprüft mit Playwright

`bun run test` (Chrome 320, 390, 768, 1440) und `bun run test:browsers` (WebKit auf iPhone SE,
iPhone 15, iPhone 15 Pro Max und iPad Pro 11, Chrome auf Pixel 7 und Galaxy S9+, Safari 1440,
Firefox 1440 und 390). Je Bildschirm, hell und dunkel: kein Querscrollen, keine Schrift unter
16 px, Tippflächen ab 44, axe ohne Befund, alle Bilder geladen, keine Konsolenfehler. Dazu
Stempel und Rückgängig, reduzierte Bewegung, Tastaturfokus, Fälligkeit mit Monatsende, Kurve
gleich Tabelle, 135 % und 200 % Schrift. **Stand 22.09.2026: 579 Prüfungen, alle grün.**
Bildschirmfotos je Gerät in `screenshots/`.

## Umsetzbarkeit in React Native

Der Prototyp nutzt nur, was React Native kann: Flexbox, Kanten, Radien, Vollfarben, `transform`,
`opacity`, SVG für Symbole, Stempel und Kurve. Keine Gitter, keine Schatten, keine Verläufe,
kein Glas im Inhalt. Die Glas-Leiste im Prototyp steht für die native Leiste.

## Demo-Hunde und Bildnachweis

Adams Wunsch: Windhunde. Bäri ist ein Whippet, Rüde, 5 Jahre, rehbraun gestromt, um 13.5 kg;
Mila eine Galga (Galgo Español) aus dem Tierschutz, Hündin, 2 Jahre, um 21 kg. Das Plakat nutzt
einen Hinweis, der zu Windhunden passt: «Scheu bei Fremden: nicht rufen und nicht nachrennen.»

- «Portretvipeta.JPG», Slavomira, CC0, Wikimedia Commons – Bäri (Hundewahl, Profil, Plakat,
  Sperrbildschirm).
- «Galgo espagnol 003.jpg», Tux-Man, CC0, Wikimedia Commons – Mila (Hundewahl).

Beide unter CC0: Die App-Demo darf sie übernehmen, Quellen in `assets/demo/QUELLEN.md`. Der
Ausschnitt je Foto steht für den Bildausschnitt, den die App beim Hochladen speichert: in der
Hundewahl Lage und Grösse des Hintergrunds, sonst `object-position`.
