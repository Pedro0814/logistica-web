import { getDocs, orderBy, query, where } from 'firebase/firestore'
import { planningCol, actualsCol, attachmentsCol, weekendPolicyDoc } from './converters'

export async function listPlanningByDate(operationId: string, opts: { startISO?: string; endISO?: string; order?: 'asc' | 'desc' } = {}) {
  const col = planningCol(operationId)
  const constraints: any[] = []
  if (opts.startISO) constraints.push(where('date', '>=', opts.startISO))
  if (opts.endISO) constraints.push(where('date', '<=', opts.endISO))
  constraints.push(orderBy('date', opts.order === 'desc' ? 'desc' : 'asc'))
  const snap = await getDocs(query(col, ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listActualsByDate(operationId: string, opts: { startISO?: string; endISO?: string; order?: 'asc' | 'desc' } = {}) {
  const col = actualsCol(operationId)
  const constraints: any[] = []
  if (opts.startISO) constraints.push(where('date', '>=', opts.startISO))
  if (opts.endISO) constraints.push(where('date', '<=', opts.endISO))
  constraints.push(orderBy('date', opts.order === 'desc' ? 'desc' : 'asc'))
  const snap = await getDocs(query(col, ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listAttachmentsByDay(operationId: string, dayId: string) {
  const col = attachmentsCol(operationId)
  const q = query(col, where('dayId', '==', dayId), orderBy('uploadedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getWeekendPolicy(policyId: string) {
  const ref = weekendPolicyDoc(policyId)
  const snap = await ref.get()
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}


