#!/usr/bin/env node
/**
 * Atualiza o caso de hoje para #0001 na base Firebase.
 * Uso: FIREBASE_SERVICE_ACCOUNT='...' node scripts/fix-case-number.mjs
 */

import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
if (!serviceAccountJson) {
  console.error('Erro: defina FIREBASE_SERVICE_ACCOUNT')
  process.exit(1)
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
}

const db = getFirestore()

function getDateStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function main() {
  const dateStr = getDateStr()
  const crimesRef = db.collection('crimes')
  const metaRef = db.collection('_meta').doc('counters')

  const docRef = crimesRef.doc(dateStr)
  const doc = await docRef.get()

  if (!doc.exists) {
    console.error('Nenhum caso encontrado para', dateStr)
    process.exit(1)
  }

  const data = doc.data()
  const description = (data.description || []).map(line =>
    typeof line === 'string' && line.includes('#0002') ? line.replace(/#0002/g, '#0001') : line
  )

  await docRef.update({
    caseNumber: '0001',
    description
  })

  await metaRef.set({ lastCaseNumber: 1 }, { merge: true })

  console.log('OK: Caso atualizado para #0001 em crimes/' + dateStr)
  console.log('OK: _meta/counters lastCaseNumber = 1')
}

main().catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
