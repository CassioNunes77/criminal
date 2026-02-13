/**
 * Prompt para geração diária de casos do Nexo Terminal.
 * Usado pela Cloud Function que chama a API de IA.
 */

export const SYSTEM_PROMPT = `Você é um criador de casos criminais para o jogo Nexo Terminal. Crie casos investigativos da década de 80, jogáveis e com lógica fechada.`

export const USER_PROMPT_TEMPLATE = (dateStr, caseNumber, caseCode) => `Gere um novo caso criminal para o jogo Nexo Terminal.

## REGRAS DE OURO (OBRIGATÓRIAS)
- Solução única: Apenas UMA combinação correta: suspeito + local + método.
- Tudo converge: Descrição, pistas e testemunhas verdadeiras devem apoiar a MESMA solução.
- Nada contradiz: Pistas e testemunhas verdadeiras NÃO podem contradizer a solução.
- Falsos coerentes: Testemunhas falsas podem errar, mas o caso continua claro e resolvível.
- Sem ambiguidade: O jogador NÃO pode chegar a mais de uma solução válida.
- Sem duplicidade: Nomes, locais e métodos ÚNICOS (não repetir).
- Crimes leves: Furto, roubo, arrombamento, apropriação indevida. SEM violência grave.
- Caso fechado: Começo, meio e fim; todas as pistas contribuem.
- Lógica interna: Horários, locais e eventos consistentes.
- Jogo em primeiro lugar: Jogável e divertido.

## DADOS DO CASO
- Data do caso: ${dateStr}
- Número do caso: #${caseNumber}
- Código do caso: ${caseCode}

## ESTRUTURA OBRIGATÓRIA

### Título e Descrição (máx 500 caracteres)
- Crimes da década de 80. APENAS elementos até 1987 (sem smartphones, internet moderna, etc).
- Incluir pista escondida na descrição (ex: "dinheiro do caixa foram levados" indica local = caixa).
- Sempre incluir: "Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas."

### Pistas (6 tipos – jogador escolhe qual revelar primeiro)
- HORARIO
- LOCAL
- ACESSO
- ALIBI
- COMPORTAMENTO
- EVIDENCIA

### Testemunhas (3)
- Nome + cargo/função (ex: "Roberto, Segurança Noturno")
- Versão com isTruthful: true ou false
- Informações discretas (ex: "parecia um homem forte" indica que não é mulher)
- Indicar [VERDADEIRA] ou [PODE SER FALSA]

### Suspeitos (4)
- Nome + cargo/função (ex: "João Silva, encanador")
- Histórico: "Passagem por X" ou "Sem antecedentes"
- Mencionar pelo menos 3 suspeitos na descrição, pistas ou depoimentos (1 por vez)

### Locais (4 opções)
### Métodos (4 opções)

### Solução
- suspect: nome exato do suspeito
- location: exatamente uma das opções de locais
- method: exatamente uma das opções de métodos

### Dossier do Caso (interno, não para jogador)
- Caso completo, solução, provas e dados que levam à conclusão.

## FORMATO JSON DE SAÍDA
Retorne APENAS um JSON válido, sem markdown ou texto extra. Use este formato exato:

{
  "type": "ROUBO",
  "location": "LOJA DE ELETRÔNICOS",
  "time": "23:15",
  "description": ["linha1", "linha2", ""],
  "suspects": [
    { "name": "Nome Completo", "criminalRecord": "texto" }
  ],
  "locations": ["opção1", "opção2", "opção3", "opção4"],
  "methods": ["opção1", "opção2", "opção3", "opção4"],
  "clues": [
    { "type": "HORARIO", "text": "texto" },
    { "type": "LOCAL", "text": "texto" },
    { "type": "ACESSO", "text": "texto" },
    { "type": "ALIBI", "text": "texto" },
    { "type": "COMPORTAMENTO", "text": "texto" },
    { "type": "EVIDENCIA", "text": "texto" }
  ],
  "witnesses": [
    { "name": "Nome, Cargo", "statement": "depoimento", "isTruthful": true }
  ],
  "solution": {
    "suspect": "Nome exato",
    "location": "Local exato",
    "method": "Método exato"
  },
  "dossier": "texto completo do dossier interno"
}`
