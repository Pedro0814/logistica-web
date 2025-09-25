import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { opId, text, scope } = await req.json()
    if (!opId || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    const admin = await getAdmin()
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    let uid = 'anon'
    try {
      if (token) {
        const decoded = await admin.auth().verifyIdToken(token)
        uid = decoded.uid
      }
    } catch {}

    const docRef = admin.firestore().collection('operations').doc(opId).collection('comments').doc()
    await docRef.set({
      author: uid,
      text: String(text),
      scope: scope === 'global' ? 'global' : 'global',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ ok: true, id: docRef.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}


