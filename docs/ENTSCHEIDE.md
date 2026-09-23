# Entscheide

Umkehrbare Detailentscheide, nummeriert und nie gelöscht. Wird einer später geändert, kommt ein
neuer Eintrag dazu, der auf den alten verweist.

## Tag 1 – 22.09.2026

**E-1 · Expo SDK 57.** Die App-Store-Fassung von Expo Go ist 57.0.9 vom 02.09.2026 und nennt
React Native 0.86, also SDK 57 (App-Store-Seite geprüft am 22.09.2026). Ein SDK-Wechsel ist ein
eigener Schritt, siehe `docs/RELEASE.md`.

**E-2 · Vorlage ausserhalb des Repositorys angelegt.** `create-expo-app` legt selbst ein
Git-Repository an und committet mit der globalen Git-Adresse – auf diesem Rechner der
Firmenadresse. Darum entstand die Vorlage (`default@sdk-57`, `--no-agents-md`) in einem
Arbeitsordner, übernommen wurden nur die Dateien. `--no-agents-md` verhindert `AGENTS.md`,
`CLAUDE.md` und `.claude/`; diese stehen zusätzlich in `.git/info/exclude`.

**E-3 · Routen in `app/`.** Die Vorlage legt sie nach `src/app/`; der Auftrag trennt Routen
(`app/`) und Code (`src/`). Beispielcode, Bilder und Module der Vorlage, die die App nicht braucht
(`@expo/ui`, `expo-glass-effect`, `expo-image`, `expo-symbols`, `expo-web-browser`, `expo-device`),
sind weg. Sie kommen mit `bunx expo install` zurück, sobald eine Funktion sie braucht.

**E-4 · Wartezeit schlägt neuste Patch-Fassung.** `bunfig.toml` installiert nichts, was jünger als
sieben Tage ist. Am 22.09.2026 waren `expo` 57.0.24, `expo-router` 57.0.22, `expo-constants`
57.0.19 und `expo-asset` 57.0.18 vom 18.09.; eingesetzt sind die Fassungen davor (`expo`
57.0.22). `expo-doctor` meldet das als einzigen von 21 Punkten. Nachziehen ab 25.09.2026 mit
`bunx expo install --fix`.
Die CI prüft `expo install --check` darum **offline** gegen `bundledNativeModules.json` der
installierten `expo`-Fassung: Das beantwortet die Frage, ob alles zur SDK passt. Der
Online-Vergleich mit der neusten Patch-Fassung wäre nach jeder Expo-Veröffentlichung sieben Tage
lang rot. Gegenprobe: Mit `expo-crypto` 56.0.1 statt 57.0.3 scheitert die Prüfung mit Exit-Code 1.

**E-5 · Bun mit flacher Ablage.** `linker = "hoisted"` in `bunfig.toml`, weil Metro und Expo Go
ein klassisches `node_modules` erwarten; `exact = true`; Text-Lockfile `bun.lock`. Expo CLI,
Jest und Playwright laufen mit Node 24.

**E-6 · Nur native Module aus Expo Go.** Geprüft gegen `bundledNativeModules.json` von
`expo` 57.0.22 (123 Einträge). Eingesetzt: `expo-sqlite`, `expo-crypto`, `expo-asset`,
`expo-font`, `expo-router`, `expo-splash-screen`, `expo-status-bar`, `expo-system-ui`,
`expo-constants`, `expo-linking`, `react-native-svg`, `react-native-gesture-handler`,
`react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`,
`react-native-screens`. Reines JavaScript: `drizzle-orm`, `zod`, `@tanstack/react-query`, `sql.js`
(nur Web-Vorschau und Tests). Jede neue Abhängigkeit bekommt hier einen Eintrag.

**E-7 · Eigener Migrationslauf für beide Treiber.** drizzle-kit schreibt mit `driver: 'expo'`
ein Bündel (`src/db/migrations/migrations.js`). drizzles Migrator für sql.js liest Dateien vom
Datenträger und läuft im Browser nicht; darum wendet `src/db/migrate.ts` das Bündel auf dem Gerät,
im Browser und in den Tests gleich an: jede Migration in einer Transaktion, geführt in
`__migrations`. Baut eine Migration eine Tabelle neu, wird die Fremdschlüsselprüfung davor aus-
und danach eingeschaltet (in einer Transaktion wirkt das Pragma nicht), und
`PRAGMA foreign_key_check` in der Transaktion verwirft einen Neubau, der Verweise verwaisen liesse.

