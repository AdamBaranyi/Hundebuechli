#!/usr/bin/env bash
# Liest den Bericht des täglichen Laufs und hält genau ein Issue «Sicherheitsmeldungen»:
# anlegen beim ersten Fund, ergänzen nur bei geänderter Kennungsliste; ohne Funde bleibt es offen und sagt «keine Befunde».
# Braucht GH_TOKEN (issues: write) und GH_REPO.
set -euo pipefail
bericht="${1:-audit.txt}"
titel="Sicherheitsmeldungen"
label="sicherheit"
zuweisung="${ZUWEISUNG:-AdamBaranyi}"
heute=$(date -u +%F)
ids=$(grep -o -E 'GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}' "$bericht" | sort -u || true)
stand=$(printf '%s' "$ids" | sha256sum | cut -c1-12)
nummer=$(gh issue list --label "$label" --state open --search "in:title $titel" --json number --jq '.[0].number // empty')

if [ -z "$ids" ]; then
  # Sauber nur, wenn der Audit es selbst sagt: scripts/audit.sh schreibt die Zeile nur bei
  # grünem Ende. Ein abgebrochener Lauf (Netz, Registry) hat auch keine Kennungen und darf
  # das Issue nicht als erledigt schliessen.
  if ! grep -q 'Keine offenen Befunde ab' "$bericht"; then
    echo "Bericht ohne Kennungen und ohne «Keine offenen Befunde» – der Audit lief nicht durch:" >&2
    cat "$bericht" >&2
    exit 1
  fi
  # Sauber: Das Issue bleibt offen und sagt «keine Befunde». Schliessen und beim
  # nächsten Fund neu anlegen hiess jedes Mal zuweisen und mailen (Oktober 2026).
  if [ -n "$nummer" ]; then
    sauber=$(printf '<!-- stand:sauber -->\nStand %s: keine Befunde. Prüfung ab moderat mit den Ausnahmen aus scripts/audit.sh.\n\nDas Issue bleibt offen und zeigt den letzten Stand; der tägliche Lauf schreibt nur bei Änderungen. Bitte nicht schliessen.' "$heute")
    bisher=$(gh issue view "$nummer" --json body --jq .body)
    case "$bisher" in
      *"stand:sauber"*) echo "Weiterhin keine Befunde, keine Änderung." ;;
      *) gh issue edit "$nummer" --body "$sauber" ;;
    esac
  fi
  exit 0
fi

koerper=$(printf '<!-- stand:%s -->\nStand %s, Prüfung ab moderat mit den Ausnahmen aus scripts/audit.sh:\n\n```\n%s\n```\n\nRegel: high und critical mit Fix sofort (Laufzeit) oder mit dem nächsten Update-PR (Werkzeuge); moderate beim nächsten Update-PR; ohne Fix namentlich und befristet ausnehmen (docs/SECURITY.md).' "$stand" "$heute" "$(cat "$bericht")")

if [ -z "$nummer" ]; then
  gh label create "$label" --color B60205 --description "Befunde des täglichen Sicherheitslaufs" 2>/dev/null || true
  gh issue create --title "$titel" --label "$label" --assignee "$zuweisung" --body "$koerper"
elif ! gh issue view "$nummer" --json body --jq .body | grep -q "stand:$stand"; then
  gh issue edit "$nummer" --body "$koerper"
  gh issue comment "$nummer" --body "$(printf 'Geänderte Befunde am %s:\n\n```\n%s\n```' "$heute" "$(cat "$bericht")")"
fi
