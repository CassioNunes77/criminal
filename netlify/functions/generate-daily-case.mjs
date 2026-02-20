import { runGenerateCase } from './lib/generateCase.mjs'

function getDateBrazil() {
  const now = new Date()
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) // YYYY-MM-DD
}

export default async () => {
  try {
    const dateStr = getDateBrazil()
    const result = await runGenerateCase({ date: dateStr })
    console.log(`Case #${result.caseNumber} created for ${result.date}`)
  } catch (err) {
    console.error('Failed to generate daily case:', err)
    throw err
  }
}
