# Fallstudie: Hundebüechli

*Stand 23. September 2026 – der Bau ist nach fünf Tagen abgeschlossen; die zwei Wochen Alltag
folgen und ergänzen diese Seite.*

## Warum ich die App baue

Ich habe zwei Whippets. Jeder Hund in der Schweiz hat ein Büechli: den Heimtierausweis mit
Impfungen, dazu Zettel von der Tierarztpraxis, Packungen mit Entwurmungstabletten und die Frage,
wann der Zeckenschutz wieder fällig war. Vergessen habe ich nie etwas Wichtiges – aber ich wusste
es oft nur, weil ich rechtzeitig nachgesehen habe. Die App soll das übernehmen: eintragen, was im
Büechli steht, und rechtzeitig daran erinnert werden.

Dass ich die App selbst benutze, ist Absicht. Ein Portfolio-Projekt für eine erfundene Zielgruppe
bleibt eine Behauptung; eines, das ich jeden Tag in der Hand habe, muss sich bewähren.

## Warum offline und ohne Server

Die Daten gehören auf das Handy, nicht in eine Cloud: Gesundheitsdaten eines Hundes, Telefonnummern,
Fotos. Ohne Server gibt es kein Konto, kein Passwort, nichts, was ausfallen oder durchsickern kann.
Die App enthält keine einzige Zeile Netzwerkcode; eine Lint-Regel sperrt ihn, und ein Browsertest
prüft, dass die Web-Vorschau keine Anfrage an Dritte stellt. Das Android-Paket verlangt nicht
einmal die Berechtigung «Internet».

Der Preis ist bewusst gewählt: keine Synchronisation zwischen zwei Handys, keine Sicherung in der
Cloud. Beides steht unten unter «Bewusst nicht gebaut».

## Wie die Erinnerungen verlässlich bleiben

Eine Erinnerung, die nicht kommt, ist schlimmer als keine: Man verlässt sich darauf und vergisst
die Entwurmung doch. Darum plant kein Formular selbst eine Benachrichtigung. Stattdessen rechnet
eine reine Funktion aus dem ganzen Datenstand, was geplant sein soll, und eine zweite vergleicht das
mit dem, was das Handy wirklich geplant hat. Was fehlt, wird geplant; was niemand mehr braucht,
gelöscht. Zweimal ausgeführt ändert der Abgleich nichts.

Das hat drei Folgen, die man sonst von Hand absichern müsste:

- Wird ein Hund archiviert oder gelöscht, verschwinden seine Erinnerungen beim nächsten Abgleich –
  ohne eigenen Code dafür.
- iOS behält nur die 64 nächsten Benachrichtigungen. Die App plant höchstens 60 und füllt beim
  nächsten Öffnen nach.
- Wiederholungen rechnet die App selbst, mit festgehaltenem Monatsende und in der Zeitzone Zürich
  über die Zeitumstellung hinweg. Die Tests decken genau diese Fälle ab.

Auf dem iPhone kam die erste Erinnerung pünktlich, bei geschlossener App.

## Was auf dem Gerät anders war

Die automatischen Tests liefen grün, bevor ich die App zum ersten Mal auf meinem iPhone hatte. Das
Gerät fand trotzdem Fehler, die kein Test gesehen hätte:

- **Der Ziffernblock des iPhones hat keinen Punkt.** Ein Datum wie 29.05.2022 liess sich nicht
  eintippen, und ohne Datum liess sich nichts sichern. Jetzt setzt das Feld die Punkte selbst;
  bei der Uhrzeit dasselbe mit dem Doppelpunkt.
- **Jedes Foto wurde abgelehnt.** Die App verwarf Fotos mit Standortdaten – und fast jedes Foto vom
  iPhone hat welche. «Lieber kein Foto als eines mit Standort» hiess in der Praxis: gar kein Foto.
  Jetzt schneidet die App die Metadaten heraus und prüft erst danach. Eine Sicherheitsregel, die
  jede echte Eingabe verwirft, ist kein strenger Schutz, sondern ein kaputtes Feature.
- **Die Tab-Leiste des Systems** setzte die Beschriftung zwar auf 16 Punkt, behielt aber ihre Höhe:
  Das Symbol lag auf dem Text. Jetzt hat die App eine eigene Leiste, dieselbe wie im Browser.

