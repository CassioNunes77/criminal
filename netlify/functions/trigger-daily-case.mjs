import { runGenerateCase } from './lib/generateCase.mjs'

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed. Use POST.' }, { status: 405 })
  }

  const secret = process.env.TRIGGER_SECRET
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const headerSecret = req.headers.get('x-trigger-secret') || ''

  if (!secret) {
    return Response.json({ error: 'TRIGGER_SECRET not configured in Netlify' }, { status: 500 })
  }

  if (token !== secret && headerSecret !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(req.url || '', `http://${req.headers.get('host') || 'localhost'}`)
    const tema = url.searchParams.get('tema') || ''
    const result = await runGenerateCase(tema ? { tema } : {})
    return Response.json({ ok: true, ...result })
  } catch (err) {
    console.error('trigger-daily-case failed:', err)
    return Response.json({ error: err.message || 'Failed to generate case' }, { status: 500 })
  }
}
