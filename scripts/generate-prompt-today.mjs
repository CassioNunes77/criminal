#!/usr/bin/env node
/**
 * Gera o prompt completo para o caso de hoje.
 * Use com Grok, Claude ou outra IA para gerar o caso manualmente.
 * Ou use o trigger: TRIGGER_SECRET=xxx ./scripts/trigger-case.sh
 */

const now = new Date()
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const caseNumber = 1 // Ajuste conforme último caso no Firebase
const caseCode = Array.from({ length: 8 }, () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return chars.charAt(Math.floor(Math.random() * chars.length))
}).join('')

console.log(`
========================================
PROMPT PARA GERAR CASO DE HOJE
Data: ${dateStr}
Caso: #${String(caseNumber).padStart(4, '0')}
Código: ${caseCode}
========================================

Leia o arquivo prompts/PROMPT_IA_CASOS.md e adicione no início:

DADOS DESTA EXECUÇÃO:
- Data do caso: ${dateStr}
- Número do caso: #${String(caseNumber).padStart(4, '0')}
- Código do caso: ${caseCode}

IMPORTANTE: Siga 100% a lógica do jogo. Nenhuma palavra deve ser ocultada.

Depois peça à IA para gerar o JSON seguindo 100% as regras.

========================================
PARA DISPARAR VIA NETLIFY (Groq API):
TRIGGER_SECRET=seu_secret ./scripts/trigger-case.sh
========================================
`)
