#!/usr/bin/env node
/**
 * Upload dos casos #0001 a #0005 para o Firebase.
 * Caso #0001 = data de hoje (lançado agora)
 * Casos #0002 a #0005 = próximos 4 dias
 *
 * Uso: FIREBASE_SERVICE_ACCOUNT='...' node scripts/upload-cases.mjs
 * Ou: source .env.local 2>/dev/null; node scripts/upload-cases.mjs
 */

import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { CASES_001_TO_005 } from './cases-001-to-005.js'

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
if (!serviceAccountJson) {
  console.error('Erro: defina FIREBASE_SERVICE_ACCOUNT')
  process.exit(1)
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
}

const db = getFirestore()

function getDateStr(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function main() {
  const crimesRef = db.collection('crimes')
  const metaRef = db.collection('_meta').doc('counters')

  const normalizeSuspect = (s) => {
    const rawName = (s.name || '').trim()
    let name = rawName
    let cargo = (s.cargo || '').trim()
    if (!cargo && rawName.includes(', ')) {
      const idx = rawName.indexOf(', ')
      name = rawName.slice(0, idx).trim()
      cargo = rawName.slice(idx + 1).trim()
    }
    return { name, cargo, criminalRecord: s.criminalRecord || 'Sem antecedentes', comportamento: s.comportamento || '', caracteristica: s.caracteristica || '', veiculo: s.veiculo || '' }
  }

  for (let i = 0; i < CASES_001_TO_005.length; i++) {
    const c = CASES_001_TO_005[i]
    const dateStr = getDateStr(i)
    const normalizeWitness = (w) => {
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

    const suspects = (c.suspects || []).map(normalizeSuspect)
    const witnesses = (c.witnesses || []).map(normalizeWitness)
    const doc = {
      type: c.type || 'CRIME',
      location: c.location || '',
      time: c.time || '',
      description: c.description || [],
      suspects,
      locations: c.locations || [],
      methods: c.methods || [],
      clues: (c.clues || []).map(cl => ({ type: cl.type, text: cl.text })),
      witnesses,
      solution: c.solution || {},
      dossier: c.dossier || '',
      caseNumber: c.caseNumber || String(i + 1).padStart(4, '0'),
      caseCode: c.caseCode || '',
      createdAt: new Date().toISOString(),
      date: dateStr
    }
    await crimesRef.doc(dateStr).set(doc)
    console.log(`OK: Caso #${c.caseNumber} -> crimes/${dateStr}`)
  }

  await metaRef.set({ lastCaseNumber: 5 }, { merge: true })
  console.log('OK: _meta/counters atualizado (lastCaseNumber: 5)')
  console.log('')
  console.log('Caso #0001 lancado para hoje:', getDateStr(0))
}

main().catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
