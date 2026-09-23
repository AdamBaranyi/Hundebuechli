# Release und Wartung

## SDK-Patch (monatlich, aus der Wartungsliste)

1. `bunx expo install --check` mit Netz zeigt neuere Patch-Fassungen der SDK.
2. Nur übernehmen, was älter als sieben Tage ist (`bunfig.toml` verweigert Jüngeres ohnehin):
   `bunx expo install --fix`.
3. `bunx expo-doctor`, dann `bun run verify`, `bun run export:web` und `bun run test:e2e`.
4. Kurz in Expo Go starten; Ergebnis ins Geräteprotokoll.

## SDK-Wechsel (bewusst, nie über Dependabot)

Expo Go aus dem App Store kann genau eine SDK. Gewechselt wird erst, wenn die App-Store-Fassung von
Expo Go die neue SDK kann – das dauert manchmal Monate.

1. In der App-Store-Beschreibung von Expo Go nachsehen, welche React-Native-Fassung sie nennt.
2. `bunx expo install expo@^<n> --fix`, danach `bunx expo-doctor`.
3. `ignore`-Liste in `.github/dependabot.yml` gegen `bundledNativeModules.json` der neuen SDK
   abgleichen; der Test `scripts/__tests__/dependabot.test.js` zeigt jede Lücke.
4. Alle Prüfungen, dann Geräteprotokoll Runde 0 auf dem iPhone.
5. Neuer Eintrag in `docs/ENTSCHEIDE.md`.

## Android-APK

Gebaut wird ohne EAS in GitHub Actions (`.github/workflows/android-apk.yml`): `expo prebuild`,
dann Gradle mit Java 17. Die Signatur geht als Gradle-Parameter hinein
(`android.injected.signing.*`), die erzeugten nativen Dateien bleiben unverändert. Danach prüft
`scripts/apk-permissions.mjs` die Berechtigungen der fertigen APK gegen
`scripts/android-permissions.txt` – erst dort sind die Manifeste aller Bibliotheken zusammengeführt.

### Probe-APK (ohne Keystore)

In GitHub unter Actions › Android-APK › «Run workflow». Die APK ist mit dem Debug-Schlüssel der
Vorlage signiert und liegt 14 Tage als Artefakt beim Lauf – zum Prüfen, nie zum Verteilen.

### Keystore einmal anlegen (Adam)

Der Keystore signiert jede künftige Fassung. Geht er verloren, lässt sich die App auf Geräten, die
sie schon haben, nicht mehr aktualisieren.

1. Keystore erzeugen (Java nötig, etwa `brew install --cask temurin`):

   ```sh
   keytool -genkeypair -v -storetype PKCS12 -keystore hundebuechli.keystore \
     -alias hundebuechli -keyalg RSA -keysize 4096 -validity 10000
   ```

2. Keystore und Passwörter offline sichern (Passwort-Manager und ein zweiter Datenträger), nie ins
   Repository – `.gitignore` sperrt `*.keystore`.
3. In GitHub unter Settings › Secrets and variables › Actions vier Secrets anlegen:
   - `ANDROID_KEYSTORE_BASE64` – Inhalt von `base64 -i hundebuechli.keystore`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS` – `hundebuechli`
   - `ANDROID_KEY_PASSWORD`

### Release

1. Fassung in `app.json` und `package.json` erhöhen, committen.
2. `git tag v0.1.0` und `git push origin v0.1.0`.
3. Der Workflow baut signiert, prüft die Berechtigungen und hängt
   `hundebuechli-v0.1.0.apk` an das Release.
4. Auf einem Android-Gerät installieren und ins Geräteprotokoll eintragen. Bis das geschehen ist,
   gilt die APK als «nicht auf einem Gerät belegt».

### Berechtigungen

Erlaubt sind nur Kamera und was die Erinnerungen brauchen (`scripts/android-permissions.txt`).
`app.json` sperrt Mikrofon, Internet, externen Speicher und Überlagerungsfenster. Eine neue
Berechtigung kommt nur mit Begründung in die Liste und nach `docs/ENTSCHEIDE.md`.

### Hinweis für später

Google verlangt ab 2027 weltweit registrierte Entwickler auch für Installationen ausserhalb von
Google Play (ab 30.09.2026 zuerst in Brasilien, Indonesien, Singapur und Thailand). Dann braucht es
ein Konto bei der Android Developer Console – kostenlos für bis zu 20 Geräte oder 25 USD mit Ausweis
für die freie Verteilung. Der Entscheid fällt dann.
