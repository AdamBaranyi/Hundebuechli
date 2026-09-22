# Geräteprotokoll

Was nur auf dem Gerät prüfbar ist: Benachrichtigungen, Kamera, Teilen, PDF unter iOS, VoiceOver,
grösste Systemschrift, Flugmodus, Messwerte. Adam führt die Schritte auf seinem iPhone aus; hier
steht nur, was er berichtet. Ein leeres Feld «beobachtet» heisst: noch nicht geprüft.

## Runde 0 – Tag 1: Die App läuft in Expo Go

**Vorbereitung am Mac** (einmal): `bunx expo login` mit dem Expo-Konto, mit dem auch Expo Go auf
dem iPhone angemeldet ist. Mac und iPhone im selben WLAN. Dann im Projektordner `bun run start`
und den QR-Code mit der Kamera des iPhones scannen.

| Nr. | Schritt | Erwartet | Datum | Gerät, iOS | Beobachtet |
|---|---|---|---|---|---|
| 0.1 | QR-Code scannen, Expo Go öffnet das Projekt | Startbild Karmin-Büchlein auf Kiesel, danach der Erststart; keine rote Fehlermeldung | 22.09.2026 | iPhone, Modell und iOS nicht notiert | Läuft, kein Fehler (Adam). Metro: iOS-Bündel mit 1629 Modulen in 5,0 s, keine Warnung im Protokoll |
| 0.2 | Erststart ansehen | Stempel-Marke in Karmin mit dem heutigen Datum, Titel «Alles zu deinem Hund griffbereit – und rechtzeitig erinnert.», Hinweis zur Tiermedizin; Schrift Atkinson (durchgestrichene Null in «2026») | 22.09.2026 | iPhone, Modell und iOS nicht notiert | Stempel mit Datum und die Texte sichtbar (Adam). Schrift nicht eigens bestätigt |
| 0.3 | iPhone auf dunkel stellen (Kontrollzentrum) | Grund schwarz, Text hell, Marke in hellem Karmin; alles lesbar | | | |
| 0.4 | Einstellungen › Bedienungshilfen › Anzeige & Textgrösse › Grösserer Text, Regler ganz nach rechts; zurück in Expo Go | Text wird grösser, bricht um, nichts abgeschnitten, alles per Scrollen erreichbar | | | |
| 0.5 | VoiceOver einschalten, über den Bildschirm wischen | Liest «Hundebüechli, Stempel vom …» als Bild, dann den Titel als Überschrift, dann die Texte | | | |
| 0.6 | Expo Go ganz schliessen (App-Umschalter), Projekt neu öffnen | Startet wieder ohne Fehler (Migrationen laufen kein zweites Mal) | | | |
| 0.7 | Name unter dem App-Symbol | In Expo Go nicht prüfbar – erst mit der APK (Tag 5) | – | – | – |
