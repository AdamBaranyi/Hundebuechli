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

## Runde 1 – Tag 2: Hund, Foto, Einträge, im Flugmodus

**Vorbereitung:** Metro läuft am Mac (`bun run start`), das Projekt ist in Expo Go offen. Dann den
**Flugmodus einschalten** (WLAN bleibt für die Verbindung zum Mac an, Mobilfunk aus) – die App selbst
braucht kein Netz.

| Nr. | Schritt | Erwartet | Datum | Gerät, iOS | Beobachtet |
|---|---|---|---|---|---|
| 1.1 | Erststart: «Ersten Hund anlegen» | Formular «Neuer Hund» als Blatt von unten | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Blatt von unten kam, alle Felder ausfüllbar (Adam) |
| 1.2 | Sichern ohne Name | Satz «Gib deinem Hund einen Namen.» unter dem Feld, VoiceOver liest ihn | | | |
| 1.3 | Name, Rasse, «Rüde», Chipnummer «756 0981 2345 6789», Praxis mit Telefon; Sichern | Profil mit Name gross; «Chipnummer aus der Schweiz» | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Datum war zuerst nicht einzugeben: Der Ziffernblock des iPhones hat keinen Punkt, darum liess sich nicht sichern (Adam). Behoben mit E-37; danach gesichert, das Profil zeigt den Hund |
| 1.4 | Tab-Leiste unten ansehen | Drei Einträge, Beschriftung gross (16 pt), nichts abgeschnitten, Liquid Glass | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Beschriftung gross, aber ohne Platz zum Symbol: «die Ikon liegt einfach auf den Text drauf» (Adam). Behoben mit E-40, eigene Leiste; erneut zu prüfen |
| 1.5 | «Foto aufnehmen» | Frage nach der Kamera erst jetzt; Foto erscheint, hochkant richtig gedreht | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Foto erscheint richtig; nach E-39 und E-41 in Ordnung (Adam) |
| 1.6 | «Foto ersetzen» aus den Fotos | Neues Foto erscheint | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Funktioniert; Ausschnitt mit dem Zuschnitt des Systems (E-41) |
| 1.7 | «Chipnummer kopieren», in Notizen einfügen | 756098123456789 | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Keine sichtbare Rückmeldung: «ich sehe das nicht, dass es kopiert wurde» (Adam). Behoben mit E-43, Kurzmeldung; Einfügen noch zu prüfen |
| 1.8 | «Tierarztpraxis anrufen» | Telefon öffnet mit der Nummer (nicht anrufen) | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Telefon öffnet sich (Adam) |
| 1.9 | «Eintrag hinzufügen»: Entwurmung, Produkt, «Datum wählen» in 3 Tagen; Sichern | Im Profil «Das Jahr in Stempeln»; unter «Als Nächstes» bei «Diese Woche» | 23.09.2026 | iPhone 17 Pro Max, iOS 27 | Eintrag angelegt, nächstes Datum 23.12. bei drei Monaten Wiederholung (Adam) |
| 1.10 | Unter «Als Nächstes» aufs gestrichelte Stempelfeld tippen | Stempel mit heutigem Datum, Zeile bleibt stehen; VoiceOver sagt «… erledigt.» | | | |
| 1.11 | **Expo Go ganz schliessen, neu öffnen** (Flugmodus weiter an) | Hund, Foto und Einträge sind da | | | |
| 1.12 | Grösster Text (wie 0.4), dann Formular und «Als Nächstes» | Alles bricht um, nichts abgeschnitten, alles erreichbar | | | |
| 1.13 | Dunkel (wie 0.3) | Alles lesbar, Karmin nur bei fällig | | | |
| 1.14 | VoiceOver im Formular | Felder mit Namen, «Kastriert, Schalter, aus», Kacheln als Auswahl | | | |
| 1.15 | Hund löschen: Profil, «Löschen» | Rückfrage nennt Einträge und Fotos; danach Liste ohne den Hund | | | |

**Befunde aus Runde 1 (23.09.2026, iPhone 17 Pro Max, iOS 27), behoben:**

- Der Ziffernblock des iPhones hat keinen Punkt: «29.05.2022» war nicht einzugeben und ohne gültiges
  Datum liess sich nichts sichern. Das Feld setzt die Punkte jetzt selbst (E-37).
- Auf «Hunde» stand die Überschrift unter Uhr und Akku. Bildschirme ohne Navigationsleiste rechnen
  den sicheren Rand jetzt selbst ein (E-38).
- In der nativen Tab-Leiste lag das Symbol auf der Beschriftung, weil die Leiste bei 16 pt ihre
  Höhe behält. Auf dem Gerät läuft jetzt dieselbe eigene Leiste wie im Browser (E-40).
- Jedes Foto wurde abgelehnt: «alle meine Fotos enthalten Standortdaten». Die Metadaten werden
  jetzt herausgeschnitten statt das Foto abzulehnen (E-39).
- Der Hund stand nicht in der Mitte des Bildes. Nach dem Wählen kommt jetzt der Zuschnitt des
  Systems, quadratisch (E-41).
- «Chipnummer kopieren» zeigte nichts an. Es gibt jetzt eine Kurzmeldung über der Tab-Leiste
  (E-43).