**E-8 · Ein Datenbanktyp.** `Db = BaseSQLiteDatabase<'sync', unknown, Schema>`. expo-sqlite und
sql.js arbeiten beide synchron und passen auf diesen Typ; der Typecheck belegt es an drei Stellen
(`client.native.ts`, `client.web.ts`, `testing.ts`). Die Repositories sind darum synchron.

**E-9 · Gespeicherte Werte auf Englisch.** Arten (`vaccination`, `deworming`,
`parasite_protection`, `vet_visit`) und Kategorien sind Bezeichner und darum englisch; die
deutschen Wörter stehen in `src/content`.

**E-10 · Tabellen mit genau einer Zeile.** Halterangaben und Einstellungen tragen eine feste UUID,
die ein CHECK erzwingt. Ein zweites Gerät meint bei der späteren Synchronisation dieselbe Zeile.
Fehlen die Einstellungen, gelten die Vorgaben aus `src/domain/settings.ts` (08:00, sieben Tage).

**E-11 · Bilder mit genau einem Besitzer.** `attachments` hat vier Fremdschlüssel (Hund, Eintrag,
Tagebuch, Dokument), ein CHECK verlangt genau einen. So löscht die Datenbank per Kaskade, und
`deleteDog` gibt die Pfade der Dateien zurück, damit auch sie verschwinden.

**E-12 · Zeit ohne Zeitzonenfehler.** Tage als lokales Datum, Uhrzeiten als Minuten seit
Mitternacht, erstellt und geändert in UTC. Erinnerungen folgen der Ortszeit des Geräts: Wer im
Ausland ist, wird um 08:00 Ortszeit erinnert.

**E-13 · Web-Export als einzelne Seite.** `web.output: 'single'` statt `'static'`: keine
Vorab-Darstellung in Node, die sql.js laden müsste; der Server liefert für jede Route
`index.html`. Eigene Vorlage `public/index.html`: deutsch, ohne Inline-Stil und ohne Inline-Skript.

**E-14 · Schrift als Dateien.** Atkinson Hyperlegible Next in vier statischen Schnitten (400, 500,
700, 800), Google Fonts v7 aus `@expo-google-fonts/atkinson-hyperlegible-next` 0.4.1, als Dateien
in `assets/fonts` mit `OFL.txt`. Der Schnitt steckt im Schriftnamen, nicht in `fontWeight`:
Android fällt sonst bei eigenen Schriften auf die Systemschrift zurück.

**E-15 · Tippflächen ab 48.** Der Entwurf hat Chips und Umschalter mit 44 (Apple-Minimum); der
Auftrag verlangt einheitlich 48, Hauptaktionen 56.

**E-16 · Chipnummer in Gruppen 3-4-4-4.** Der Entwurf zeigte «756 0981 2345 678» – das sind 14
Ziffern. Die App verlangt 15 Ziffern und zeigt sie als «756 0981 2345 6789».

**E-17 · Tab-Leiste.** Die native Leiste (`expo-router/unstable-native-tabs`) nimmt laut
Dokumentation SDK 57 `labelStyle` mit `fontSize` auf iOS und Android. Ob 16 pt unter iOS 26 wirklich
gesetzt werden und nichts abschneiden, zeigt erst das Gerät (Tag 2, `docs/GERAETETEST.md`). Wenn
nicht: eigene Leiste mit 16 pt, Begründung als neuer Eintrag.

**E-18 · CSP der Web-Vorschau.** Skripte nur vom eigenen Ursprung, nie `'unsafe-inline'`.
`'wasm-unsafe-eval'` braucht sql.js für WebAssembly. react-native-web schreibt Stile zur Laufzeit
in `<style>`-Elemente, deren Inhalt sich nicht vorab hashen lässt: `'unsafe-inline'` darum nur
für Stil-Elemente, `style-src-attr 'none'` sperrt Stil-Attribute aus eingeschleustem HTML.
Einzelheiten in `docs/SECURITY.md`.

