import { getCrimeForDate } from './lib/getCrime.mjs'

function getDateId() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export default async (req) => {
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
  const dateParam = url.searchParams.get('date')
  const dateId = dateParam || getDateId()

  if (req.method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  }

  if (req.method !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const data = await getCrimeForDate(dateId)
    if (!data) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Crime not found', date: dateId })
      }
    }

    const crimeId = parseInt(dateId.replace(/-/g, ''), 10)
    const suspects = data.suspects || []

    const normalizeSuspect = (s) => {
      if (typeof s !== 'object') return { name: String(s), cargo: '', criminalRecord: 'Sem antecedentes', comportamento: '', caracteristica: '', veiculo: '' }
      const rawName = (s.name || '').trim()
      let name = rawName
      let cargo = (s.cargo || '').trim()
      if (!cargo && rawName.includes(', ')) {
        const idx = rawName.indexOf(', ')
        name = rawName.slice(0, idx).trim()
        cargo = rawName.slice(idx + 1).trim()
      }
      const fullName = cargo ? `${name}, ${cargo}` : name
      return { name: fullName, displayName: name, cargo, criminalRecord: s.criminalRecord || 'Sem antecedentes', comportamento: s.comportamento || '', caracteristica: s.caracteristica || '', veiculo: s.veiculo || '' }
    }
    const normalizeWitness = (w) => {
      if (!w || typeof w !== 'object') return { name: '', cargo: '', statement: '', isTruthful: false }
      const rawName = (w.name || '').trim()
      let name = rawName
      let cargo = (w.cargo || '').trim()
      if (!cargo && rawName.includes(', ')) {
        const idx = rawName.indexOf(', ')
        name = rawName.slice(0, idx).trim()
        cargo = rawName.slice(idx + 1).trim()
      }
      return { name, cargo, statement: w.statement || '', isTruthful: !!w.isTruthful }
    }
    const suspectsWithRecords = suspects.map(normalizeSuspect)
    const witnesses = (data.witnesses || []).map(normalizeWitness)

    const ensureString = (v) => (typeof v === 'string' ? v : (v && typeof v === 'object' ? String(v.type ?? v.name ?? v.value ?? '') : String(v ?? '')))
    const ensureDescArr = (desc) => {
      if (Array.isArray(desc)) return desc.map(l => (typeof l === 'string' ? l : String(l ?? '')))
      if (typeof desc === 'string') return desc.split('\n')
      if (desc && typeof desc === 'object') return Object.values(desc).map(v => (typeof v === 'string' ? v : String(v ?? '')))
      return []
    }

    const crime = {
      id: crimeId,
      caseCode: data.caseCode || String(crimeId),
      caseNumber: data.caseNumber,
      type: data.type || 'CRIME',
      location: data.location || '',
      time: data.time || '',
      description: ensureDescArr(data.description),
      suspects: suspectsWithRecords.map(s => s.name),
      suspectsWithRecords,
      locations: (data.locations || []).map(ensureString),
      methods: (data.methods || []).map(ensureString),
      clues: (data.clues || []).map(c => ({
        type: c.type,
        text: c.text,
        revealed: false
      })),
      witnesses,
      solution: data.solution || {},
      dossier: data.dossier || '',
      date: data.date || dateId
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(crime)
    }
  } catch (err) {
    console.error('get-crime failed:', err)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message || 'Failed to fetch crime' })
    }
  }
}
