#!/bin/bash
# Atualiza o Caso #0001 (videolocadora) no Firebase.
# Gera novo caso via Groq e sobrescreve o documento de hoje.
#
# Uso: TRIGGER_SECRET=seu_secret ./scripts/trigger-case-0001-videolocadora.sh

CASE_NUMBER=1 TEMA=videolocadora exec "$(dirname "$0")/trigger-case.sh" "$@"
