import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { getDailyCrime as getLocalCrime } from './dailySeed'

const CACHE_PREFIX = 'nexo_crime_cache_'

function getDateId() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function getCachedCrime(dateId) {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + dateId)
    if (cached) {
      const crime = JSON.parse(cached)
      return normalizeCachedCrime(crime)
    }
  } catch (e) {
    console.warn('Cache read failed:', e.message)
  }
  return null
}

function cacheCrime(dateId, crime) {
  try {
    const toStore = { ...crime }
    delete toStore.date
    localStorage.setItem(CACHE_PREFIX + dateId, JSON.stringify(toStore))
  } catch (e) {
    console.warn('Cache write failed:', e.message)
  }
}

function normalizeCachedCrime(crime) {
  const suspects = crime.suspects || []
  const suspectsWithRecords = crime.suspectsWithRecords || suspects.map(s =>
    typeof s === 'object' ? s : { name: s, criminalRecord: 'Sem antecedentes' }
  )
  return {
    ...crime,
    suspects: suspectsWithRecords.map(s => (typeof s === 'object' ? s.name : s)),
    suspectsWithRecords,
    clues: (crime.clues || []).map(c => ({
      type: c.type,
      text: c.text,
      revealed: false
    }))
  }
}

/**
 * Busca o crime do dia no Firestore.
 * Coleção: crimes
 * Documento: YYYY-MM-DD (ex: 2026-02-12)
 *
 * Modo offline: se Firebase falhar, usa crime em cache (do mesmo dia).
 * Se não houver cache, usa dailySeed local.
 */
export async function getDailyCrimeFromFirebase() {
  const dateId = getDateId()

  if (!db || !import.meta.env.VITE_FIREBASE_API_KEY) {
    const cached = getCachedCrime(dateId)
    if (cached) return cached
    const crime = getLocalCrime()
    cacheCrime(dateId, crime)
    return crime
  }

  try {
    const docRef = doc(db, 'crimes', dateId)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      const data = snapshot.data()
      const crime = transformFirestoreCrime(data, dateId)
      cacheCrime(dateId, crime)
      return crime
    }
  } catch (err) {
    console.warn('Firebase crime fetch failed, trying cache:', err.message)
  }

  const cached = getCachedCrime(dateId)
  if (cached) return cached

  const crime = getLocalCrime()
  cacheCrime(dateId, crime)
  return crime
}

/**
 * Transforma o documento do Firestore para o formato esperado pelo app.
 * Ajuste os campos conforme a estrutura da sua coleção.
 */
function transformFirestoreCrime(data, dateId) {
  const crimeId = parseInt(dateId.replace(/-/g, ''), 10)
  const suspects = data.suspects || []
  const suspectsWithRecords = suspects.map(s =>
    typeof s === 'object' ? s : { name: s, criminalRecord: 'Sem antecedentes' }
  )

  return {
    id: crimeId,
    type: data.type || 'CRIME',
    location: data.location || '',
    time: data.time || '',
    description: data.description || [],
    suspects: suspectsWithRecords.map(s => s.name),
    suspectsWithRecords,
    locations: data.locations || [],
    methods: data.methods || [],
    clues: (data.clues || []).map(c => ({
      type: c.type,
      text: c.text,
      revealed: false
    })),
    witnesses: data.witnesses || [],
    solution: data.solution || {}
  }
}