**E-19 · Scrollbereich im Browser fokussierbar.** Im Web scrollt die ScrollView, nicht die Seite.
Bei 320 px meldete axe `scrollable-region-focusable`; der Bereich ist dort jetzt per Tastatur
erreichbar. Auf dem Gerät ändert sich nichts.

**E-20 · TanStack Query offline.** `networkMode: 'always'`, sonst hielte TanStack Query die
Abfragen ohne Netz an. Nach jeder Änderung wird gezielt invalidiert (`staleTime: Infinity`),
keine Wiederholung bei Fehlern der lokalen Datenbank.

**E-21 · Keine EAS-Builds.** Adams Expo-Konto hat die Gratisstufe (15 Android- und 15 iOS-Builds
im Monat). Gebraucht wird keiner: Expo Go lädt den Code ohne Build, die APK entsteht in GitHub
Actions mit `expo prebuild` und Gradle. EAS Build bleibt der Ausweichweg und nur mit Adams OK.
`eas init` ist darum noch nicht ausgeführt.

**E-22 · Erststart ohne Knöpfe an Tag 1.** «Ersten Hund anlegen» kommt mit dem Hundeprofil (Tag 2),
«Mit Beispieldaten starten» mit den Beispieldaten (Tag 4). Keine Knöpfe ohne Wirkung vorher.

**E-23 · Symbole aus dem SVG des Entwurfs.** `scripts/render-icons.mjs` rendert App-Symbol,
Android-Vordergrund, einfarbiges Symbol, Startbild und Favicon mit Chromium aus
`assets/icons/app-symbol.svg`. Das einfarbige Android-Symbol ist vorerst die Silhouette; der
Feinschliff kommt mit der APK (Tag 5).

**E-24 · Name des Repositorys.** Auf GitHub heisst es `AdamBaranyi/Hundebuechli`, so angelegt;
Ordner, Paketname und Slug bleiben `hundebuechli`.

**E-25 · TypeScript.** Strict plus `noUncheckedIndexedAccess`. TypeScript 6 bindet
`@types`-Pakete nicht mehr von selbst ein: `types: ["jest"]` in `tsconfig.json`, Node-Typen nur
per Verweis in Dateien, die in Node laufen. Der React Compiler aus der Vorlage bleibt an.

**E-26 · Versalien in der Marke.** «HUNDEBÜECHLI» im Ring der Marke bleibt in Versalien: Es ist ein
Stempel wie im echten Büechli, kein Etikett über einer Überschrift.

**E-27 · ESLint bleibt bei Hauptversion 9.** Der erste Dependabot-PR hob ESLint auf 10.10.0 und
wurde rot: ESLint 10 hat `context.getFilename()` entfernt, `eslint-plugin-react` aus
`eslint-config-expo` 57 ruft es noch auf. Die Hauptversion von ESLint ist damit an die
Expo-Konfiguration gebunden und in `.github/dependabot.yml` für Hauptversionen gesperrt;
Minor- und Patch-Fassungen kommen weiter.

## Tag 2 – 22.09.2026

**E-28 · `expo-symbols` wieder dabei (zu E-3).** Die native Tab-Leiste zeichnet unter Android
Material-Symbole über `expo-symbols`; ohne das Paket fehlen die Symbole. Es ist Teil von Expo Go
(57.0.3). Unter iOS kommen die SF Symbols `seal`, `tag` und `slider.horizontal.3` vom System.

**E-29 · Getypte Routen auch in der CI.** Die Typen der Routen erzeugt sonst nur der laufende
Entwicklungsserver. `bun run typecheck` ruft darum zuerst `expo customize tsconfig.json` auf; das
erzeugt `.expo/types` und lässt `tsconfig.json` unverändert. Gegenprobe: Eine falsche Route
(`/hunde/[id]`) lässt den Typecheck scheitern.

**E-30 · Datum als Feld statt Datumswähler.** Datum und nächste Fälligkeit haben eine Schnellwahl
(Heute, Gestern; 1, 3, 6, 12, 36 Monate) und für alles andere ein Feld «TT.MM.JJJJ». Ein nativer
Datumswähler fehlt im Browser, und seine Schrift folgt nicht überall der Systemgrösse; das Feld ist
auf Gerät und Web gleich, per Tastatur bedienbar und testbar. Ein gewähltes Datum trägt keine
Wiederholung; «Erledigt» plant dann keine nächste Fälligkeit.

