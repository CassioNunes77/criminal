import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import OpenAI from 'openai'

function getDateSpecialInstructions(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  if (month === 3 && day === 1) {
    return 'REGRA ESPECIAL 01/03: O autor do crime DEVE se chamar Cássio Nunes. O caso DEVE ser Cybercrime OU crime relacionado com aliens, falha na matrix ou volta no tempo.'
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

  return `Gere um novo caso criminal para o jogo Nexo Terminal. O caso será escrito em pt-BR. Siga 100% a lógica do jogo.${temaLine}

## REGRAS DE OURO (OBRIGATÓRIAS)
- Solução única: Existe apenas UMA combinação correta: suspeito + local + método.
- Tudo converge: Descrição, pistas e testemunhas verdadeiras devem apoiar a MESMA solução.
- Nada contradiz: Pistas e testemunhas verdadeiras NÃO podem contradizer a solução.
- Falsos coerentes: Testemunhas falsas podem errar ou mentir, mas o caso continua claro e resolvível.
- Sem ambiguidade: O jogador NÃO pode chegar, de forma lógica, a mais de uma solução válida.
- Sem duplicidade: Nomes, locais e métodos ÚNICOS (não repetir entre si).
- Crimes leves: Apenas furto, roubo, arrombamento, cyber crimes década de 80, apropriação indevida e outros, SEM violência grave.
- Caso fechado: O caso tem começo, meio e fim; todas as pistas contribuem para a solução.
- Lógica interna: Horários, locais e eventos precisam ser consistentes entre si.
- Jogo em primeiro lugar: O caso é pensado para ser jogável e divertido, não realista demais.

## EVIDÊNCIAS OBRIGATÓRIAS (distribuir na descrição, pistas ou depoimentos)
- 1 evidência FÍSICA (objeto, impressão, vestígio material).
- 1 evidência COMPORTAMENTAL (ação, hábito, modo de agir do culpado).
- 1 evidência TEMPORAL (horário, sequência de eventos, alibi quebrado).

## PROIBIÇÕES
- NÃO pode existir 2 suspeitos possíveis.
- NÃO pode existir pista que elimina todos os suspeitos.
- NÃO pode existir testemunha que resolve o caso sozinha.
- Sempre o caso tem que ter mais de uma evidência que prove o culpado.

## DADOS DO CASO (uso interno – NUNCA incluir data em campos do JSON)
- Data do caso (real, para registro na base de dados): ${dateStr}
- Número do caso: #${String(caseNumber).padStart(4, '0')} (sempre sequenciado)
- Código do caso: ${caseCode} (número, letras e caracteres randômicos)
- ${dateInstruction}

## TÍTULO E DESCRIÇÃO
- Mínimo 350, máximo 500 caracteres.
- NÃO ficar declarando depoimentos de testemunhas ou pistas na narrativa. Use a narrativa como uma HISTÓRIA que gere curiosidade, instigue e sentimento investigativo.
- Crimes sempre da década de 80. Elementos até 1987 apenas. Smartphones NÃO podem estar no caso.
- JAMAIS citar a data do caso na descrição.
- Pista escondida: sempre ter algum elemento relevante na solução (ex: "dinheiro do caixa foram levados" indica local = caixa registradora). Deixar sempre uma pista extra na descrição.
- Sempre terminar com: "Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas."

## PISTAS (6 tipos – jogador escolhe qual revelar primeiro)
HORARIO, LOCAL, ACESSO, ALIBI, COMPORTAMENTO, EVIDENCIA
- Use informações soltas: "ouvi boatos que..", "registros incompletos", "por volta das 19:00".

## TESTEMUNHAS (3)
- Sempre declarar nome e cargo/função (ex: cliente, morador, mãe de alguém).
- Cada testemunha dá sua versão. Alguma versão pode ser falsa. Indicar [VERDADEIRA] ou [PODE SER FALSA].
- Informações discretas: "Suspeito parecia um homem forte" (indica que provavelmente não é mulher).
- Álibi ou testemunhas próximas (esposa, mãe, filhos) podem ou não estar falando a verdade.

## SUSPEITOS (4)
- Sempre declarar nome e cargo/função (ex: cliente, morador, funcionário, gerente, encanador).
- Histórico: passagem pela polícia e motivo, ou "Sem antecedentes".
- Característica: costuma usar azul, anda sempre de boné, tem cabelos longos. Evite "usa calça jeans" ou "não é muito inteligente"; use "costuma usar calça jeans".
- Correlações: características devem conectar a pistas, testemunhas e descrição.
- Mencionar pelo menos 3 suspeitos na descrição, pistas ou depoimentos (1 por vez). Ex: suspeito visto por testemunha; na descrição fala de possível suspeito no local; em pista: "em tal horário foi visto tal pessoa". Álibi: "Paulo estava em casa (confirmado pela mãe)" – a mãe pode estar mentindo.
- Garanta a lógica: com todas as testemunhas, pistas e descrição será possível chegar a apenas um resultado correto. Faça de forma sutil, para não deixar o jogo simples demais.

## LOCAIS (4 opções), MÉTODOS (4 opções)

## SOLUÇÃO
suspect no formato "Nome, cargo", location e method (exatamente das listas).

## DOSSIER
Texto completo: descrição, solução e dados que levam à prova do caso. PROVE por que o culpado é o correto E por que os outros 3 NÃO são. Prove: Suspeito, Local e Método.

Retorne APENAS um JSON válido, sem markdown ou texto extra. Formato:
{"type":"","location":"","time":"","description":[],"suspects":[{"name":"","cargo":"","criminalRecord":"","caracteristica":""}],"locations":[],"methods":[],"clues":[{"type":"","text":""}],"witnesses":[{"name":"","cargo":"","statement":"","isTruthful":false}],"solution":{"suspect":"","location":"","method":""},"dossier":""}`
}

function generateCaseCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function runGenerateCase(opts = {}) {
  const { tema, forceCaseNumber } = opts
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
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const crimesRef = db.collection('crimes')
  const metaRef = db.collection('_meta').doc('counters')

  let caseNumber = forceCaseNumber || 1
  if (!forceCaseNumber) {
    try {
      const metaDoc = await metaRef.get()
      if (metaDoc.exists) {
        caseNumber = (metaDoc.data().lastCaseNumber || 0) + 1
      }
    } catch (e) {
      console.warn('Could not read case counter:', e.message)
    }
  }

  const caseCode = generateCaseCode()
  const openai = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1'
  })

  const completion = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'Você é um criador de casos criminais para o jogo Nexo Terminal. Crie casos investigativos da década de 80, jogáveis e com lógica fechada. Siga 100% as regras do prompt. Retorne APENAS JSON válido, sem markdown.'
      },
      {
        role: 'user',
        content: getPrompt(dateStr, caseNumber, caseCode, tema)
      }
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
      caracteristica: s.caracteristica || ''
    }
  })

  const ensureDescArr = (desc) => {
    if (Array.isArray(desc)) return desc.map(l => (typeof l === 'string' ? l : String(l ?? '')))
    if (typeof desc === 'string') return desc.split('\n')
    if (desc && typeof desc === 'object') return Object.values(desc).map(v => (typeof v === 'string' ? v : String(v ?? '')))
    return []
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

  const document = {
    type: crime.type || 'CRIME',
    location: crime.location || '',
    time: crime.time || '',
    description: ensureDescArr(crime.description),
    suspects,
    locations: crime.locations || [],
    methods: crime.methods || [],
    clues: (crime.clues || []).map(c => ({ type: c.type || '', text: c.text || '' })),
    witnesses,
    solution: crime.solution || {},
    dossier: crime.dossier || '',
    caseNumber: String(caseNumber).padStart(4, '0'),
    caseCode,
    createdAt: new Date().toISOString(),
    date: dateStr
  }

  await crimesRef.doc(dateStr).set(document)
  await metaRef.set({ lastCaseNumber: caseNumber }, { merge: true })

  return { success: true, caseNumber: document.caseNumber, date: dateStr }
}
