# Sicherheit

**Faustregel:** Echt schützen, was den Betreiber schützt; dokumentieren, was nur hypothetische
Nutzer schützt. Die App hat keinen Server, keine Konten und keine Schlüssel im Bundle. Zu schützen
sind die Lieferkette, die Web-Vorschau, der Signierschlüssel der Android-App und die
Daten auf dem Gerät.

## Was läuft, seit dem ersten Commit

| Schutz | Wo | Beleg |
|---|---|---|
| Täglicher Secret-Scan über die ganze Historie; rot nur bei einem Geheimnis | `.github/workflows/sicherheit-taeglich.yml` | Lauf in GitHub Actions |
| Täglich `bun audit` ab «moderat» als Meldung: ein Issue «Sicherheitsmeldungen», ergänzt nur bei neuen Kennungen; meldet `scripts/audit.sh` «Keine offenen Befunde», bleibt es offen und sagt das (seit 25.10.2026, vorher wurde es geschlossen und beim nächsten Fund neu angelegt); ein abgebrochener Audit lässt es unverändert und macht den Lauf rot | `scripts/sicherheits-meldung.sh` | `scripts/__tests__/sicherheits-meldung.test.js` |
| Push und Pull Request blockieren ab «hoch», mit denselben Ausnahmen | `scripts/audit.sh` in `.github/workflows/ci.yml` | `scripts/__tests__/audit.test.js`, `sicherheitslauf.test.js` |
| Updates mit sieben Tagen Wartezeit, Sammel-PR, ohne Zuweisung (seit 25.10.2026: zugewiesene PRs mailten jede Woche) | `.github/dependabot.yml`, `bunfig.toml` | – |
| SDK-gebundene Pakete nie über Dependabot | `ignore`-Liste in `.github/dependabot.yml` | `scripts/__tests__/dependabot.test.js` |
| Fassungen passen zur Expo-SDK | `bun run check:expo` in der CI | Gegenprobe in `docs/ENTSCHEIDE.md` E-4 |
| Erinnerung bei liegengebliebenen Update-PRs, monatliche Wartungsliste | `.github/workflows/erinnerung-*.yml` | – |
| Kein Netzwerkcode in `app/` und `src/` | ESLint-Regeln in `eslint.config.js` | `scripts/__tests__/eslint-rules.test.js` |
| Keine Anfragen an Dritte, keine CSP-Verstösse, Gegenprobe mit eingeschleustem HTML | Web-Export | `e2e/erststart.spec.ts` |
| Die Web-Vorschau speichert nichts im Browser | `src/db/client.web.ts` (sql.js im Speicher) | `e2e/erststart.spec.ts` |
| Workflows mit minimalen `permissions` | `.github/workflows/` | – |

## Ausnahmen im Audit

Regel seit 10.10.2026 (E-76): Ausnahmen stehen an einer Stelle, in `scripts/audit.sh`, je
Kennung, nie als ganze Stufe. Jede steht in dieser Tabelle mit Paket, Stufe, Art (Laufzeit oder
Werkzeug), Grund, Tag der Prüfung und «prüfen bis», höchstens einen Monat später. Ein Test hält
Skript und Tabelle deckungsgleich (`scripts/__tests__/audit.test.js`). Fällt ein Befund weg, fällt
seine Ausnahme weg; die monatliche Wartungsliste prüft die Tabelle. Ausgenommene Kennungen
erscheinen weder im Issue «Sicherheitsmeldungen» noch blockieren sie die CI.