**E-31 · Die Übersicht lädt beim Öffnen neu.** Nach «Erledigt» bleibt die Zeile an ihrem Platz und
zeigt den Stempel; der Folgeeintrag erscheint erst, wenn «Als Nächstes» wieder geöffnet wird. Andere
Ansichten (Profil, Liste) werden sofort nachgeführt.

**E-32 · Ein Eintrag schliesst den offenen Termin mit demselben Produkt.** Wer die Entwurmung als
neuen Eintrag erfasst statt zu stempeln, sähe sonst den alten Termin weiter als fällig. Nur bei genau
einem passenden offenen Termin derselben Art und desselben Produkts; verschiedene Impfungen bleiben
getrennt.

**E-33 · Schalter als ganze Zeile.** Der Schalter des Systems ist im Browser 40 × 20 Pixel gross. Die
ganze Zeile ist der Schalter (Rolle «switch»), der Schieber ist nur Zeichen.

**E-34 · Profilfoto ohne Formular.** Das Foto wird im Profil aufgenommen oder gewählt, nicht im
Formular: So ist der Hund schon gespeichert, wenn das Foto dazukommt, und ein abgebrochenes Formular
hinterlässt keine Datei. Im Browser gibt es nur «Foto wählen», die Kamera wäre dort eine Dateiauswahl.

**E-35 · Hunde ohne Foto zeigen die Hundemarke.** Kein Anfangsbuchstabe im Kreis: Er würde mit der
Systemschrift aus dem Kreis wachsen.

**E-36 · Zurück im Browser mit eigener Tippfläche.** Die Kopfleiste von React Navigation hat im
Browser einen Zurück-Knopf von 30 × 30 Pixeln; im Web ersetzt ihn einer mit 48 und Beschriftung. Auf
dem Gerät bleibt der Knopf des Systems.

**E-37 · Das Datumsfeld setzt die Punkte selbst.** Auf dem iPhone zeigt ein Zahlenfeld einen
Ziffernblock ohne Punkt: «29.05.2022» war nicht einzugeben, und ohne Datum liess sich nichts sichern
(Gerätetest 23.09.2026). Das Feld nimmt nur Ziffern und gruppiert sie beim Tippen zu TT.MM.JJJJ;
Löschen geht Ziffer für Ziffer. Geprüft wird weiter der Text, die Schnellwahl aus E-30 bleibt.

**E-38 · Die sicheren Ränder rechnet der Bildschirm selbst.** Ohne Navigationsleiste stand die
Überschrift unter Uhr und Akku (Gerätetest 23.09.2026): `contentInsetAdjustmentBehavior="automatic"`
half dort nicht. Jeder Bildschirm ohne Leiste nimmt den oberen Rand nun aus
`useSafeAreaInsets`, unten kommt der Platz für die schwebende Tab-Leiste dazu. Nur unter einer
Navigationsleiste rechnet weiter das System; ein Blatt von unten beginnt unter iOS ohnehin unter der
Statusleiste.

**E-39 · Metadaten herausschneiden statt das Foto ablehnen.** Fast jedes Foto vom iPhone trägt einen
Standort, und `expo-image-manipulator` gab das Bild auf dem Gerät mit EXIF zurück: Die App lehnte
darum jedes Foto ab (Gerätetest 23.09.2026). Jetzt fallen nach dem Neukodieren alle beschreibenden
Segmente weg (alle APPn ausser JFIF und Farbprofil, dazu Kommentare); die Prüfung auf EXIF, XMP und
IPTC bleibt als letzte Sperre davor, etwas zu speichern. Bilddaten und Drehung ändern sich dabei
nicht.

**E-40 · Eigene Tab-Leiste statt der nativen (löst E-17 auf).** Mit `labelStyle` in 16 pt setzt
iOS 27 die Beschriftung zwar gross, lässt der Zeile aber ihre Höhe: Das Symbol lag auf dem Text
(Gerätetest 23.09.2026). Die App nutzt darum auf dem Gerät dieselbe schwebende Leiste wie im
Browser – Symbol über der Beschriftung, 4 px Luft dazwischen, Tippfläche mindestens 64, aktiver
Eintrag mit Kapsel in der Farbe Linie. Adams Regel «Schrift ab 16» geht vor dem Systemlook, so
steht es auch im Entwurf. Preis: kein Liquid Glass des Systems; die Leiste bleibt mindestens 90 %
deckend. Gewinn: eine Leiste, ein Test – die Playwright-Prüfungen gelten jetzt für beide Seiten.

