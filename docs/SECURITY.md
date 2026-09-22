# Sicherheit

**Faustregel:** Echt schützen, was den Betreiber schützt; dokumentieren, was nur hypothetische
Nutzer schützt. Die App hat keinen Server, keine Konten und keine Schlüssel im Bundle. Zu schützen
sind die Lieferkette, die Web-Vorschau, der Signierschlüssel der Android-App (ab Tag 5) und die
Daten auf dem Gerät.

## Was läuft, seit dem ersten Commit

| Schutz | Wo | Beleg |
|---|---|---|
| Täglicher Secret-Scan über die ganze Historie und `bun audit` ab «moderat» | `.github/workflows/sicherheit-taeglich.yml` | Lauf in GitHub Actions |
| Updates mit sieben Tagen Wartezeit, Sammel-PR, Zuweisung | `.github/dependabot.yml`, `bunfig.toml` | – |
| SDK-gebundene Pakete nie über Dependabot | `ignore`-Liste in `.github/dependabot.yml` | `scripts/__tests__/dependabot.test.js` |
| Fassungen passen zur Expo-SDK | `bun run check:expo` in der CI | Gegenprobe in `docs/ENTSCHEIDE.md` E-4 |
| Erinnerung bei liegengebliebenen Update-PRs, monatliche Wartungsliste | `.github/workflows/erinnerung-*.yml` | – |
| Kein Netzwerkcode in `app/` und `src/` | ESLint-Regeln in `eslint.config.js` | `scripts/__tests__/eslint-rules.test.js` |
| Keine Anfragen an Dritte, keine CSP-Verstösse, Gegenprobe mit eingeschleustem HTML | Web-Export | `e2e/erststart.spec.ts` |
| Die Web-Vorschau speichert nichts im Browser | `src/db/client.web.ts` (sql.js im Speicher) | `e2e/erststart.spec.ts` |
| Workflows mit minimalen `permissions` | `.github/workflows/` | – |

## Ausnahmen im Audit

Namentlich per `--ignore`, nie per Schweregrad. Ein zweiter Schritt zeigt alle Befunde
ungefiltert in der Laufzusammenfassung. Fällt ein Befund weg, fällt seine Ausnahme weg; die
monatliche Wartungsliste fragt danach.

**GHSA-67mh-4wv8-2f99 – esbuild ≤ 0.24.2 über drizzle-kit (moderat).** Betrifft den
Entwicklungsserver von esbuild, der fremden Seiten Anfragen erlaubt. drizzle-kit nutzt esbuild nur,
um `drizzle.config.ts` zu laden, und startet keinen Server. Das Paket kommt nicht in die App und
nicht in die Web-Vorschau. Kein Update in drizzle-kit 0.31.

**GHSA-vcc3-ghjq-m6fr – decode-uri-component ≤ 0.4.2 über expo-router › query-string (moderat).**
Ein präpariertes, kaputt kodiertes Prozentzeichen-Muster kann das Dekodieren sehr lange laufen
lassen. Behoben ist es erst in 0.5.0, und die ist reines ESM: query-string 7.1.3 lädt sie mit
`require` und scheitert mit `TypeError: decodeComponent is not a function` (am 22.09.2026 in Node
nachgestellt). Ein Override wäre also ein Bruch, keine Behebung. Schlimmstenfalls hängt der eigene
Browser-Tab oder die eigene App nach einem präparierten Link; Daten verlassen dabei nichts. Der
Playwright-Test «Adresse mit Parametern» lief sogar mit der gebrochenen Fassung fehlerfrei: Beim
Laden einer Adresse ruft expo-router den Parser nicht auf. Die Ausnahme fällt, sobald expo-router
eine behobene Fassung mitbringt.

## Behoben per Override

**GHSA-w5hq-g745-h8pq – uuid < 11.1.1 über `@expo/config-plugins` › xcode (moderat).** Eng gefasst
`"overrides": { "uuid": "11.1.1" }`. xcode 3.0.1 lädt uuid 11 per `require`, und `v4()` läuft
(geprüft am 22.09.2026). xcode gehört zu `expo prebuild`, nicht in die App; den vollen Beleg bringt
der APK-Workflow an Tag 5.

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

Stand Tag 1: keine. Kamera, Fotos und Benachrichtigungen kommen mit ihren Funktionen (Tag 2 und 3),
jede mit deutschem Begründungstext; `expo-image-picker` ohne Mikrofon (`microphonePermission:
false`), Überflüssiges über `android.blockedPermissions`. Ziel: Die Release-APK verlangt nicht
einmal `INTERNET`; die CI prüft die Berechtigungen in der fertigen APK (Tag 5).

## Daten auf dem Gerät

- Die Datenbank liegt im Dokumentverzeichnis der App, geschützt von der Geräteverschlüsselung und
  der Gerätesperre. SQLCipher läuft nicht in Expo Go (siehe «Bewusst nicht gebaut» im README).
- Fremdschlüssel sind eingeschaltet; was zu einem Hund gehört, verschwindet mit ihm.
- Keine Personendaten in Protokollen: keine Namen, Telefonnummern oder Notizen in `console`. Die
  Fehlergrenze zeigt keinen Fehlertext an, weil er Eingaben enthalten könnte.
