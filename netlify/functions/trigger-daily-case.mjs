import { runGenerateCase } from './lib/generateCase.mjs'

export default async (req) => {
  if (req.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    }
  }

  const secret = process.env.TRIGGER_SECRET
  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const headerSecret = req.headers['x-trigger-secret'] || ''

  if (!secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'TRIGGER_SECRET not configured in Netlify' })
    }
  }

  if (token !== secret && headerSecret !== secret) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    }
  }

  try {
    const result = await runGenerateCase()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, ...result })
    }
  } catch (err) {
    console.error('trigger-daily-case failed:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to generate case' })
    }
  }
}
