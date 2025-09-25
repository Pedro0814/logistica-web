import { NextRequest, NextResponse } from 'next/server'
import { db, verifyIdToken } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const { opId, text, scope } = await req.json()
    if (!opId || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    let uid = 'anon'
    try {
      if (token) uid = (await verifyIdToken(token)).uid
    } catch {}
    if (!db) return NextResponse.json({ error: 'admin db not configured' }, { status: 500 })
    const docRef = db.collection('operations').doc(opId).collection('comments').doc()
    await docRef.set({
      author: uid,
      text: String(text),
      scope: scope === 'global' ? 'global' : 'global',
      createdAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ ok: true, id: docRef.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}


