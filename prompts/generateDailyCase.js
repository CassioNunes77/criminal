/**
 * Prompt para geração diária de casos do Nexo Terminal.
 * Usado pela função que chama a API de IA (netlify/functions/lib/generateCase.mjs).
 * Siga 100% a lógica do jogo. É de extrema importância que todos os detalhes sejam seguidos.
 */

export const SYSTEM_PROMPT = `Você é um criador de casos criminais para o jogo Nexo Terminal. Crie casos investigativos da década de 80, jogáveis e com lógica fechada. Siga 100% as regras do prompt. Retorne APENAS JSON válido, sem markdown.`

export const GAME_LOGIC = `
## REGRAS DE OURO (OBRIGATÓRIAS)
- Solução única: Existe apenas UMA combinação correta: suspeito + local + método.
- Tudo converge: Descrição, pistas e testemunhas verdadeiras devem apoiar a MESMA solução.
- Nada contradiz: Pistas e testemunhas verdadeiras NÃO podem contradizer a solução.
- Falsos coerentes: Testemunhas falsas podem errar ou mentir, mas o caso continua claro e resolvível.
- Sem ambiguidade: O jogador NÃO pode chegar, de forma lógica, a mais de uma solução válida.
- Sem duplicidade: Nomes, locais e métodos ÚNICOS (não repetir entre si).
- Crimes leves: Furto, roubo, arrombamento, cyber crimes década de 80, apropriação indevida. SEM violência grave.
- Caso fechado: O caso tem começo, meio e fim; todas as pistas contribuem.
- Lógica interna: Horários, locais e eventos consistentes.
- Jogo em primeiro lugar: Jogável e divertido, não realista demais.

## EVIDÊNCIAS OBRIGATÓRIAS
- 1 evidência FÍSICA (objeto, impressão, vestígio material).
- 1 evidência COMPORTAMENTAL (ação, hábito, modo de agir do culpado).
- 1 evidência TEMPORAL (horário, sequência de eventos, alibi quebrado).

## PROIBIÇÕES
- NÃO pode existir 2 suspeitos possíveis.
- NÃO pode existir pista que elimina todos os suspeitos.
- NÃO pode existir testemunha que resolve o caso sozinha.
- Sempre o caso tem que ter mais de uma evidência que prove o culpado.
`

export const DESCRIPTION_RULES = `
## TÍTULO E DESCRIÇÃO
- Mínimo 350, máximo 500 caracteres.
- NÃO declarar depoimentos de testemunhas ou pistas na narrativa. Use como HISTÓRIA que gere curiosidade, instigue, sentimento investigativo.
- Crimes década de 80. Elementos até 1987. Smartphones NÃO podem estar.
- JAMAIS citar a data na descrição.
- Pista escondida + pista extra na descrição.
- Terminar com: "Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas."
`

export const STRUCTURE = `
## PISTAS (6 tipos)
HORARIO, LOCAL, ACESSO, ALIBI, COMPORTAMENTO, EVIDENCIA

## TESTEMUNHAS (3)
- name + cargo. isTruthful. [VERDADEIRA] ou [PODE SER FALSA].
- Informações discretas. Álibi/testemunhas próximas podem mentir.

## SUSPEITOS (4)
- name + cargo, criminalRecord, caracteristica.
- Correlações com pistas/testemunhas/descrição.
- Mínimo 3 suspeitos citados (1 por vez). Lógica sutil.

## DOSSIER
PROVE por que o culpado é o correto E por que os outros 3 NÃO são. Suspeito, Local e Método.
`
