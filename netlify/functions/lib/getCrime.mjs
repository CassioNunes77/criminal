import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export async function getCrimeForDate(dateStr) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
  }

  const db = getFirestore()
  const doc = await db.collection('crimes').doc(dateStr).get()
  if (!doc.exists) return null
  return doc.data()
}