Jeder dieser Befunde steht mit Datum im Geräteprotokoll und mit Begründung in den Entscheiden.

## Was getestet ist – und was nur das Gerät zeigt

| Automatisch, bei jedem Push | Nur auf dem Gerät |
|---|---|
| Fälligkeiten, Wiederholungen, Monatsende, Schalttag | Benachrichtigung bei geschlossener App |
| Plan und Abgleich der Erinnerungen, samt Zeitumstellung und Grenze 60 | Erlaubnisfrage im richtigen Moment |
| Repositories gegen eine echte SQLite-Datenbank | Kamera, Zuschnitt, Teilen-Blatt |
| Fotos ohne EXIF, XMP und IPTC, mit Testbildern mit GPS | VoiceOver, grösste Systemschrift, Haptik |
| PDFs: feindselige Eingaben als Text, keine Adresse nach aussen, A4 | PDFs öffnen und in «Dateien» sichern |
| Browser: axe, Schrift ab 16 px, Tippflächen ab 48, Tastatur, CSP | Flugmodus über einen ganzen Tag |

Zahlen am 23.09.2026: 295 Jest-Tests, 78 Browserprüfungen in Chrome bei drei Breiten, 156 in
Safari (WebKit auf iPhone und iPad) und Firefox.

## Was zwei Wochen Alltag geändert haben

*Folgt nach zwei Wochen mit meinen eigenen Hunden, festgehalten in `docs/ALLTAG.md`.*

## Bewusst nicht gebaut

| Nicht gebaut | Warum | Stattdessen |
|---|---|---|
| Synchronisation, Server, Konten | passt nicht in fünf Tage; Backend zeige ich in anderen Projekten | ganz offline; UUIDs als Grundlage; Synchronisation im Haushalt als nächster Schritt |
| Sicherung und Export | braucht einen Server oder ein Dateiformat mit eigenen Datenschutzfragen | die wichtigsten Angaben als PDF |
| Tierärztliche Ratschläge, Symptom-Check, Chat-Assistent | Verantwortung, die eine App nicht übernehmen darf; ein Cloud-Assistent schickt Gesundheitsdaten weg | Erinnerungen an Termine, die ich selbst eintrage; Tagebuch-PDF für die Praxis |
| GPS-Spaziergänge | Standortdaten verraten die Wohnadresse | Fotos ohne Standort |
| QR-Marke fürs Halsband | braucht eine öffentliche Seite mit Personendaten | Vermisst-Plakat als PDF in einer Minute |
| Verschlüsselte Datenbank, Face ID | SQLCipher läuft nicht in Expo Go; Face ID schützt nur hypothetische Nutzer | Geräteverschlüsselung und Gerätesperre |
| App Store, TestFlight, Play Store | Apple kostet CHF 109 im Jahr, Google 25 USD und einen geschlossenen Test mit zwölf Personen | Web-Vorschau, APK, Expo Go |

## Der nächste Schritt

Zwei Menschen kümmern sich um denselben Hund – «Hat schon jemand die Tablette gegeben?». Der
nächste Meilenstein ist eine Synchronisation im Haushalt: ein kleiner Dienst mit PostgreSQL,
Kopplung über einen Einmal-Code, Gaben als Protokoll, das konfliktfrei zusammenläuft. Die
Erinnerungen bleiben lokal: Jedes Handy plant aus dem gemeinsamen Datenstand selbst, und gibt eine
Person die Tablette, verschwindet die Erinnerung beim anderen beim nächsten Abgleich.

## Was davon auf Firmen-Apps übertragbar ist

- **Erinnerungen in festen Abständen** funktionieren wie Wartungspläne: nächste Prüfung aus der
  letzten, Monatsende festgehalten, Erinnerungen als Ableitung statt als Einzelaufträge.
- **Dokumente offline** wie im Aussendienst: fotografieren, ohne Netz ablegen, später weitergeben.
- **Das PDF für den Hundesitter** ist ein Übergaberapport: alles Nötige auf einer Seite, gross
  gedruckt, für jemanden, der die App nicht hat.
