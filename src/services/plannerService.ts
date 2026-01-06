import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Planner {
  id: string
  title?: string
  data: any
  ownerUid?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  estimatedDays?: number
}

export type PlannerPayload = Partial<Omit<Planner, 'id'>>

type Mode = 'firestore' | 'mock'

const mode: Mode = (() => {
  const envMode = (process.env.NEXT_PUBLIC_DATA_MODE || process.env.DATA_MODE || '').toLowerCase()
  if (envMode === 'mock') {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[plannerService] modo mock ativo (forçado por DATA_MODE)')
    }
    return 'mock'
  }
  if (!db) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[plannerService] Firestore indisponível, caindo para modo mock')
    }
    return 'mock'
  }
  if (process.env.NODE_ENV !== 'production') {
    console.info('[plannerService] modo firestore ativo')
  }
  return 'firestore'
})()

// mock store em memória (não persistente)
const mockStore = new Map<string, Planner>()

function nowISO() {
  return new Date().toISOString()
}

export async function listPlanners(): Promise<Planner[]> {
  if (mode === 'mock') {
    return Array.from(mockStore.values())
  }
  const snap = await getDocs(collection(db, 'plans'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Planner))
}

export async function getPlanner(id: string): Promise<Planner | null> {
  if (mode === 'mock') return mockStore.get(id) || null
  const ref = doc(db, 'plans', id)
  const snap = await getDoc(ref)
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Planner) : null
}

export async function savePlanner(data: any, opts: { title?: string; ownerUid?: string | null } = {}) {
  const id = crypto.randomUUID()
  if (mode === 'mock') {
    mockStore.set(id, {
      id,
      title: opts.title || 'Planejamento',
      data,
      ownerUid: opts.ownerUid || null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    })
    return id
  }
  const ref = doc(collection(db, 'plans'))
  await setDoc(ref, {
    title: opts.title || 'Planejamento',
    data,
    ownerUid: opts.ownerUid || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePlanner(id: string, patch: Partial<PlannerPayload>) {
  if (mode === 'mock') {
    const current = mockStore.get(id)
    if (!current) throw new Error('Planner não encontrado (mock)')
    mockStore.set(id, { ...current, ...patch, updatedAt: nowISO() })
    return true
  }
  const ref = doc(db, 'plans', id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
  return true
}

export async function deletePlanner(id: string) {
  if (mode === 'mock') {
    mockStore.delete(id)
    return true
  }
  const ref = doc(db, 'plans', id)
  await deleteDoc(ref)
  return true
}

export function getPlannerMode(): Mode {
  return mode
}