**E-41 · Ausschnitt mit dem Zuschnitt des Systems, quadratisch.** Auf dem Gerät stand der Hund
nicht in der Mitte und liess sich nicht verschieben (Gerätetest 23.09.2026). Statt eigener Gesten
(Ziehen, Zoomen, Zuschneiden – viel Code, auf dem Gerät kaum automatisch prüfbar) übernimmt das
den Zuschnitt des Systems: `allowsEditing` in `expo-image-picker`, verschieben und zoomen wie in
Fotos. iOS schneidet dabei immer quadratisch zu, Android nur mit `aspect`; darum ist der
Ausschnitt überall 1:1 und das Profil zeigt ihn quadratisch statt in 4:3. So sieht man genau das,
was zugeschnitten wurde, und das runde Bild in der Liste schneidet nichts ab. Der Entwurf sieht
ohnehin vor, dass die App beim Hochladen einen Ausschnitt speichert. In der Web-Vorschau gibt es
keinen Zuschnitt; dort wird die Mitte des Bildes gezeigt.

**E-42 · Reihenfolge der Bilder über die Zeilennummer.** Zwei Bilder im selben Moment tragen
dieselbe Zeit, und die IDs sind zufällig: Die Liste kam mal so, mal so (sprunghafter Test am
23.09.2026). Sortiert wird jetzt nach Zeit und danach nach `rowid` von SQLite, also nach der
Reihenfolge des Einfügens. Der Test legt sechs Bilder in derselben Millisekunde an; mit der
alten Sortierung fällt er.

**E-43 · Kurzmeldung für Handlungen ohne sichtbare Folge.** «Chipnummer kopieren» sagte nur
VoiceOver etwas; auf dem Bildschirm blieb alles gleich, und Adam sah nicht, ob es geklappt hat
(Gerätetest 23.09.2026). Eine Kapsel über der Tab-Leiste zeigt den Satz 2,5 Sekunden lang und
blendet in 150 ms ein – erlaubt auch bei reduzierter Bewegung. Sie nimmt keine Tipps entgegen und
ist für Screenreader ausgeblendet, sonst käme die Meldung doppelt: `announce` spricht sie bereits.
Sie erscheint nur, wo sonst nichts sichtbar geschieht: beim Kopieren und wenn ein Zurücknehmen
misslingt. Beim Sichern, Stempeln und Löschen ändert sich der Bildschirm selbst.

**E-44 · Benachrichtigungen als Ableitung, hinter einer schmalen Schnittstelle.** `planNotifications`
rechnet aus Terminen, Medikamenten und den Einstellungen, was geplant sein soll; `reconcile`
vergleicht das mit dem, was das System hält. Beides sind reine Funktionen und laufen in Jest ohne
Gerät. Das Gerät selbst liegt hinter `NotificationPort` (`src/notifications/port.ts`, im Browser
`port.web.ts`, in den Tests eine Attrappe). Geplant wird nur mit Einmal-Auslösern und echtem Datum,
weil die wiederholenden Auslöser von `expo-notifications` je Plattform verschieden sind; höchstens
60 auf einmal, weil iOS nur die nächsten 64 behält.

**E-45 · Der Abgleich läuft nach jeder erfolgreichen Änderung.** Statt an jeder Stelle daran zu
denken, hört `NotificationHub` den Mutation-Cache von TanStack Query ab und gleicht nach jeder
erfolgreichen Änderung ab, dazu beim Start und beim Zurückkommen in die App. Eine Stelle, die es
tut, statt zwanzig, die es vergessen können.

**E-46 · Nach der Erlaubnis wird höchstens einmal je Sitzung gefragt.** Gefragt wird erst, wenn der
Plan wirklich etwas enthält – nicht beim ersten Start. Wer «Später» wählt, wird in dieser Sitzung
nicht wieder gefragt; die Übersicht in der App bleibt vollständig. Die Frage steht in einem kleinen
Speicher ausserhalb von React (`ask-store.ts`), weil der Abgleich in einem Effekt läuft und der
keinen Zustand setzen darf (ESLint-Regel `react-hooks/set-state-in-effect`).

