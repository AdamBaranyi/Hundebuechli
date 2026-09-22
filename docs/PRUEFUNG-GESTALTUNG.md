# Prüfung gegen KI-Muster – Hundebüechli

Skill `avoid-ai-design`, Erkennungsmodus, 22.09.2026. Profil: `app-component` für die Bildschirme,
`artifact` für die Übersichtsseite. Geprüft am Quelltext (`screens/`, `css/`, `js/`, `index.html`)
und an den gerenderten Bildern aus den Playwright-Läufen (Chrome, WebKit auf iPhone und iPad,
Android, Firefox; hell und dunkel). **Ergebnis: kein P0.**

## Funde

| Nr. | Stufe | Fund | Quelle | Urteil |
|---|---|---|---|---|
| 1 | P1 | Keine Rückmeldung beim Antippen: Zeilen, Knöpfe, Chips und Kacheln haben keinen gedrückten Zustand (`:active` fehlt) | Code | beheben |
| 2 | P1 | Leer-, Fehler- und Erlaubnis-Zustände sind beschrieben, aber im Prototyp nicht gezeigt | Code | beheben |
| 3 | P2 | Aktive Tab-Markierung im dunklen Modus kaum sichtbar: Blattfarbe auf fast gleichem Glas | Bild | beheben |
| 4 | P2 | Das leere Stempelfeld (gestrichelter Kreis) erklärt sich nicht von selbst; es könnte wie ein Ladekreis wirken | Bild | beheben |
| 5 | Urteil | Glas (`backdrop-filter`) an Tab-Leiste, Knöpfen über dem Foto und Mitteilung | Code | behalten: echte Schichtung über scrollendem Inhalt, steht für das native Liquid Glass. Deckkraft auf 90 % erhöht, damit 4,5:1 über jedem Inhalt hält (axe-Befund aus dem Lauf) |
| 6 | Urteil | Nur eine Schrift (Atkinson Hyperlegible Next) | Code | behalten: gewählt wegen Lesbarkeit, Hierarchie über Schnitt 800 und Grösse |
| 7 | Urteil | Fast einfarbige Palette, Karmin nur bei «fällig» | Bild | behalten: bewusste Zurückhaltung, die Farbe trägt eine Bedeutung |
| 8 | Urteil | Vier gleiche Kacheln im Formular | Bild | behalten: eine Auswahl mit vier gleichrangigen Möglichkeiten, keine Werbekarten |
| 9 | P2 | Gleichmässige Abstände von 32 zwischen Abschnitten | Bild | behalten: die Reihenfolge der Abschnitte trägt die Gewichtung |
| 10 | Urteil | Die Null der Schrift ist durchgestrichen («08:00») | Bild | behalten: Absicht der Schrift (0 und O verschieden); Adam sieht es sich an |

## Nicht gefunden

Kein Violett oder Indigo, keine Verläufe, keine Verlaufsschrift, keine zentrierte Startseite, keine
drei gleichen Funktionskarten, kein Bento, keine Zahlenleiste, keine Versalien-Etiketten, keine
Metazeilen mit Mittelpunkten, keine Monoschrift für Beschriftungen, keine Pfeile im Knopftext, keine
farbigen Randstreifen an Karten, keine Symbole in abgerundeten Quadraten, kein Lucide, keine Emoji,
keine Stockfotos von Menschen, keine Platzhalter-Avatare.

## Behoben

1. **Gedrückter Zustand** für Zeilen, Knöpfe, Chips, Kacheln, Hundewahl und Stempelfeld
   (`css/zustaende.css`), sofort und ohne Bewegung; Hover nur mit Maus.
2. **Zustände gezeigt** in `screens/zustaende.html`: nichts fällig, Erinnerungen aus, Fehler im
   Formular, Rückfrage vor dem Löschen.
3. **Aktive Tab-Markierung** in der Farbe Linie statt Blatt – jetzt in beiden Modi sichtbar.
4. **Stempel-Zeichen im leeren Stempelfeld** – der Kreis sagt jetzt, was ein Tipp tut.

Zweiter Durchgang über alle Kategorien: kein P0, kein P1. Die drei Tests des Skills – begründet,
stimmig, keine Wiederholung – sieht der Entwurf als erfüllt: jede Entscheidung folgt dem Stempel
als Idee, und die Richtung weicht von Tallyroom (Kobalt, IBM Plex) und Evidarium (Materialkontrast,
Archivo und Source Serif) ab.
