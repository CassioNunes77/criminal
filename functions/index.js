import { onSchedule } from 'firebase-functions/v2/scheduler'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import OpenAI from 'openai'

const openaiApiKey = defineSecret('OPENAI_API_KEY')

initializeApp()

const db = getFirestore()

function generateCaseCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function getPrompt(dateStr, caseNumber, caseCode) {
  return `Gere um novo caso criminal para o jogo Nexo Terminal.

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
- Número do caso: #${String(caseNumber).padStart(4, '0')}
- Código do caso: ${caseCode}

## ESTRUTURA OBRIGATÓRIA
- Título e Descrição: máx 500 caracteres. Crimes década de 80. Elementos até 1987 apenas. Incluir pista escondida na descrição. Sempre: "Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas."
- Pistas (6): HORARIO, LOCAL, ACESSO, ALIBI, COMPORTAMENTO, EVIDENCIA
- Testemunhas (3): nome + cargo, statement, isTruthful. Indicar [VERDADEIRA] ou [PODE SER FALSA] no statement.
- Suspeitos (4): nome + cargo, criminalRecord. Mencionar pelo menos 3 em descrição/pistas/depoimentos.
- Locais (4 opções), Métodos (4 opções)
- Solução: suspect, location, method (exatamente das listas)
- Dossier: texto completo interno (caso + solução + provas)

Retorne APENAS um JSON válido, sem markdown ou texto extra. Formato:
{"type":"","location":"","time":"","description":[],"suspects":[{"name":"","criminalRecord":""}],"locations":[],"methods":[],"clues":[{"type":"","text":""}],"witnesses":[{"name":"","statement":"","isTruthful":false}],"solution":{"suspect":"","location":"","method":""},"dossier":""}`
}

export const generateDailyCase = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'America/Sao_Paulo',
    region: 'us-central1',
    secrets: [openaiApiKey]
  },
  async () => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const apiKey = openaiApiKey.value()
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured')
      return
    }

    const crimesRef = db.collection('crimes')
    const metaRef = db.collection('_meta').doc('counters')

    let caseNumber = 1
    try {
      const metaDoc = await metaRef.get()
      if (metaDoc.exists) {
        caseNumber = (metaDoc.data().lastCaseNumber || 0) + 1
      }
    } catch (e) {
      console.warn('Could not read case counter:', e.message)
    }

    const caseCode = generateCaseCode()
    const openai = new OpenAI({ apiKey })

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um criador de casos criminais para o jogo Nexo Terminal. Crie casos investigativos da década de 80, jogáveis e com lógica fechada. Retorne APENAS JSON válido.'
          },
          {
            role: 'user',
            content: getPrompt(dateStr, caseNumber, caseCode)
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

      const document = {
        type: crime.type || 'CRIME',
        location: crime.location || '',
        time: crime.time || '',
        description: crime.description || [],
        suspects: crime.suspects || [],
        locations: crime.locations || [],
        methods: crime.methods || [],
        clues: crime.clues || [],
        witnesses: crime.witnesses || [],
        solution: crime.solution || {},
        dossier: crime.dossier || '',
        caseNumber: String(caseNumber).padStart(4, '0'),
        caseCode,
        createdAt: new Date().toISOString(),
        date: dateStr
      }

      await crimesRef.doc(dateStr).set(document)
      await metaRef.set({ lastCaseNumber: caseNumber }, { merge: true })

      console.log(`Case #${document.caseNumber} created for ${dateStr}`)
    } catch (err) {
      console.error('Failed to generate daily case:', err)
      throw err
    }
  }
)
