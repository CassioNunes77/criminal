/**
 * Utilitário para estatísticas de casos resolvidos.
 * Agrega dados do localStorage (crime_*) e calcula médias por dia.
 * Relaciona com caseCode para futuras pesquisas.
 */

const TOTAL_CLUES = 7
const TOTAL_WITNESSES = 5
const MAX_ATTEMPTS = 3

function computeAccuracy(state) {
  if (!state) return 0
  const solved = state.solved === true
  const attempts = state.attempts || 0
  const cluesRevealed = (state.cluesRevealed || []).length
  const witnessesCount = (state.witnessesViewed || []).length
  const isFailed = !solved && attempts >= MAX_ATTEMPTS
  if (isFailed) return 0
  return Math.max(0, Math.min(100, Math.round(
    100 -
    cluesRevealed * (25 / TOTAL_CLUES) -
    witnessesCount * (20 / TOTAL_WITNESSES) -
    Math.max(0, attempts - 1) * (55 / (MAX_ATTEMPTS - 1))
  )))
}

function idToDateStr(id) {
  if (!id || typeof id !== 'number') return ''
  const s = String(id)
  if (s.length !== 8) return s
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

/**
 * Coleta todos os casos salvos no localStorage e retorna estatísticas agregadas.
 */
export function getDailyStats() {
  const byDay = []
  let totalSolved = 0
  let totalFailed = 0
  let sumAccuracy = 0
  let solvedCount = 0

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith('crime_')) continue
    const id = parseInt(key.replace('crime_', ''), 10)
    if (isNaN(id)) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const data = JSON.parse(raw)
      const solved = data.solved === true
      const failed = !solved && (data.attempts || 0) >= MAX_ATTEMPTS
      const accuracy = computeAccuracy(data)
      const stats = data.solvedStats || data

      byDay.push({
        date: idToDateStr(id),
        dateId: id,
        caseCode: data.caseCode || '',
        caseNumber: data.caseNumber || String(id).slice(-4).padStart(4, '0'),
        solved,
        failed,
        accuracy,
        attempts: stats.attempts ?? data.attempts ?? 0,
        cluesUsed: (data.cluesRevealed || []).length,
        witnessesUsed: (data.witnessesViewed || []).length
      })

      if (solved) {
        totalSolved++
        sumAccuracy += accuracy
        solvedCount++
      } else if (failed) {
        totalFailed++
      }
    } catch (_) {
      continue
    }
  }

  byDay.sort((a, b) => (b.dateId || 0) - (a.dateId || 0))

  return {
    byDay,
    summary: {
      total: byDay.length,
      solved: totalSolved,
      failed: totalFailed,
      avgAccuracy: solvedCount > 0 ? Math.round(sumAccuracy / solvedCount) : 0
    }
  }
}
