#!/bin/bash
# Gera caso com tema videolocadora FIXO (exceção ao tema aleatório padrão).
# Use apenas quando quiser forçar videolocadora. Caso contrário: npm run trigger (tema aleatório).
#
# Uso: TRIGGER_SECRET=seu_secret ./scripts/trigger-case-0001-videolocadora.sh
# Data: DATE=2025-02-09 TRIGGER_SECRET=xxx ./scripts/trigger-case-0001-videolocadora.sh

TEMA=videolocadora exec "$(dirname "$0")/trigger-case.sh" "$@"
