import { Timestamp, type FirestoreDataConverter, type DocumentData, doc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Operation,
  Technician,
  UnitDoc,
  Assignment,
  PlanningDay,
  ActualDay,
  OperationAttachment,
  WeekendPolicy,
  OperationWrite,
} from './types'
import { withTimestampsForWrite } from './timestamps'

const withTimestamps = <T>(partial: T | Partial<T>): any => ({
  ...partial,
  createdAt: partial && (partial as any).createdAt ? (partial as any).createdAt : Timestamp.now(),
  updatedAt: Timestamp.now(),
})

export const operationConverter: FirestoreDataConverter<Operation> = {
  toFirestore(model: OperationWrite): DocumentData {
    const { createdAt, ...rest } = model as any
    const docData = withTimestampsForWrite(rest, { touchCreated: !createdAt })
    if (createdAt) (docData as any).createdAt = createdAt
    return docData
  },
  fromFirestore(snapshot) {
    const data = snapshot.data() as any
    const op: Operation = {
      name: data.name,
      client: data.client,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      weekendPolicyId: data.weekendPolicyId,
      allowMultiTechPerInventory: data.allowMultiTechPerInventory,
      equalizeCostsAcrossTechs: data.equalizeCostsAcrossTechs,
      equalizationMode: data.equalizationMode,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
    return op
  },
}

export const technicianConverter: FirestoreDataConverter<Technician> = {
  toFirestore(model) {
    return withTimestamps<any>(model as any)
  },
  fromFirestore(snapshot) {
    return snapshot.data() as Technician
  },
}

export const unitConverter: FirestoreDataConverter<UnitDoc> = {
  toFirestore(model) {
    return withTimestamps<any>(model as any)
  },
  fromFirestore(snapshot) {
    return snapshot.data() as UnitDoc
  },
}

export const assignmentConverter: FirestoreDataConverter<Assignment> = {
  toFirestore(model) {
    return withTimestamps<any>(model as any)
  },
  fromFirestore(snapshot) {
    return snapshot.data() as Assignment
  },
}

export const planningDayConverter: FirestoreDataConverter<PlanningDay> = {
  toFirestore(model) {
    return withTimestamps<any>(model as any)
  },
  fromFirestore(snapshot) {
    return snapshot.data() as PlanningDay
  },
}

export const actualDayConverter: FirestoreDataConverter<ActualDay> = {
  toFirestore(model) {
    return withTimestamps<any>(model as any)
  },
  fromFirestore(snapshot) {
    return snapshot.data() as ActualDay
  },
}

export const attachmentConverter: FirestoreDataConverter<OperationAttachment> = {
  toFirestore(model) {
    return withTimestamps<any>(model as any)
  },
  fromFirestore(snapshot) {
    return snapshot.data() as OperationAttachment
  },
}

export const weekendPolicyConverter: FirestoreDataConverter<WeekendPolicy> = {
  toFirestore(model) {
    return withTimestamps<any>(model as any)
  },
  fromFirestore(snapshot) {
    return snapshot.data() as WeekendPolicy
  },
}

// Helpers de referência tipada
export const operationsCol = () => collection(db, 'operations').withConverter(operationConverter)
export const operationDoc = (operationId: string) => doc(db, 'operations', operationId).withConverter(operationConverter)

export const techniciansCol = () => collection(db, 'technicians').withConverter(technicianConverter)
export const technicianDoc = (techId: string) => doc(db, 'technicians', techId).withConverter(technicianConverter)

export const unitsCol = () => collection(db, 'units').withConverter(unitConverter)
export const unitDoc = (unitId: string) => doc(db, 'units', unitId).withConverter(unitConverter)

export const assignmentsCol = (operationId: string) => collection(db, `operations/${operationId}/assignments`).withConverter(assignmentConverter)
export const planningCol = (operationId: string) => collection(db, `operations/${operationId}/planning`).withConverter(planningDayConverter)
export const actualsCol = (operationId: string) => collection(db, `operations/${operationId}/actuals`).withConverter(actualDayConverter)
export const attachmentsCol = (operationId: string) => collection(db, `operations/${operationId}/attachments`).withConverter(attachmentConverter)

export const weekendPoliciesCol = () => collection(db, 'weekendPolicies').withConverter(weekendPolicyConverter)
export const weekendPolicyDoc = (policyId: string) => doc(db, 'weekendPolicies', policyId).withConverter(weekendPolicyConverter)


