#!/usr/bin/env bash
# Prüft die Abhängigkeiten. Aufruf: bash scripts/audit.sh high|moderate
# Jede Ausnahme steht hier mit Kennung und ist in docs/SECURITY.md begründet
# (Paket, Stufe, Laufzeit oder Werkzeug, Grund, Datum, prüfen bis).
set -euo pipefail
stufe="${1:-high}"
ausnahmen=(
  --ignore GHSA-qr28-fpjm-wq7f   # decode-uri-component über expo-router, im Bundle, Fix 0.5.1 bricht query-string, Parser läuft in der App nicht – prüfen bis 23.12.2026
  --ignore GHSA-vcc3-ghjq-m6fr   # decode-uri-component über expo-router, im Bundle, Fix bricht query-string, Parser läuft in der App nicht – prüfen bis 23.12.2026
  --ignore GHSA-67mh-4wv8-2f99   # esbuild 0.18.20 über drizzle-kit, nur Entwicklungsserver, kein Update – prüfen bis 23.12.2026
  --ignore GHSA-mrhx-c7xc-m3w5   # zod 3.25.76 über @expo/cli (verlangt ^3.25.76), Fix nur in 4.6.6, nur Werkzeug – prüfen bis 23.12.2026
)
bun audit --audit-level="$stufe" "${ausnahmen[@]}"
# Nur erreichbar, wenn bun audit grün endet (set -e). bun schreibt «No vulnerabilities
# found» nur, wenn es gar keine Meldung gibt; sind alle ausgenommen oder unter der Stufe,
# steht nichts da. Diese Zeile sagt sicherheits-meldung.sh, dass der Audit durchlief.
echo "Keine offenen Befunde ab $stufe."
