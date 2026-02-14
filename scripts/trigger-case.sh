#!/bin/bash
# Gera o caso do dia manualmente (quando o agendamento não rodou)
# Uso: TRIGGER_SECRET=seu_secret ./scripts/trigger-case.sh
# Ou adicione TRIGGER_SECRET no .env.local e rode: ./scripts/trigger-case.sh
# Com tema: TEMA=videolocadora ./scripts/trigger-case.sh
# Caso #0001: CASE_NUMBER=1 TEMA=videolocadora ./scripts/trigger-case.sh

# Carrega .env.local se existir (para TRIGGER_SECRET)
[ -f .env.local ] && set -a && source .env.local 2>/dev/null && set +a

if [ -z "$TRIGGER_SECRET" ]; then
  echo "Erro: defina TRIGGER_SECRET"
  echo "Ex: TRIGGER_SECRET=abc123 ./scripts/trigger-case.sh"
  exit 1
fi

URL="https://nexoterminal.netlify.app/.netlify/functions/trigger-daily-case"
PARAMS=""
[ -n "$TEMA" ] && PARAMS="${PARAMS}${PARAMS:+&}tema=${TEMA}"
[ -n "$CASE_NUMBER" ] && PARAMS="${PARAMS}${PARAMS:+&}caseNumber=${CASE_NUMBER}"
[ -n "$PARAMS" ] && URL="${URL}?${PARAMS}"

curl -sS -X POST "$URL" \
  -H "Authorization: Bearer $TRIGGER_SECRET" \
  -H "Content-Type: application/json"

echo ""
