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

Folgt an Tag 5: Keystore erzeugen und offline sichern, Secrets in GitHub, Release-Workflow bei Tags
`v*` mit `expo prebuild`, Gradle und Prüfung der Berechtigungen in der fertigen APK. Hinweis für
später: Google verlangt ab 2027 weltweit registrierte Entwickler auch für Installationen
ausserhalb von Google Play.