| Kennung | Paket und Weg | Stufe | Art | Grund | Geprüft | Prüfen bis |
|---|---|---|---|---|---|---|
| GHSA-86w9-cpqp-85rv | node-forge ≤ 1.4.0 über `@expo/cli` | hoch | Werkzeug | kein Fix; auch `@expo/cli` 57.0.28 verlangt `^1.3.3` | 10.10.2026 | 10.11.2026 |
| GHSA-vfj7-8cjw-p6xm | braces ≤ 3.0.3 über micromatch (Metro, Jest) | hoch | Werkzeug | kein Fix; die Muster kommen aus der eigenen Konfiguration | 10.10.2026 | 10.11.2026 |
| GHSA-hp3w-g68c-fv3c | sprintf-js ≤ 1.1.3 über argparse (ESLint, Jest, `@expo/cli`) | moderat | Werkzeug | kein Fix | 10.10.2026 | 10.11.2026 |
| GHSA-vcc3-ghjq-m6fr | decode-uri-component ≤ 0.4.2 über expo-router › query-string | moderat | Laufzeit im Bundle | der Fix ist reines ESM und bricht query-string | 10.10.2026 | 10.11.2026 |
| GHSA-67mh-4wv8-2f99 | esbuild ≤ 0.24.2 über drizzle-kit | moderat | Werkzeug | kein Update; drizzle-kit startet keinen Server | 10.10.2026 | 10.11.2026 |
| GHSA-mrhx-c7xc-m3w5 | zod 3.25.76 über `@expo/cli` (verlangt `^3.25.76`) und eslint-plugin-react-hooks | hoch | Werkzeug | Fix nur in zod 4.6.6, das die App selbst schon nutzt; ein Override auf 4 wäre für die Expo-CLI ein Bruch, keine Behebung. Die CLI prüft nur eigene Konfiguration beim Bauen | 25.10.2026 | 25.11.2026 |

**GHSA-86w9-cpqp-85rv – node-forge (hoch), seit 10.10.2026.** Die Prüfung von RSA-Signaturen nach
PKCS#1 v1.5 nimmt zusätzliche, verschachtelte DigestAlgorithm-Elemente an; eine gefälschte
Signatur könnte so durchgehen. `@expo/cli` braucht node-forge für die Code-Signatur von Updates
(expo-updates) und für Zertifikate bei `expo run:ios`; Hundebüechli nutzt beides nicht. In der App
und in der Web-Vorschau steckt node-forge nicht. Die neuste Fassung 1.4.0 ist betroffen.

**GHSA-vfj7-8cjw-p6xm – braces (hoch), seit 10.10.2026.** Tief verschachtelte Muster wie
`{a,{b,{c,…}}}` erschöpfen den Stack. braces steckt in micromatch, mit dem Metro und Jest
Dateimuster auswerten. Die Muster stammen aus der eigenen Konfiguration, nicht von aussen;
schlimmstenfalls bricht ein Werkzeug auf dem eigenen Rechner ab. Die neuste Fassung 3.0.3 ist
betroffen.

**GHSA-hp3w-g68c-fv3c – sprintf-js (moderat), seit 10.10.2026.** Unbegrenzte Genauigkeitsangaben
wie `%.999999999f` können Speicher und Zeit aufbrauchen. sprintf-js kommt über argparse 1 (aus
js-yaml 3) in ESLint, Jest und `@expo/cli`; die Formate stammen aus den Werkzeugen selbst. Die
neuste Fassung 1.1.3 ist betroffen.

**GHSA-67mh-4wv8-2f99 – esbuild ≤ 0.24.2 über drizzle-kit (moderat), seit 22.09.2026.** Betrifft
den Entwicklungsserver von esbuild, der fremden Seiten Anfragen erlaubt. drizzle-kit nutzt esbuild
nur, um `drizzle.config.ts` zu laden, und startet keinen Server. Das Paket kommt nicht in die App
und nicht in die Web-Vorschau. Kein Update in drizzle-kit 0.31.

**GHSA-vcc3-ghjq-m6fr – decode-uri-component ≤ 0.4.2 über expo-router › query-string (moderat),
seit 22.09.2026.** Ein präpariertes, kaputt kodiertes Prozentzeichen-Muster kann das Dekodieren
sehr lange laufen lassen. Behoben ist es erst in 0.5.0, und die ist reines ESM: query-string 7.1.3
lädt sie mit `require` und scheitert mit `TypeError: decodeComponent is not a function` (am
22.09.2026 in Node nachgestellt). Ein Override wäre also ein Bruch, keine Behebung. Schlimmstenfalls
hängt der eigene Browser-Tab oder die eigene App nach einem präparierten Link; Daten verlassen
dabei nichts. Der Playwright-Test «Adresse mit Parametern» lief sogar mit der gebrochenen Fassung
fehlerfrei: Beim Laden einer Adresse ruft expo-router den Parser nicht auf. Auch expo-router
57.0.25, die neuste Fassung für SDK 57, verlangt weiter query-string `^7.1.3`. Die Ausnahme fällt,
sobald expo-router eine behobene Fassung mitbringt.

