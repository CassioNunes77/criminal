import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import OpenAI from 'openai'

function getDateSpecialInstructions(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  if (month === 3 && day === 1) {
    return `REGRA ESPECIAL 01/03: O autor do crime DEVE se chamar Cássio Nunes. O caso DEVE ser Cybercrime OU crime relacionado com Aliens, falha na Matrix ou volta no tempo. Use como característica: sempre usar roupa preta. Use como comportamento: algo relacionado a tomar Café. Veículo: Geralmente é avistado pilotando uma moto esportiva preta.`
  }

  const holidays = {
    '10-31': 'Halloween - crime com tema apropriado (sem declarar a data)',
    '12-25': 'Natal - crime com tema apropriado (sem declarar a data)',
    '01-01': 'Ano Novo - crime com tema apropriado (sem declarar a data)',
    '04-01': 'Dia da Mentira - crime com tema apropriado (sem declarar a data)'
  }
  if (holidays[mmdd]) {
    return `REGRA ESPECIAL: Data comemorativa (${holidays[mmdd]}). Crie crime com tema apropriado. NUNCA declare a data em nenhum campo.`
  }

  return 'NUNCA declare a data do caso em nenhum campo (descrição, pistas, depoimentos).'
}

function getPrompt(dateStr, caseNumber, caseCode, temaOverride) {
  const dateInstruction = getDateSpecialInstructions(dateStr)
  const temaLine = temaOverride ? `\n## TEMA OBRIGATÓRIO (esta execução)\nO caso DEVE ser em uma ${temaOverride.toUpperCase()}. Local (location) no JSON deve refletir isso.\n\n` : ''

  return `Gere um novo caso criminal para o jogo Nexo Terminal. O caso gerado DEVE obedecer a TODOS os itens abaixo. Siga 100% a lógica do jogo. Nenhuma palavra deve ser ocultada.${temaLine}

## REGRAS DE OURO (OBRIGATÓRIAS)
- Solução única: Existe apenas uma combinação correta: suspeito + local + método.
- Tudo converge: Descrição, pistas e testemunhas verdadeiras devem apoiar a mesma solução.
- Nada contradiz: Pistas e testemunhas verdadeiras não podem contradizer a solução.
- Falsos coerentes: Testemunhas falsas podem errar ou mentir, mas o caso continua claro e resolvível.
- Sem ambiguidade: O jogador não pode chegar, de forma lógica, a mais de uma solução válida.
- Sem duplicidade: Nomes, locais e métodos não podem ser repetidos entre si.
- Crimes leves: Apenas furto, roubo, arrombamento, cyber crimes da década de 80, apropriação indevida e outros, sem violência grave.
- Caso fechado: O caso tem começo, meio e fim; todas as pistas contribuem para a solução.
- Lógica interna: Horários, locais e eventos precisam ser consistentes entre si.
- Jogo em primeiro lugar: O caso é pensado para ser jogável e divertido, não para ser realista demais.

## EVIDÊNCIAS OBRIGATÓRIAS
- Deve existir 1 evidência física (seja na descrição, em alguma testemunha ou pistas).
- Deve existir 1 evidência comportamental (seja na descrição, em alguma testemunha ou pistas).
- Deve existir 1 evidência temporal (seja na descrição, em alguma testemunha ou pistas).
- Sempre o caso tem que ter mais de uma evidência que prove o culpado.

## PROIBIÇÕES
- Não pode existir 2 suspeitos possíveis.
- Não pode existir pista que elimina todos os suspeitos.
- Não pode existir testemunha que resolve o caso sozinha.

## IDIOMA E QUALIDADE
- Caso será escrito em pt-BR, garanta que todas as palavras estejas corretamente digitadas sem erros gramaticais.

## DADOS DO CASO (uso interno – NUNCA incluir data em campos do JSON)
- Data do caso (data real, para registro na base de dados): ${dateStr}
- Número do caso: sempre sequenciado #${String(caseNumber).padStart(4, '0')} #0001 #0002 #0003
- Crimes especiais em datas comemorativas (Halloween, Natal, etc.): Nunca declare a data em nenhum campo, nem na descrição.
- Nota 01/03: sempre na data 01/03 de qualquer ano, o autor do crime sempre vai se chamar Cássio Nunes e sempre será um Cyber Crime ou crime relacionado com Aliens, falha na Matrix, volta no tempo. Característica: sempre usar roupa preta. Comportamento: algo relacionado a tomar Café. Veículo: Geralmente é avistado pilotando uma moto esportiva preta.
- Código do caso: ${caseCode} (número, letras e caracteres randômicos gerado automaticamente para rever casos futuramente).
- ${dateInstruction}

## TÍTULO E DESCRIÇÃO DO CASO
- Título do caso deve ser apenas o nome do caso. Exemplos: (FURTO DE (preencha com um título que tenha correlação com o tema).., Cibercrime em (preencha com um título que tenha correlação com o tema).., ROUBO EM..(preencha com um título que tenha correlação com o tema)) NÃO usar títulos como: (caso de furto, caso de...).
- É obrigatório que o título seja coerente com a descrição do caso.
- Crie uma descrição narrativa de um caso.
- Crie descrição narrativa em tom investigativo, misterioso, tenso, sentimento investigativo. A descrição do caso tem que ser uma sinopse de uma boa história, como um caso de Carmen Sandiego ou Sherlock Holmes, ambientado nos anos 80.
- NÃO ficar declarando depoimentos de testemunhas ou pistas na narrativa.
- NÃO será permitido colocar data, nem dia, nem mês, nem ano na descrição do caso.
- Crimes sempre da década de 80. Crie narrativa considerando apenas elementos que fazem sentido até o ano de 1987.
- Smartphones por exemplo não podem estar no caso, não faz sentido pela data.
- IMPORTANTE: sempre na descrição da história, terá algum elemento relevante na solução do caso. Exemplo: "Dinheiro do caixa foram levados" indica que o local foi a caixa registradora – é uma pista escondida na descrição. Deixar sempre uma pista extra na descrição.
- Nunca declare a data do caso na descrição.
- Sempre adicionar à descrição: "Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas."

## PISTAS (7 tipos – jogador escolhe qual revelar primeiro)
Crie exatamente 7 pistas, uma de cada tipo: HORARIO, LOCAL, ACESSO, ALIBI, COMPORTAMENTO, EVIDENCIA, VEICULO.

### 1. HORÁRIO
Registros de tempo ligados ao crime (relógios, registros, câmeras, rotinas).
Exemplos: "Registro de ponto indica que o último funcionário saiu às 18:45; o crime ocorreu entre 19:00 e 19:30." "Relógio de parede parado às 21:17." "Extrato do caixa mostra última operação às 14:22; o furto foi detectado às 15:00."
Relação: O horário deve eliminar ou apontar suspeitos conforme seus álibis, rotinas ou possibilidade de estar no local.

### 2. LOCAL
Apresentar Indícios do local exato do crime, sem declarar literalmente onde foi o local. (vestígios, sinais, objetos, layout).
- Esse campo vai sugerir indícios no local do crime. (no balcão.., na sessão.., na área.. e qualquer outro local específico, dentro da cena do crime)
Relação: O local deve ser coerente com o método e com quem tinha acesso ou conhecimento do espaço.

### 3. ACESSO
Como o autor chegou ao local (chaves, entradas, conhecimento do lugar).
Exemplos: "Fechadura intacta; só quem tinha chave ou conhecia o sistema de fechadura poderia entrar." "Porta dos fundos sem arrombamento; ex-funcionário sabia onde ficava a chave reserva."
Relação: O acesso deve ligar-se a quem tinha chave, conhecimento ou oportunidade de entrar.

### 4. ÁLIBI
Registro de onde alguém dizia estar no momento do crime (documentos, confirmações, registros).
Exemplos: "Registro de ligação telefônica da casa de Paulo às 20:35; a mãe confirma que ele estava em casa." "Recibo de cinema de Bruno às 21:00; sessão começava às 20:50."
Relação: O álibi pode ser verdadeiro (elimina suspeito) ou falso (mantém suspeito). O jogador NÃO deve saber se é falso; isso só aparece no dossier.

### 5. COMPORTAMENTO
Ações ou hábitos do suspeito na cena ou antes/depois (modo de agir, rotina).
Exemplos: "Suspeito foi direto à seção de.., sem procurar; indica conhecimento prévio do layout." "Quem furtou evitou as câmeras; conhecia os ângulos de vigilância."
Relação: O comportamento deve ligar-se a um suspeito específico (ex-funcionário, cliente frequente, fornecedor, morador, cliente, visitante, prestador de serviço e qualquer outro exemplo).

### 6. EVIDÊNCIA
Vestígios materiais (impressões, objetos, marcas, resíduos).
Exemplos: "Fio de cabelo longo encontrado na prateleira; análise compatível com suspeito de cabelos longos." "Impressão digital no caixa; não consta no cadastro de funcionários."
Relação: A evidência deve apontar para características físicas ou objetos de um suspeito.

### 7. VEÍCULO
Indícios de veículo usado (marcas, descrições, registros).
Exemplos: "Marcas de pneu de moto no barro atrás do estabelecimento; um suspeito possui moto vermelha." "Vizinho anotou placa parcial de um Fusca azul saindo às 21:30." "Homem foi avistado pilotando uma moto esportiva preta."
Relação: O veículo deve coincidir com o de um suspeito (cor, modelo, uso).
A depender do crime veículo não será avistado. **garantir a lógica e coerência da narrativa**

### REGRAS DE USO DAS PISTAS
- Pistas vêm da investigação: registros, perícia, documentos, câmeras, vestígios.
- NÃO vêm de depoimentos: não copiar ou parafrasear o que testemunhas disseram.
- Podem ser compatíveis: uma pista pode reforçar um depoimento, mas deve ter origem própria.
- Toda pista deve ter relação direta com o caso: horário, local, método ou suspeito.
- Toda pista deve ligar-se a pelo menos um suspeito: eliminar, apontar ou manter como candidato.
- Nenhuma pista pode eliminar todos os suspeitos.
- Álibi pode ser falso: a pista pode registrar um álibi que depois se prova mentira. Não declarar na tela; o jogador vê só o registro (ex.: "confirmado pela mãe"); não há indicação de que é falso. O dossier revela a verdade.
- Pistas = fontes da investigação (perícia, registros, vestígios). Testemunhas = depoimentos orais; podem coincidir com pistas, mas não são a origem delas.
- Cada pista deve ter relação direta com o caso e com pelo menos um suspeito.
- Pistas e depoimentos verdadeiros não podem contradizer a solução.
- É obrigatório que as pistas tenham coerência com o caso.
- O jogador precisa cruzar pistas, depoimentos e descrição para chegar à solução.
- Com exceção da pista Álibi que pode ser falso ou não, uma pista não deve ser completamente falsa, pode no máximo ser parcialmente falsa.

## TESTEMUNHAS (5)
- Crie 5 testemunhas relacionadas com o caso.
- Sempre criar nome e sobrenome das testemunhas.
- Sempre declarar cargo ou função ou quem ele ou ela é na história. (exemplos: João Pedro (cliente), Carlos Almeida (morador), Zuleide (mãe de Carlos)).
- Entre as testemunhas será permitido no máximo 1 suspeito como testemunha.
- Cada testemunha dá sua versão (alguma versão pode ser falsa). Indicar [VERDADEIRA] ou [PODE SER FALSA].
- Um depoimento com a tag [PODE SER FALSA] pode ser verdadeiro ou falso.
- Sempre haverá 2 depoimentos com a tag [PODE SER FALSA].
- Use informações discretas: "Suspeito parecia um homem forte" (indica que provavelmente não é mulher).
- Falsos positivos: depoimentos falsos podem indicar comportamento de outro suspeito.
- Alguma testemunha com vínculo com o suspeito pode declarar depoimento falso ou verdadeiro.
- Use elementos que simulem veracidade nos depoimentos e garanta que alguns depoimentos serão mais detalhados.
- Use tensão e mistério nos depoimentos: "ouvi boatos que..", "fiquei assustada..", "ouvi um barulho..".
- Use registros incompletos. Use horários aproximados (ex: por volta de 19:00).
- Álibi ou testemunhas próximas (esposa, mãe, filhos) podem ou não estar falando a verdade.

## SUSPEITOS (4)
- Sempre haverão 4 suspeitos.
- Suspeitos podem ser: funcionários, mãe, marido, estagiário, encanador, morador, turista, e qualquer outra coisa.
- É obrigatório sempre declarar Nome e Sobrenome.
- É obrigatório sempre descrever cargo ou função ou quem ele é na história (ex: cliente, morador, funcionário, gerente, encanador).
- Histórico: se já teve passagem pela polícia e o motivo, ou "Sem antecedentes".
- Todo suspeito terá uma Característica. Exemplos: Cabelos longos até os ombros, Usa óculos de aro grosso, Costuma usar jaqueta de couro, Anda sempre de boné, Usa brincos grandes dourados, Costuma usar camisa azul, Usa tênis branco, Tem barba por fazer, Cabelo cacheado, Usa pulseira de prata. Crie característica de acordo com o caso. (Evite "usa calça jeans"; use "costuma usar calça jeans").
- É obrigatório que características sejam coerentes com o sexo do suspeito.
- Todo suspeito terá um Comportamento. Exemplos: Foi direto ao local sem hesitar, Parecia nervoso perto do caixa, Saiu correndo após o crime, Ficou observando a vitrine antes de entrar, Pediu para trocar de nota várias vezes, Desviou o olhar quando questionado, Conhecia o layout da loja, Entrou e saiu em menos de 5 minutos, Foi ao banheiro antes do crime, Fingiu estar procurando algo na estante. Crie comportamento de acordo com o caso.
- Todo suspeito terá um Veículo. Exemplos: Carro conversível vermelho, bicicleta, moto esportiva ou outro meio de transporte, costuma andar a pé. Declare o veículo como comentário. Exemplo: "Geralmente avistado pilotando uma moto esportiva preta."
- Correlações: características devem conectar a pistas, testemunhas e descrição. Alguma menção que conecta ao suspeito.
- Mencionar pelo menos 3 suspeitos na descrição ou em depoimento de alguma testemunha ou em alguma pista. Pelo menos 3 suspeitos devem ser citados 1 por vez. Ex: suspeito visto por testemunha; na descrição fala de possível suspeito no local; em pista: "em tal horário foi visto tal pessoa". Álibi: "Paulo estava em casa (confirmado pela mãe)" – a mãe pode estar mentindo.
- Garanta a lógica: com todas as testemunhas, pistas e descrição será possível chegar a apenas um resultado correto. Faça de forma sutil, para não deixar o jogo simples demais.

## LOCAIS (4 opções) e MÉTODOS (4 opções)
- É Obrigatório que o local do crime seja específico. Ex: na sessão de fitas raras, no CDP do banco, no estoque, na área administrativa da loja.
- use métodos bem distintos, não use métodos similares para que eles não sejam confundidos.

## SOLUÇÃO
- suspect no formato "Nome, cargo" (exatamente das listas).
- location e method exatamente das listas.

## DOSSIER DO CASO
- Texto completo: descrição, solução e dados que levam à prova do caso.
- PROVE por que o culpado é o correto e por que os outros 3 NÃO são.
- PROVE: Suspeito.
- PROVE: Local.
- PROVE: Método.
- Declarar falsos positivos, se houver.

Retorne APENAS um JSON válido, sem markdown ou texto extra. clues: 7 itens (HORARIO, LOCAL, ACESSO, ALIBI, COMPORTAMENTO, EVIDENCIA, VEICULO). witnesses: 5 itens.
Formato: {"type":"","location":"","time":"","description":[],"suspects":[{"name":"","cargo":"","criminalRecord":"","comportamento":"","caracteristica":"","veiculo":""}],"locations":[],"methods":[],"clues":[{"type":"","text":""}],"witnesses":[{"name":"","cargo":"","statement":"","isTruthful":false}],"solution":{"suspect":"","location":"","method":""},"dossier":""}`
}

function generateCaseCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const TEMAS_ALEATORIOS = [
  'videolocadora', 'lanchonete', 'joalheria', 'banco', 'loja de eletrônicos',
  'biblioteca', 'farmácia', 'restaurante', 'posto de gasolina', 'agência de viagens',
  'loja de discos', 'floricultura', 'papelaria', 'sorveteria', 'padaria'
]

export async function runGenerateCase(opts = {}) {
  const { tema, forceCaseNumber, date: dateOverride } = opts
  const apiKey = process.env.GROQ_API_KEY
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
  }

  const db = getFirestore()
  const dateStr = dateOverride || (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })()

  const crimesRef = db.collection('crimes')
  const metaRef = db.collection('_meta').doc('counters')

  // Tema: aleatório quando não informado
  const temaFinal = tema || TEMAS_ALEATORIOS[Math.floor(Math.random() * TEMAS_ALEATORIOS.length)]

  // caseNumber: sequencial via transação atômica em _meta/counters
  let caseNumber = forceCaseNumber
  if (caseNumber == null) {
    try {
      caseNumber = await db.runTransaction(async (transaction) => {
        const metaDoc = await transaction.get(metaRef)
        const next = (metaDoc.exists ? (metaDoc.data().lastCaseNumber || 0) : 0) + 1
        transaction.set(metaRef, { lastCaseNumber: next }, { merge: true })
        return next
      })
    } catch (e) {
      console.warn('Could not get case number from transaction:', e.message)
      caseNumber = 1
    }
  }

  const caseCode = generateCaseCode()
  const openai = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1'
  })

  const systemPrompt = `Você é um criador de casos criminais para o jogo Nexo Terminal. Crie casos investigativos da década de 80, jogáveis e com lógica fechada. Siga 100% as regras do prompt. O caso gerado DEVE obedecer a TODOS os itens. Nenhuma palavra deve ser ocultada. Retorne APENAS JSON válido, sem markdown.`

  const completion = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: getPrompt(dateStr, caseNumber, caseCode, temaFinal) }
    ],
    temperature: 0.8,
    max_tokens: 4000
  })

  const content = completion.choices[0]?.message?.content?.trim() || ''
  let jsonStr = content
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
  }

  const crime = JSON.parse(jsonStr)

  const suspects = (crime.suspects || []).map(s => {
    const rawName = (s.name || '').trim()
    let name = rawName
    let cargo = (s.cargo || '').trim()
    if (!cargo && rawName.includes(', ')) {
      const idx = rawName.indexOf(', ')
      name = rawName.slice(0, idx).trim()
      cargo = rawName.slice(idx + 1).trim()
    }
    return {
      name,
      cargo,
      criminalRecord: s.criminalRecord || 'Sem antecedentes',
      comportamento: s.comportamento || '',
      caracteristica: s.caracteristica || '',
      veiculo: s.veiculo || ''
    }
  })

  const caseNumStr = String(caseNumber).padStart(4, '0')

  const ensureDescArr = (desc) => {
    if (Array.isArray(desc)) return desc.map(l => (typeof l === 'string' ? l : String(l ?? '')))
    if (typeof desc === 'string') return desc.split('\n')
    if (desc && typeof desc === 'object') return Object.values(desc).map(v => (typeof v === 'string' ? v : String(v ?? '')))
    return []
  }

  // Garante que descrição e dossier usem o caseNumber correto (a IA pode gerar número errado)
  const fixCaseNumberRefs = (text) => {
    if (typeof text !== 'string') return text
    return text.replace(/\bCASO\s*#\s*\d+/gi, `CASO #${caseNumStr}`)
  }

  const normalizeWitness = (w) => {
    const rawName = (w.name || '').trim()
    let name = rawName
    let cargo = (w.cargo || '').trim()
    if (!cargo && rawName.includes(', ')) {
      const idx = rawName.indexOf(', ')
      name = rawName.slice(0, idx).trim()
      cargo = rawName.slice(idx + 1).trim()
    }
    return {
      name,
      cargo,
      statement: w.statement || '',
      isTruthful: !!w.isTruthful
    }
  }
  const witnesses = (crime.witnesses || []).map(normalizeWitness)

  const rawDesc = ensureDescArr(crime.description)
  const description = rawDesc.map(line => fixCaseNumberRefs(line))
  const dossier = fixCaseNumberRefs(crime.dossier || '')

  const document = {
    type: crime.type || 'CRIME',
    location: crime.location || '',
    time: crime.time || '',
    description,
    suspects,
    locations: crime.locations || [],
    methods: crime.methods || [],
    clues: (crime.clues || []).map(c => ({ type: c.type || '', text: c.text || '' })),
    witnesses,
    solution: crime.solution || {},
    dossier,
    caseNumber: caseNumStr,
    caseCode,
    createdAt: new Date().toISOString(),
    date: dateStr
  }

  await crimesRef.doc(dateStr).set(document)

  return { success: true, caseNumber: document.caseNumber, date: dateStr }
}