**E-47 · «Gegeben» ist ein Protokolleintrag, kein Schalter.** Eine Gabe schreibt eine Zeile in
`dose_log` mit geplantem Zeitpunkt und Uhrzeit der Gabe; der eindeutige Schlüssel aus Medikament
und Zeitpunkt lässt nur eine zu. Zweimal getippt ändert nichts, und für die spätere Synchronisation
im Haushalt ist genau das die konfliktfreie Form. Zurücknehmen löscht die Zeile wieder.

**E-48 · Tippen auf eine Gabe öffnet «Als Nächstes».** Bei einem Termin öffnet die Benachrichtigung
den Eintrag. Bei einem Medikament führt sie in die Übersicht: Dort steht der Fahrplan des Tages, und
die Gabe ist einen Tipp entfernt. Das Formular des Medikaments hilft in dem Moment niemandem.

**E-49 · expo-notifications 57.0.19 statt 57.0.20.** Die Wartezeit von sieben Tagen gilt auch für
neue Pakete; 57.0.20 war am 23.09.2026 fünf Tage alt. Die CI prüft die Fassungen offline gegen die
SDK-Liste und bleibt grün. Am 25.09.2026 wird zusammen mit den anderen SDK-Patches nachgezogen.

**E-50 · Das Uhrzeitfeld setzt den Doppelpunkt selbst.** Wie beim Datum (E-37) hat der Ziffernblock
des iPhones kein Satzzeichen: «18:30» war nicht einzugeben (Gerätetest 23.09.2026). Das Feld nimmt
nur Ziffern und gruppiert sie. Beginnt die Eingabe mit 3 bis 9, kann es keine zweistellige Stunde
sein – «930» wird «9:30», «1830» wird «18:30»; für «2:00» tippt man «0200». Gilt für die Uhrzeiten
der Medikamente und für die Uhrzeit der Terminerinnerungen.

**E-51 · Ein Gewicht je Hund und Tag.** Wer zweimal am selben Tag wiegt, ersetzt den Wert. Zwei
Punkte übereinander sagen in der Kurve nichts, und «welcher gilt?» wäre eine Frage, die niemand
beantworten will.

**E-52 · Die Kurve sagt nichts über gut oder schlecht.** Die App nennt Betrag und Richtung («0,6 kg
mehr als am 20. Juni») und wertet nicht. Gewicht ist ein Befund für die Tierarztpraxis, keine Note.
Aus demselben Grund gibt es keine Zielgewichte und keine Farben für «zu viel».

**E-53 · Tabelle als Gegenstück zur Kurve, nicht als Notlösung.** Die Kurve ist für VoiceOver ein
Bild mit einem Satz; die Zahlen stehen in der Tabelle, die über denselben Umschalter erreichbar
ist. Gelöscht wird eine Wiegung dort, mit Rückfrage.

**E-54 · Fotos kommen zum gesicherten Tagebucheintrag.** Wie beim Hund (E-34): Erst steht der
Eintrag, dann kommen die Fotos dazu. Ein abgebrochenes Formular hinterlässt so keine Datei ohne
Eintrag. Im neuen Formular sagt ein ruhiger Hinweis, dass Fotos nach dem Sichern dazukommen.

**E-55 · Das Tagebuch trägt Uhrzeit und Kategorie.** Ohne Uhrzeit liesse sich «morgens gefressen,
abends nicht» nicht aufschreiben, und die Kategorie (Appetit, Verdauung, Haut und Fell, Bewegung,
Verhalten, Sonstiges) macht das PDF für die Praxis an Tag 4 lesbar. Beide Felder sind gesetzt,
wenn der Eintrag entsteht: Datum heute, Uhrzeit jetzt.

**E-56 · PDF-Vorlagen als reine Funktionen, Daten vorher fertig formatiert.** `collect.ts` liest aus
der Datenbank und formatiert Daten, Gewichte und Uhrzeiten; `templates.ts` setzt nur zusammen und
maskiert jede Zeichenkette. So prüfen Jest-Tests die Vorlagen ohne Gerät: feindselige Eingaben
erscheinen als Text, es gibt keine Adresse nach aussen, A4 ist gesetzt, nichts steht unter 12 pt.
Fotos kommen nur über `imageSource` hinein, das ausschliesslich Base64-JPEG zulässt.

