#!/bin/bash
# Gera o caso do dia manualmente (quando o agendamento não rodou)
# Uso: TRIGGER_SECRET=seu_secret ./scripts/trigger-case.sh

if [ -z "$TRIGGER_SECRET" ]; then
  echo "Erro: defina TRIGGER_SECRET"
  echo "Ex: TRIGGER_SECRET=abc123 ./scripts/trigger-case.sh"
  exit 1
fi

curl -sS -X POST https://nexoterminal.netlify.app/.netlify/functions/trigger-daily-case \
  -H "Authorization: Bearer $TRIGGER_SECRET" \
  -H "Content-Type: application/json"

echo ""
