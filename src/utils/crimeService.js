import { getDoc, doc } from 'firebase/firestore/lite'
import { db } from '../firebase'
import { getDailyCrime } from './dailySeed'

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

function ensureDescriptionArray(desc) {
  if (Array.isArray(desc)) {
    return desc.map(line => (typeof line === 'string' ? line : String(line ?? '')))
  }
  if (typeof desc === 'string') {
    return desc.split('\n')
  }
  if (desc && typeof desc === 'object') {
    return Object.values(desc).map(v => (typeof v === 'string' ? v : String(v ?? '')))
  }
  return []
}

function normalizeSuspect(s) {
  if (typeof s !== 'object') return { name: String(s), cargo: '', criminalRecord: 'Sem antecedentes', caracteristica: '' }
  const rawName = (s.name || '').trim()
  let name = rawName
  let cargo = (s.cargo || '').trim()
  if (!cargo && rawName.includes(', ')) {
    const idx = rawName.indexOf(', ')
    name = rawName.slice(0, idx).trim()
    cargo = rawName.slice(idx + 1).trim()
  }
  const fullName = cargo ? `${name}, ${cargo}` : name
  return {
    name: fullName,
    displayName: name,
    cargo,
    criminalRecord: s.criminalRecord || 'Sem antecedentes',
    caracteristica: s.caracteristica || ''
  }
}

function normalizeWitness(w) {
  if (!w || typeof w !== 'object') return { name: '', cargo: '', statement: '', isTruthful: false }
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

function normalizeCrime(crime) {
  const suspects = crime.suspects || []
  const suspectsWithRecords = (crime.suspectsWithRecords || suspects).map(normalizeSuspect)
  return {
    ...crime,
    description: ensureDescriptionArray(crime.description),
    suspects: suspectsWithRecords.map(s => s.name),
    suspectsWithRecords,
    witnesses: (crime.witnesses || []).map(normalizeWitness),
    dossier: crime.dossier || '',
    clues: (crime.clues || []).map(c => ({
      type: c.type,
      text: c.text,
      revealed: false
    }))
  }
}

const PRODUCTION_ORIGIN = 'https://nexoterminal.netlify.app'

async function fetchViaNetlifyFunction(dateId) {
  const origins = []
  if (typeof window !== 'undefined') {
    origins.push(window.location.origin)
    if (window.location.origin !== PRODUCTION_ORIGIN) {
      origins.push(PRODUCTION_ORIGIN)
    }
  } else {
    origins.push(PRODUCTION_ORIGIN)
  }

  for (const base of origins) {
    try {
      const url = `${base}/.netlify/functions/get-crime?date=${encodeURIComponent(dateId)}`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(url, { signal: controller.signal, credentials: 'omit' })
      clearTimeout(timeout)
      if (!res.ok) continue
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) continue
      const crime = await res.json()
      if (crime && crime.id) return crime
    } catch (_) {
      continue
    }
  }
  return null
}

/**
 * Busca o crime do dia.
 * Prioridade: 1) Netlify function (evita Safari) 2) Firebase SDK 3) REST API 4) cache
 */
export async function getDailyCrimeFromFirebase() {
  const dateId = getDateId()

  try {
    const crime = await fetchViaNetlifyFunction(dateId)
    if (crime) return normalizeCrime(crime)
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
          return transformFirestoreCrime(data, dateId)
        }
      }
    } catch (err) {
      console.warn('[Nexo] Firebase SDK falhou:', err.code || err.name, err.message)
    }

    try {
      const data = await fetchViaRestApi(dateId)
      if (data && Object.keys(data).length > 0) {
        return transformFirestoreCrime(data, dateId)
      }
    } catch (restErr) {
      console.warn('[Nexo] REST fallback falhou:', restErr.message)
    }
  }

  try {
    const fallback = getDailyCrime()
    return normalizeCrime({
      ...fallback,
      caseCode: fallback.caseCode || String(fallback.id),
      caseNumber: fallback.caseNumber || String(fallback.id).slice(-4).padStart(4, '0')
    })
  } catch (e) {
    console.error('[Nexo] Fallback crime failed:', e)
    return null
  }
}

/**
 * Transforma o documento do Firestore para o formato esperado pelo app.
 * Ajuste os campos conforme a estrutura da sua coleção.
 */
function transformFirestoreCrime(data, dateId) {
  const crimeId = parseInt(dateId.replace(/-/g, ''), 10)
  const suspects = data.suspects || []
  const suspectsWithRecords = suspects.map(normalizeSuspect)

  const description = ensureDescriptionArray(data.description)

  const witnesses = (data.witnesses || []).map(normalizeWitness)

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
    witnesses,
    solution: data.solution || {},
    dossier: data.dossier || '',
    date: data.date || ''
  }
}