## Behoben per Override

Ein Override hebt genau ein Paket auf genau eine Fassung, auch tief im Baum. Danach muss
nachweislich alles noch laufen: Ein Override auf eine reine ESM-Fassung bricht Nutzer mit
`require` (siehe decode-uri-component oben).

**GHSA-pqg4-j6r4-53mv – shell-quote 1.8.4 bis 1.10.0 über react-native › react-devtools-core
(kritisch).** `quote()` lässt eine Befehlseinschleusung zu, wenn nach einem Kommentar-Token ein
Token mit Zeilenumbruch folgt. react-devtools-core bringt shell-quote für seinen eigenständigen
DevTools-Server mit, ein Entwicklungswerkzeug; in die App kommt es nicht. Seit 10.10.2026
`"shell-quote": "1.11.0"`. Der Bereich von react-devtools-core (`^1.6.1`) hätte die Fassung auch
über das Lockfile allein erlaubt; das Override hält zusätzlich jede künftige Kopie auf der
behobenen Fassung. Es fällt weg, sobald react-devtools-core mindestens 1.11.0 verlangt.

**GHSA-68fv-2mgg-jv7q – source-map-js 1.0.0 bis 1.2.1 über `@expo/metro-config` › postcss (hoch).**
Präparierte Offsets in den Abschnitten einer Source Map blockieren die Ereignisschleife. postcss
nutzt es beim Bündeln von CSS, nur als Werkzeug. Seit 10.10.2026 `"source-map-js": "1.2.2"`;
postcss verlangt `^1.2.1`. Fällt weg, sobald postcss mindestens 1.2.2 verlangt.

Geprüft am 10.10.2026: Beide bleiben CommonJS (`require('shell-quote').quote()` und eine Source Map
über postcss laufen), es gibt je genau eine Kopie, der Web-Export enthält weder react-devtools noch
shell-quote, Playwright läuft in Chrome, Safari und Firefox grün, und die Probe-APK baut (Lauf
38053947160, 33 MB) mit genau den erlaubten Berechtigungen.
**Keine Ausnahme von der Wartezeit nötig:** shell-quote 1.11.0 erschien am 29.09.2026,
source-map-js 1.2.2 am 30.09.2026 – beide älter als sieben Tage. Die Meldung zu shell-quote kam
erst am 06.10.2026.

**GHSA-w5hq-g745-h8pq – uuid < 11.1.1 über `@expo/config-plugins` › xcode (moderat).** Eng gefasst
`"overrides": { "uuid": "11.1.1" }`. xcode 3.0.1 lädt uuid 11 per `require`, und `v4()` läuft
(geprüft am 22.09.2026). xcode gehört zu `expo prebuild`, nicht in die App; der APK-Workflow führt
`expo prebuild` mit der Ausnahme aus und baut durch (23.09.2026).

## Wartezeit

Sieben Tage für jede neue Fassung (`bunfig.toml`, `cooldown` in `.github/dependabot.yml`). Eine
Ausnahme in `minimumReleaseAgeExcludes` gibt es nur für einen Sicherheitsfix in einem erreichbaren
Laufzeitpaket – bei Hundebüechli in der App oder der Web-Vorschau, nie für ein Werkzeug – und nur
für den einen `bun install`, der die Fassung ins Lockfile schreibt; danach wird sie wieder
entfernt, mit Datum und Grund hier. Werkzeuge warten auf den nächsten Update-PR. Stand 10.10.2026:
keine Ausnahme.

## Web-Vorschau: Header und Content Security Policy

Eine Quelle für beides: `web/security-headers.mjs`. `bun run export:web` setzt die CSP als
`<meta>` direkt nach `charset` ins HTML und schreibt `dist/.htaccess` mit allen Headern; der
Prüfserver der Tests (`scripts/serve-web.mjs`) sendet dieselben.

```
default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline';
style-src-elem 'self' 'unsafe-inline'; style-src-attr 'none'; img-src 'self' data: blob:;
font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none';
object-src 'none'; frame-ancestors 'none'
```

- **Skripte:** nur vom eigenen Ursprung, nie `'unsafe-inline'`. Die eigene HTML-Vorlage hat kein
  Inline-Skript; käme mit einem Expo-Update eines dazu, würde es per Hash erlaubt.
