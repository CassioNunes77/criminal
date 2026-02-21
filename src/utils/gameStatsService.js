/**
 * Serviço para registrar e buscar estatísticas de jogo no Firebase.
 * Coleção: gameStats
 * - daily/{date}: por dia (caseCode, caseNumber, played, solved, failed)
 * - summary: totais globais
 */

import { collection, doc, setDoc, getDoc, getDocs, increment } from 'firebase/firestore'
import { db } from '../firebase'

function getDateStr(crime) {
  if (crime?.date && /^\d{4}-\d{2}-\d{2}$/.test(crime.date)) return crime.date
  if (crime?.id) {
    const s = String(crime.id)
    if (s.length === 8) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  }
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

/**
 * Registra uma partida no Firebase (caso resolvido ou falhado).
 * @param {Object} crime - Caso atual (caseCode, caseNumber, date, id)
 * @param {boolean} solved - true se resolveu, false se falhou
 */
export async function recordPlay(crime, solved) {
  if (!db) return
  try {
    const dateStr = getDateStr(crime)
    const caseCode = crime?.caseCode || ''
    const caseNumber = crime?.caseNumber || String(crime?.id || '').slice(-4).padStart(4, '0')
    const failed = !solved

    const dailyRef = doc(db, 'gameStats', dateStr)
    await setDoc(dailyRef, {
      caseCode,
      caseNumber,
      caseDate: dateStr,
      played: increment(1),
      solved: solved ? increment(1) : increment(0),
      failed: failed ? increment(1) : increment(0)
    }, { merge: true })

    const summaryRef = doc(db, 'gameStats', '_summary')
    await setDoc(summaryRef, {
      totalPlayed: increment(1),
      totalSolved: solved ? increment(1) : increment(0),
      totalFailed: failed ? increment(1) : increment(0)
    }, { merge: true })
  } catch (err) {
    console.warn('[gameStats] recordPlay failed:', err?.message)
  }
}

/**
 * Busca estatísticas do Firebase.
 * @returns {{ summary: {totalPlayed, totalSolved, totalFailed}, byDay: Array }}
 */
export async function fetchGameStats() {
  if (!db) return { summary: { totalPlayed: 0, totalSolved: 0, totalFailed: 0 }, byDay: [] }

  try {
    const summaryRef = doc(db, 'gameStats', '_summary')
    const summarySnap = await getDoc(summaryRef)
    const summary = summarySnap.exists()
      ? {
          totalPlayed: summarySnap.data().totalPlayed ?? 0,
          totalSolved: summarySnap.data().totalSolved ?? 0,
          totalFailed: summarySnap.data().totalFailed ?? 0
        }
      : { totalPlayed: 0, totalSolved: 0, totalFailed: 0 }

    const statsCol = collection(db, 'gameStats')
    const snap = await getDocs(statsCol)
    const byDay = []
    snap.forEach((d) => {
      if (d.id === '_summary') return
      const data = d.data()
      byDay.push({
        date: d.id,
        caseCode: data.caseCode || '',
        caseNumber: data.caseNumber || '',
        caseDate: data.caseDate || d.id,
        played: data.played ?? 0,
        solved: data.solved ?? 0,
        failed: data.failed ?? 0
      })
    })

    byDay.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    return { summary, byDay }
  } catch (err) {
    console.warn('[gameStats] fetch failed:', err?.message)
    return { summary: { totalPlayed: 0, totalSolved: 0, totalFailed: 0 }, byDay: [] }
  }
}
