// Run with: ts-node scripts/clear-demo.ts
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

async function deleteCollection(path: string) {
  const snap = await db.collection(path).get()
  const batch = db.batch()
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

async function main() {
  // Remove OP-DEMO-001 and its subcollections
  const opRef = db.collection('operations').doc('OP-DEMO-001')
  for (const sub of ['assignments', 'planning', 'actuals', 'attachments', 'comments']) {
    await deleteCollection(`operations/${opRef.id}/${sub}`)
  }
  await opRef.delete()

  // Remove technicians
  await deleteCollection('technicians')

  // Remove units
  await deleteCollection('units')

  // Remove weekendPolicies
  await deleteCollection('weekendPolicies')

  console.log('Demo data cleared.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })


