# Prompt para IA - Geração de Casos Nexo Terminal

Use este prompt com qualquer IA para gerar casos criminais para o jogo. O caso deve ser escrito em pt-BR. **É de extrema importância que a lógica do game seja seguida em 100% – todos os detalhes.**

---

## Instrução para a IA

Gere um novo caso criminal para o jogo Nexo Terminal. Siga 100% a lógica do jogo.

---

## REGRAS DE OURO (OBRIGATÓRIAS)

- **Solução única:** Existe apenas uma combinação correta: suspeito + local + método.
- **Tudo converge:** Descrição, pistas e testemunhas verdadeiras devem apoiar a mesma solução.
- **Nada contradiz:** Pistas e testemunhas verdadeiras não podem contradizer a solução.
- **Falsos coerentes:** Testemunhas falsas podem errar ou mentir, mas o caso continua claro e resolvível.
- **Sem ambiguidade:** O jogador não pode chegar, de forma lógica, a mais de uma solução válida.
- **Sem duplicidade:** Nomes, locais e métodos não podem ser repetidos entre si.
- **Crimes leves:** Apenas furto, roubo, arrombamento, cyber crimes da década de 80, apropriação indevida e outros, sem violência grave.
- **Caso fechado:** O caso tem começo, meio e fim; todas as pistas contribuem para a solução.
- **Lógica interna:** Horários, locais e eventos precisam ser consistentes entre si.
- **Jogo em primeiro lugar:** O caso é pensado para ser jogável e divertido, não para ser realista demais.

---

## EVIDÊNCIAS OBRIGATÓRIAS

- **1 evidência física** (seja na descrição, em alguma testemunha ou pistas)
- **1 evidência comportamental** (seja na descrição, em alguma testemunha ou pistas)
- **1 evidência temporal** (seja na descrição, em alguma testemunha ou pistas)

---

## PROIBIÇÕES

- Não pode existir 2 suspeitos possíveis
- Não pode existir pista que elimina todos suspeitos
- Não pode existir testemunha que resolve o caso sozinha
- Sempre o caso tem que ter mais de uma evidência que prove o culpado

---

## DADOS DO CASO

- **Número do caso:** sempre sequenciado #0001, #0002, #0003...
- **Data do caso:** data real, para registro na base de dados
- **Crimes especiais em datas comemorativas** (Halloween, Natal, etc.): nunca declare a data em nenhum campo, nem na descrição
- **Nota 01/03:** sempre na data 01/03 de qualquer ano, o autor do crime sempre vai se chamar Cássio Nunes e sempre será um Cyber Crime ou crime relacionado com Aliens, falha na Matrix, volta no tempo
- **Código do caso:** número, letras e caracteres randômicos gerado automaticamente

---

## TÍTULO E DESCRIÇÃO

- Narrativa de um caso: **mínimo 350, máximo 500 caracteres**
- **Não ficar declarando depoimentos de testemunhas ou pistas.** Use a narrativa como uma **história** que gere curiosidade, instigue e sentimento investigativo
- Crimes sempre da década de 80. Elementos até 1987 (sem smartphones – não faz sentido pela data)
- **Jamais citar a data do caso na descrição**
- **Pista na descrição:** sempre ter algum elemento relevante na solução (ex: "dinheiro do caixa foram levados" indica local = caixa registradora). Deixar sempre uma **pista extra** na descrição
- Sempre adicionar: *"Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas."*

---

## PISTAS (6 tipos – jogador escolhe qual revelar primeiro)

- Horário
- Local
- Acesso
- Álibi
- Comportamento
- Evidência

Use informações soltas: "ouvi boatos que..", "registros incompletos", "por volta das 19:00".

---

## TESTEMUNHAS (3)

- Sempre declarar **nome** e **cargo/função** (ex: cliente, morador, mãe de alguém)
- Cada testemunha dá sua versão. Alguma versão pode ser falsa. Indicar **[VERDADEIRA]** ou **[PODE SER FALSA]**
- Informações discretas: "Suspeito parecia um homem forte" (indica que provavelmente não é mulher)
- Álibi ou testemunhas próximas (esposa, mãe, filhos) podem ou não estar falando a verdade

---

## SUSPEITOS (4)

- Sempre declarar **nome** e **cargo/função** (ex: cliente, morador, funcionário, gerente, encanador)
- **Histórico:** passagem pela polícia e motivo, ou "Sem antecedentes"
- **Característica:** costuma usar azul, anda sempre de boné, tem cabelos longos (evite "usa calça jeans", "não é muito inteligente"; use "costuma usar calça jeans")
- **Correlações:** características devem conectar a pistas, testemunhas e descrição
- **Mínimo 3 suspeitos** citados na descrição, pistas ou depoimentos (1 por vez). Ex: suspeito visto por testemunha; na descrição fala de possível suspeito no local; em pista: "em tal horário foi visto tal pessoa". Álibi: "Paulo estava em casa (confirmado pela mãe)" – a mãe pode estar mentindo
- Garanta a lógica: com todas as testemunhas, pistas e descrição será possível chegar a apenas um resultado correto. Faça de forma **sutil**, para não deixar o jogo simples demais

---

## LOCAIS (4 opções) e MÉTODOS (4 opções)

---

## DOSSIER DO CASO

Texto completo: descrição, solução e dados que levam à prova do caso. **PROVE:**
- Por que o culpado é o correto
- Por que os outros 3 não são
- Suspeito, Local e Método

---

## Formato de saída (JSON)

Retorne APENAS JSON válido, sem markdown.
