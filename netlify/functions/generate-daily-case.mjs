import { runGenerateCase } from './lib/generateCase.mjs'

export default async () => {
  try {
    const result = await runGenerateCase()
    console.log(`Case #${result.caseNumber} created for ${result.date}`)
  } catch (err) {
    console.error('Failed to generate daily case:', err)
    throw err
  }
}
