import { serverTimestamp, type FieldValue } from 'firebase/firestore'

type TSWrite = { createdAt?: FieldValue; updatedAt?: FieldValue }

export function withTimestampsForWrite<T extends object>(
  data: T,
  opts?: { touchCreated?: boolean }
): T & Required<TSWrite> {
  const touchCreated = opts?.touchCreated ?? true
  const base: any = { ...data, updatedAt: serverTimestamp() }
  if (touchCreated) base.createdAt = serverTimestamp()
  return base as T & Required<TSWrite>
}


