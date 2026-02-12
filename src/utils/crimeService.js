import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { getDailyCrime as getLocalCrime } from './dailySeed'

/**
 * Busca o crime do dia no Firestore.
 * Coleção: crimes
 * Documento: YYYY-MM-DD (ex: 2026-02-12)
 *
 * Se não encontrar ou Firebase falhar, usa o fallback local (dailySeed).
 */
export async function getDailyCrimeFromFirebase() {
  if (!db || !import.meta.env.VITE_FIREBASE_API_KEY) {
    return getLocalCrime()
  }

  const today = new Date()
  const dateId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  try {
    const docRef = doc(db, 'crimes', dateId)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      const data = snapshot.data()
      return transformFirestoreCrime(data, dateId)
    }
  } catch (err) {
    console.warn('Firebase crime fetch failed, using local:', err.message)
  }

  return getLocalCrime()
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
