#!/bin/bash
# Atualiza o caso do dia pela DATA (referência por data, não por número do caso).
# O caso é salvo/atualizado no documento da data (ex: 2025-02-09).
# Se a data JÁ tem caso: preserva o número do caso e NÃO incrementa o contador.
# Tema ALEATÓRIO por padrão. Use TEMA=... apenas se quiser tema fixo.
#
# Uso:
#   npm run trigger                    # Caso de hoje, tema aleatório
#   DATE=2025-02-09 npm run trigger    # Caso da data específica, tema aleatório
#   TEMA=joalheria npm run trigger     # Com tema fixo (opcional)
#
# Ou: TRIGGER_SECRET=seu_secret ./scripts/trigger-case.sh
# Ou: DATE=2025-02-09 TRIGGER_SECRET=xxx ./scripts/trigger-case.sh

# Carrega .env.local se existir (para TRIGGER_SECRET)
[ -f .env.local ] && set -a && source .env.local 2>/dev/null && set +a

if [ -z "$TRIGGER_SECRET" ]; then
  echo "Erro: defina TRIGGER_SECRET"
  echo "Ex: TRIGGER_SECRET=abc123 ./scripts/trigger-case.sh"
  echo "Por data: DATE=2025-02-09 TRIGGER_SECRET=abc123 ./scripts/trigger-case.sh"
  echo "Ou: npm run trigger (com TRIGGER_SECRET no .env.local)"
  exit 1
fi

# DATA é a referência: caso do dia para essa data (YYYY-MM-DD)
[ -z "$DATE" ] && DATE=$(date +%Y-%m-%d)

URL="https://nexoterminal.netlify.app/.netlify/functions/trigger-daily-case"
PARAMS="date=${DATE}"
[ -n "$TEMA" ] && PARAMS="${PARAMS}&tema=${TEMA}"
URL="${URL}?${PARAMS}"

echo "Atualizando caso do dia para DATA=${DATE}..."
curl -sS -X POST "$URL" \
  -H "Authorization: Bearer $TRIGGER_SECRET" \
  -H "Content-Type: application/json"

echo ""
