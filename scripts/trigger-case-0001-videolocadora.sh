#!/bin/bash
# Gera caso com tema videolocadora para a data informada (ou hoje).
#
# Uso: TRIGGER_SECRET=seu_secret ./scripts/trigger-case-0001-videolocadora.sh
# Data específica: DATE=2025-02-09 TRIGGER_SECRET=xxx ./scripts/trigger-case-0001-videolocadora.sh

TEMA=videolocadora exec "$(dirname "$0")/trigger-case.sh" "$@"