- **`'wasm-unsafe-eval'`:** sql.js übersetzt SQLite als WebAssembly. Das erlaubt kein `eval` für
  JavaScript.
- **Stile:** react-native-web schreibt Stile zur Laufzeit in `<style>`-Elemente; ihr Inhalt ändert
  sich mit jedem Bildschirm und lässt sich nicht vorab hashen. Ohne `'unsafe-inline'` blieb die
  Seite leer (beobachtet am 22.09.2026). Erlaubt sind darum Stil-Elemente, gesperrt bleiben
  Stil-Attribute (`style-src-attr 'none'`): eingeschleustes HTML kann weder Skripte ausführen noch
  sich selbst gestalten. Die Gegenprobe im Test prüft beides.
- **Header:** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`, `Permissions-Policy` ohne Kamera, Mikrofon und Standort,
  `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy` und `-Resource-Policy: same-origin`.
  Kein `upgrade-insecure-requests`: Safari schreibt damit auch `http://localhost` um.

## Berechtigungen

Stand Tag 3: Kamera und Fotos über `expo-image-picker`, mit deutschen Texten, wozu sie dienen
(`app.json`). Mikrofon ausgeschaltet (`microphonePermission: false`) und `RECORD_AUDIO` über
`android.blockedPermissions` gesperrt. Die Kamera wird erst gefragt, wenn jemand ein Foto aufnimmt;
die Auswahl aus den Fotos braucht unter iOS keine Erlaubnis. Nach der Erlaubnis für
Benachrichtigungen fragt die App, wenn die erste Erinnerung entsteht – nicht beim ersten Start –
und höchstens einmal je Sitzung (E-46). `expo-notifications` bringt eigene Berechtigungen mit
(unter Android `POST_NOTIFICATIONS`, dazu Einträge für den Neustart des Geräts); was davon in der
fertigen APK landet, prüft der APK-Workflow.
Die Release-APK verlangt nicht einmal `INTERNET`: `app.json` sperrt es zusammen mit Mikrofon,
externem Speicher, Überlagerungsfenstern, dem Push-Empfang von Firebase und den Zähler-Rechten
für Launcher, die `expo-notifications` mitbringt (E-73). Der Workflow `android-apk.yml` prüft die
fertige APK gegen `scripts/android-permissions.txt` – erst dort sind die Manifeste aller
Bibliotheken zusammengeführt. Eine Berechtigung, die nicht auf der Liste steht, lässt den Lauf
scheitern.

**Fotos ohne Standort:** Jedes Foto wird verkleinert und als JPEG neu kodiert. Danach schneidet
`stripMetadata` in `src/domain/jpeg-metadata.ts` alle beschreibenden Segmente heraus – alle APPn
ausser JFIF und Farbprofil sowie Kommentare –, denn EXIF (APP1), XMP (APP1) und IPTC (APP13) können
einen Standort tragen. Die Bilddaten bleiben Byte für Byte gleich; die Drehung steckt nach dem
Neukodieren in den Bildpunkten. Erst danach prüft `isSafeToStore`; findet es noch Metadaten, wird
nichts gespeichert. Das Neukodieren allein genügt nicht: Auf dem iPhone kam das Foto mit EXIF aus
`expo-image-manipulator` zurück und wurde abgelehnt (Gerätetest 23.09.2026); fast jedes Foto vom
iPhone trägt einen Standort. Die Testbilder mit GPS sind mit ImageIO von Apple gegengeprüft, und der
Playwright-Test liest das gespeicherte Bild aus der Seite und sucht darin nach «Exif» und XMP.
Gelöscht wird nur, was nach einem selbst angelegten Pfad aussieht (`photos/<uuid>.jpg`).

## Daten auf dem Gerät

- Die Datenbank liegt im Dokumentverzeichnis der App, geschützt von der Geräteverschlüsselung und
  der Gerätesperre. SQLCipher läuft nicht in Expo Go (siehe «Bewusst nicht gebaut» im README).
- Fremdschlüssel sind eingeschaltet; was zu einem Hund gehört, verschwindet mit ihm.
- Keine Personendaten in Protokollen: keine Namen, Telefonnummern oder Notizen in `console`. Die
  Fehlergrenze zeigt keinen Fehlertext an, weil er Eingaben enthalten könnte.
