import { getDoc, doc } from 'firebase/firestore/lite'
import { db } from '../firebase'

const CACHE_PREFIX = 'nexo_crime_cache_'

function decodeFirestoreValue(v) {
  if (!v) return null
  if (v.stringValue !== undefined) return v.stringValue
  if (v.integerValue !== undefined) return parseInt(v.integerValue, 10)
  if (v.booleanValue !== undefined) return v.booleanValue
  if (v.doubleValue !== undefined) return v.doubleValue
  if (v.nullValue !== undefined) return null
  if (v.timestampValue !== undefined) return v.timestampValue
  if (v.arrayValue?.values) return v.arrayValue.values.map(decodeFirestoreValue)
  if (v.mapValue?.fields) {
    const o = {}
    for (const [k, val] of Object.entries(v.mapValue.fields)) o[k] = decodeFirestoreValue(val)
    return o
  }
  return null
}

function decodeFirestoreDoc(fields) {
  if (!fields) return {}
  const o = {}
  for (const [k, v] of Object.entries(fields)) o[k] = decodeFirestoreValue(v)
  return o
}

async function fetchViaRestApi(dateId) {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  if (!projectId || !apiKey) return null
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/crimes/${dateId}?key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return null
  const json = await res.json()
  if (!json.fields) return null
  return decodeFirestoreDoc(json.fields)
}

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

async function fetchViaNetlifyFunction(dateId) {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${base}/.netlify/functions/get-crime?date=${encodeURIComponent(dateId)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const crime = await res.json()
  return crime && crime.id ? crime : null
}

/**
 * Busca o crime do dia.
 * Prioridade: 1) Netlify function (evita Safari) 2) Firebase SDK 3) REST API 4) cache
 */
export async function getDailyCrimeFromFirebase() {
  const dateId = getDateId()

  try {
    const crime = await fetchViaNetlifyFunction(dateId)
    if (crime) {
      const normalized = normalizeCachedCrime(crime)
      cacheCrime(dateId, normalized)
      return normalized
    }
  } catch (err) {
    console.warn('[Nexo] Netlify function falhou:', err.message)
  }

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

  if (apiKey && projectId) {
    try {
      if (db) {
        const docRef = doc(db, 'crimes', dateId)
        const snapshot = await getDoc(docRef)
        if (snapshot.exists()) {
          const data = snapshot.data()
          const crime = transformFirestoreCrime(data, dateId)
          cacheCrime(dateId, crime)
          return crime
        }
      }
    } catch (err) {
      console.warn('[Nexo] Firebase SDK falhou:', err.code || err.name, err.message)
    }

    try {
      const data = await fetchViaRestApi(dateId)
      if (data && Object.keys(data).length > 0) {
        const crime = transformFirestoreCrime(data, dateId)
        cacheCrime(dateId, crime)
        return crime
      }
    } catch (restErr) {
      console.warn('[Nexo] REST fallback falhou:', restErr.message)
    }
  }

  const cached = getCachedCrime(dateId)
  if (cached) return cached

  return null
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

  const description = data.description || []

  return {
    id: crimeId,
    caseCode: data.caseCode || String(crimeId),
    caseNumber: data.caseNumber,
    type: data.type || 'CRIME',
    location: data.location || '',
    time: data.time || '',
    description,
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
