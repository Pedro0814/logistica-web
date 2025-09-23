// Run with: ts-node scripts/seed-demo.ts (ensure firebase-admin creds in env)
import * as admin from 'firebase-admin'

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
} as admin.ServiceAccount

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}

const db = admin.firestore()

async function main() {
  const now = admin.firestore.Timestamp.now()

  // Technicians
  const techA = db.collection('technicians').doc('techA')
  const techB = db.collection('technicians').doc('techB')
  await techA.set({ name: 'Técnico A', email: 'a@example.com', role: 'tech', active: true, createdAt: now, updatedAt: now })
  await techB.set({ name: 'Técnico B', email: 'b@example.com', role: 'tech', active: true, createdAt: now, updatedAt: now })

  // Units
  const unit1 = db.collection('units').doc()
  const unit2 = db.collection('units').doc()
  const unit3 = db.collection('units').doc()
  const unitBase = { addressLine: 'Rua de Teste, 100', district: 'Centro', city: 'São Paulo', state: 'SP', autoFilledFromCEP: true, createdAt: now, updatedAt: now }
  await unit1.set({ code: 'U001', name: 'Unidade 1', cep: '01001-000', ...unitBase })
  await unit2.set({ code: 'U002', name: 'Unidade 2', cep: '30130-010', ...unitBase })
  await unit3.set({ code: 'U003', name: 'Unidade 3', cep: '20040-020', ...unitBase })

  // Weekend Policy
  const policy = db.collection('weekendPolicies').doc()
  await policy.set({
    name: 'DEMO-3WEEK',
    weeks: [
      { weekIndex: 1, saturday: 'off', sunday: 'off' },
      { weekIndex: 2, saturday: 'work', sunday: 'off' },
      { weekIndex: 3, saturday: 'off', sunday: 'off' },
    ],
    createdAt: now,
    updatedAt: now,
  })

  // Operation
  const op = db.collection('operations').doc('OP-DEMO-001')
  await op.set({
    name: 'Operação Demo 001',
    client: 'Cliente XYZ',
    startDate: '2025-01-06',
    endDate: '2025-01-24',
    status: 'draft',
    weekendPolicyId: policy.id,
    allowMultiTechPerInventory: true,
    equalizeCostsAcrossTechs: true,
    equalizationMode: 'replicate',
    createdAt: now,
    updatedAt: now,
  })

  // Assignments
  const assignments = op.collection('assignments')
  await assignments.add({ techId: techA.id, unitId: unit1.id, plannedDays: 5, plannedStart: '2025-01-06', plannedEnd: '2025-01-10', participates: true, createdAt: now, updatedAt: now })
  await assignments.add({ techId: techB.id, unitId: unit2.id, plannedDays: 5, plannedStart: '2025-01-13', plannedEnd: '2025-01-17', participates: true, createdAt: now, updatedAt: now })

  // Planning days (~15 úteis): alternar unidades, alguns dias com 2 techs
  const planning = op.collection('planning')
  const dates = [
    '2025-01-06','2025-01-07','2025-01-08','2025-01-09','2025-01-10',
    '2025-01-13','2025-01-14','2025-01-15','2025-01-16','2025-01-17',
    '2025-01-20','2025-01-21','2025-01-22','2025-01-23','2025-01-24',
  ]
  const units = [unit1.id, unit2.id, unit3.id]
  for (let i = 0; i < dates.length; i++) {
    const techIds = i % 3 === 0 ? [techA.id, techB.id] : [i % 2 === 0 ? techA.id : techB.id]
    const unitId = units[i % units.length]
    await planning.add({
      date: dates[i],
      unitId,
      techIds,
      plannedAssets: 120,
      plannedCosts: {
        ticketsCents: 50000,
        transportLocalCents: 1500,
        hotelCents: 10000,
        foodCents: 4000,
        hydrationCents: 1000,
        allowanceExtraCents: 2000,
      },
      respectsWeekend: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  // Actuals para 5 dias com desvios
  const actuals = op.collection('actuals')
  for (let i = 0; i < 5; i++) {
    const d = dates[i]
    await actuals.add({
      date: d,
      unitId: units[i % units.length],
      techIds: i % 2 === 0 ? [techA.id] : [techB.id],
      actualAssets: 110 + Math.round(Math.random() * 30),
      actualCosts: {
        ticketsCents: 52000,
        transportLocalCents: 1700,
        hotelCents: 9800,
        foodCents: 4200,
        hydrationCents: 1200,
        allowanceExtraCents: 1800,
      },
      meta: { filledBy: 'seed-script', filledAt: now },
      createdAt: now,
      updatedAt: now,
    })
  }

  // Attachments simulados (2-3 por dayId)
  const attachments = op.collection('attachments')
  for (let i = 0; i < 3; i++) {
    const dayId = '2025-01-0' + (6 + i)
    const uploadedAt = admin.firestore.Timestamp.fromDate(new Date(`2025-01-0${6 + i}T12:0${i}:00Z`))
    await attachments.add({
      dayId,
      unitId: units[i % units.length],
      techId: i % 2 === 0 ? techA.id : techB.id,
      category: i % 2 === 0 ? 'hotel' : 'passagens',
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      publicId: 'demo/sample',
      bytes: 123456,
      mime: 'image/jpeg',
      uploadedAt,
      createdAt: now,
    })
  }

  console.log('Seed concluído.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })


