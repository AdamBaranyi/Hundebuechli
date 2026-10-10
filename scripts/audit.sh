#!/usr/bin/env bash
# Prüft die Abhängigkeiten. Aufruf: bash scripts/audit.sh high|moderate
# Jede Ausnahme steht hier mit Kennung und ist in docs/SECURITY.md begründet
# (Paket, Stufe, Laufzeit oder Werkzeug, Grund, Datum, prüfen bis).
set -euo pipefail
stufe="${1:-high}"
ausnahmen=(
  --ignore GHSA-86w9-cpqp-85rv   # node-forge über @expo/cli, nur Werkzeug, kein Fix – prüfen bis 10.11.2026
  --ignore GHSA-vfj7-8cjw-p6xm   # braces über micromatch (Metro, Jest), nur Werkzeug, kein Fix – prüfen bis 10.11.2026
  --ignore GHSA-hp3w-g68c-fv3c   # sprintf-js über argparse (ESLint, Jest, @expo/cli), nur Werkzeug, kein Fix – prüfen bis 10.11.2026
  --ignore GHSA-vcc3-ghjq-m6fr   # decode-uri-component über expo-router, im Bundle, Fix bricht query-string – prüfen bis 10.11.2026
  --ignore GHSA-67mh-4wv8-2f99   # esbuild über drizzle-kit, nur Entwicklungsserver, kein Update – prüfen bis 10.11.2026
)
bun audit --audit-level="$stufe" "${ausnahmen[@]}"
