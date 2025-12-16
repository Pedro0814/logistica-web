import { serverTimestamp, doc, setDoc, getDocs, collection, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadUnsigned } from '@/lib/cloudinary/upload'

export type AttachmentInput = {
  operationId: string
  file: File
  meta: {
    dayId?: string
    unitId?: string
    techId?: string
    category: 'hotel' | 'alimentacao' | 'transporte' | 'passagens' | 'outros'
    amountCents?: number
    uploadedBy?: string | null
  }
}

export type AttachmentRecord = {
  id: string
  operationId: string
  dayId?: string | null
  unitId?: string | null
  techId?: string | null
  category: AttachmentInput['meta']['category']
  amountCents?: number | null
  url: string
  publicId: string
  bytes: number
  mime: string
  uploadedAt: any
  uploadedBy?: string | null
}

type Mode = 'firestore' | 'mock'

const mode: Mode = (() => {
  const envMode = (process.env.NEXT_PUBLIC_DATA_MODE || process.env.DATA_MODE || '').toLowerCase()
  if (envMode === 'mock') {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[attachmentService] modo mock ativo (forçado por DATA_MODE)')
    }
    return 'mock'
  }
  if (!db) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[attachmentService] Firestore indisponível, caindo para modo mock')
    }
    return 'mock'
  }
  if (process.env.NODE_ENV !== 'production') {
    console.info('[attachmentService] modo firestore ativo')
  }
  return 'firestore'
})()

const mockStore = new Map<string, AttachmentRecord>()

export async function uploadAttachment({ operationId, file, meta }: AttachmentInput): Promise<AttachmentRecord> {
  const uploaded = await uploadUnsigned(file, { category: meta.category, amountCents: meta.amountCents })
  const id = crypto.randomUUID()
  const record: AttachmentRecord = {
    id,
    operationId,
    dayId: meta.dayId || null,
    unitId: meta.unitId || null,
    techId: meta.techId || null,
    category: meta.category,
    amountCents: meta.amountCents ?? null,
    url: uploaded.url,
    publicId: uploaded.publicId,
    bytes: uploaded.bytes,
    mime: uploaded.mime,
    uploadedAt: Date.now(),
    uploadedBy: meta.uploadedBy || null,
  }

  if (mode === 'mock') {
    mockStore.set(id, record)
    return record
  }

  const ref = doc(db, `operations/${operationId}/attachments/${id}`)
  await setDoc(ref, {
    ...record,
    uploadedAt: serverTimestamp(),
  })
  return record
}

export async function listAttachments(operationId: string, opts: { dayId?: string } = {}): Promise<AttachmentRecord[]> {
  if (mode === 'mock') {
    return Array.from(mockStore.values()).filter((r) => r.operationId === operationId && (!opts.dayId || r.dayId === opts.dayId))
  }
  const constraints: any[] = []
  if (opts.dayId) constraints.push(where('dayId', '==', opts.dayId))
  constraints.push(orderBy('uploadedAt', 'desc'))
  const snap = await getDocs(query(collection(db, `operations/${operationId}/attachments`), ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttachmentRecord))
}

export async function removeAttachment(operationId: string, id: string) {
  if (mode === 'mock') {
    mockStore.delete(id)
    return true
  }
  // Soft delete para manter simples nesta fase
  const ref = doc(db, `operations/${operationId}/attachments/${id}`)
  await setDoc(ref, { deletedAt: serverTimestamp() }, { merge: true })
  return true
}

export function getAttachmentMode(): Mode {
  return mode
}