**E-57 · Gestaltet wird im PDF nur über Klassen.** Die Web-Vorschau sperrt style-Attribute per CSP
(`style-src-attr 'none'`), und der Druck im Browser nutzt dieselbe Vorlage. Ein Test hält das fest.

**E-58 · Im Browser öffnet «Teilen» den Druckdialog.** `printToFileAsync` von expo-print druckt im
Browser nur die aktuelle Seite. Die Vorlage öffnet sich darum in einem eigenen Fenster mit dem
Druckdialog; dort lässt sie sich als PDF sichern. Die Vorschau sagt das neben dem Knopf. Auf dem
Gerät entsteht das PDF mit expo-print unter einem lesbaren Namen und geht über das Teilen-Blatt.

**E-59 · Die Schrift steckt im PDF.** Atkinson Hyperlegible Next (normal und fett) wird als Base64
eingebettet; unter iOS kann expo-print keine lokalen Dateien laden. Scheitert das Laden, nimmt das
PDF die Systemschrift statt gar nicht zu entstehen.

**E-60 · Dokumente im Vollbild, Zoom nur unter iOS.** Die ScrollView von React Native vergrössert
unter iOS selbst mit zwei Fingern (`maximumZoomScale`); unter Android und im Browser kann sie das
nicht. Eine eigene Zoom-Geste wäre viel Code für wenig Nutzen – der Auftrag erlaubt ausdrücklich
«einfaches Vollbild genügt». Unter Android und im Browser bleibt es darum beim Vollbild.

**E-61 · Ein Fotofeld für Tagebuch und Dokumente.** `AttachedPhotos` nimmt den Besitzer als
Parameter (Tagebucheintrag oder Dokument) und geht durch dieselbe Prüfung auf Standortdaten.
Seiten eines Dokuments lassen sich gross öffnen.

**E-62 · Beispieldaten relativ zu heute, mit festen Kennungen.** Bäri und Mila bekommen ihr Jahr
Geschichte immer vom heutigen Tag aus gerechnet: So steht zu jedem Zeitpunkt etwas unter
«Überfällig», «Diese Woche» und «Später», der Fahrplan hat ein laufendes Medikament, die Kurven
reichen bis heute. Die zwei Hunde tragen feste UUIDs; «Beispieldaten entfernen» löscht genau sie
und lässt eigene Hunde stehen. Die Praxis ist erfunden und in Zefix geprüft (23.09.2026: kein
Unternehmen «Rehbach», Gegenprobe «Tierarztpraxis» liefert Treffer); alle Telefonnummern beginnen
mit 000. Ein Streifen «Beispieldaten» steht über «Als Nächstes» und der Hundeliste, solange sie
geladen sind.

**E-63 · Mitgelieferte Fotos ohne Netzwerkcode.** Auf dem Gerät lädt `Asset.loadAsync` das Bild aus
dem App-Paket, und es geht durch dieselbe Prüfung wie jedes Foto. Im Browser liegt es als Datei
neben der Vorschau (gleicher Ursprung); fürs PDF liest ein Canvas es aus – ohne `fetch`, das die
Lint-Regel sperrt. Die beiden CC0-Fotos sind quadratisch zugeschnitten und ohne Metadaten im
Repository (`assets/demo/`, Quellen in `QUELLEN.md`).

**E-64 · Die Web-Vorschau startet an Tag 5 mit Beispieldaten.** (Umgesetzt, siehe E-71.) Der Auftrag will, dass die Vorschau
immer mit Beispieldaten beginnt. Das hängt mit «Web-Vorschau fertig» an Tag 5 zusammen, samt
einem Weg, wie die Browsertests weiter mit dem leeren Erststart beginnen. Bis dahin gibt es den
Knopf «Mit Beispieldaten starten» auf Gerät und Web.

