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
    const suspectsWithRecords = suspects.map(s =>
      typeof s === 'object' ? s : { name: s, criminalRecord: 'Sem antecedentes' }
    )

    const crime = {
      id: crimeId,
      caseCode: data.caseCode || String(crimeId),
      caseNumber: data.caseNumber,
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
