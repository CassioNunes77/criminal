import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed. Use POST.' }, { status: 405 })
  }

  const secret = process.env.TRIGGER_SECRET
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!secret || (token !== secret && req.headers.get('x-trigger-secret') !== secret)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    return Response.json({ error: 'FIREBASE_SERVICE_ACCOUNT not configured' }, { status: 500 })
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
  }

  const db = getFirestore()
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const crimesRef = db.collection('crimes')
  const metaRef = db.collection('_meta').doc('counters')

  const docRef = crimesRef.doc(dateStr)
  const doc = await docRef.get()

  if (!doc.exists) {
    return Response.json({ error: 'No case found for ' + dateStr }, { status: 404 })
  }

  const data = doc.data()
  const description = (data.description || []).map(line =>
    typeof line === 'string' && line.includes('#0002') ? line.replace(/#0002/g, '#0001') : line
  )

  await docRef.update({ caseNumber: '0001', description })
  await metaRef.set({ lastCaseNumber: 1 }, { merge: true })

  return Response.json({ ok: true, caseNumber: '0001', date: dateStr })
}