**E-65 · Der Stempel-Moment: hinein mit Bewegung, hinaus ohne.** Beim Stempeln kommt der Stempel
wie im Entwurf leicht grösser und gedreht herein (200 ms, `cubic-bezier(0.23, 1, 0.32, 1)`, nur
Deckkraft und Transformation), dazu die Haptik «Erfolg». Mit «Bewegung reduzieren» blendet er nur
in 150 ms ein; die Haptik bleibt. Das Ausblenden beim Zurücknehmen (Entwurf: 150 ms) fehlt: Es
bräuchte einen zweiten Zustand, der den Stempel nach dem Zurücknehmen noch zeigt, und das Risiko,
dass ein schneller Doppeltipp etwas Falsches anzeigt, wiegt schwerer als die 150 ms. Im Browser
keine Haptik: Die Web-Fassung von expo-haptics baut dafür versteckte Elemente ins Dokument.

**E-66 · Der Streifen «Beispieldaten» nur auf dem Gerät.** In der Web-Vorschau sind alle Daten
erfunden, und das sagt dort schon der Hinweis zur Vorschau; ein zweiter Streifen oben auf jedem
Bildschirm wäre doppelt. Auf dem Gerät bleibt er, solange die Beispielhunde geladen sind.

**E-67 · Das Hundeprofil nach dem Entwurf: Foto randlos, darüber das Blatt mit dem Namen.** Bisher
stand das Foto mit Rand im Inhalt, darunter der Knopf «Foto ersetzen» und erst dann der Name. Jetzt
steht das Foto randlos oben (380 Punkte hoch), das Blatt mit gerundeter Oberkante legt sich darüber
und trägt Name, Schnellzugriffe und Chip-Hinweis. Die Knöpfe zum Foto stehen oben, solange es keines
gibt, sonst weiter unten bei den Aktionen. Die Navigationsleiste bleibt über dem Foto statt
durchsichtig darauf wie im Entwurf.

**E-68 · Im Stempel die kurze Uhrzeit, fünf Zeichen enger gesetzt.** Wie im Entwurf steht im Stempel
«9:30» statt «09:30», ebenso in «Gegeben um 9:30»; der Fahrplan links bleibt bei «08:00». Texte mit
fünf Zeichen («23.9.», «18:05») setzt die SVG enger (`textLength`), damit sie im inneren Ring
bleiben. Die Schrift bleibt 16.

**E-69 · Die Tablette schräg von oben.** Ein Kreis mit Strich liest sich als Verbotszeichen, auch
mit kurzer Kerbe. Die Tablette ist jetzt eine Scheibe mit Kante und Bruchkerbe.

**E-70 · Bilder für die Website aus der Web-Vorschau.** `scripts/screens.mjs` nimmt drei Bildschirme
reproduzierbar auf: iPhone-Hochformat in dreifacher Auflösung, hell, mit den Beispielhunden, als PNG
und WebP in `docs/bilder/`. Die Uhr läuft ab 09:30 weiter (`clock.install`): Mit stehender Uhr
bliebe die Stempel-Bewegung bei Deckkraft null stehen. Aufnahmen vom iPhone selbst kommen dazu,
sobald es ohne Entwicklermodus läuft.

**E-71 · Die Web-Vorschau startet mit Bäri und Mila; `?leer` startet leer.** Wer die Vorschau von
der Website aus öffnet, sieht sofort eine gefüllte App statt eines leeren Erststarts. Die
Beispieldaten entstehen beim Öffnen der Datenbank im Arbeitsspeicher, wie alles in der Vorschau;
nichts landet im Browser. Die Browsertests hängen `?leer` an die Adresse und beginnen weiter beim
Erststart; ein eigener Test prüft den Start mit Beispieldaten samt axe und leerem Browserspeicher.

**E-72 · Safari und Firefox vor jedem Deploy, nicht in der CI.** `bun run test:e2e:browsers` fährt
dieselben Tests auf iPhone SE, iPhone 15 und iPad Pro 11 (WebKit), Safari 1440 sowie Firefox 1440
und 390: 156 von 156 grün (23.09.2026). Drei Unterschiede waren Eigenheiten der Testumgebung, keine
Fehler der App, und sind in den Tests gelöst: Firefox auf dem Mac springt mit Tab nur zwischen
Textfeldern (`accessibility.tabfocus` auf 7, wie Tastaturnutzende es einstellen) und vom letzten
Element nicht zurück an den Anfang (die Prüfung beginnt jetzt oben); Firefox hält die Seite beim
Druckdialog an (die Tests öffnen die Vorlage ohne Druckdialog); die Zwischenablage zurücklesen
erlaubt Playwright nur in Chromium.
