import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore'

export async function getDocData(path: string) {
  const ref = doc(db, path)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function setDocData(path: string, data: any, merge = true) {
  const ref = doc(db, path)
  await setDoc(ref, data, { merge })
  return { id: ref.id, ...data }
}

export async function updateDocData(path: string, data: any) {
  const ref = doc(db, path)
  await updateDoc(ref, data)
}

export async function listCollection(path: string, opts?: { where?: [string, any, any][], order?: [string, 'asc'|'desc'][] }) {
  const col = collection(db, path)
  let q: any = col
  if (opts?.where && opts.where.length) {
    q = query(q, ...opts.where.map((w) => where(w[0], w[1], w[2])))
  }
  if (opts?.order && opts.order.length) {
    q = query(q, ...opts.order.map((o) => orderBy(o[0], o[1])))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => Object.assign({ id: d.id }, d.data() as object))
}


