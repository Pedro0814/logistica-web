// src/lib/db/converters.ts
import type {
  FirestoreDataConverter,
  DocumentData,
  WithFieldValue,
  PartialWithFieldValue,
  SetOptions,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { Timestamp, collection, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { withTimestampsForWrite } from './timestamps'
import type {
  Operation,
  Technician,
  UnitDoc,
  Assignment,
  PlanningDay,
  ActualDay,
  OperationAttachment,
  WeekendPolicy,
} from './types'

/**
 * Nota: o SDK pode invocar toFirestore com FieldValue em qualquer campo (WithFieldValue).
 * Aqui aceitaremos o parâmetro no formato que o SDK envia, e faremos um mapeamento
 * manual para garantir que apenas fields válidos e timestamps sejam enviados ao Firestore.
 */

type AnyModelInput = WithFieldValue<Operation> | PartialWithFieldValue<Operation>

export const operationConverter: FirestoreDataConverter<Operation> = {
  // Aceita o formato que o SDK pode enviar (com FieldValue)
  toFirestore(modelObject: AnyModelInput, options?: SetOptions): DocumentData {
    // Cast seguro para manipular
    const m = modelObject as any

    // Mapeie explicitamente os campos primários do Operation.
    // NÃO repasse objetos FieldValue para campos não-timestamp.
    const doc: any = {
      // string fields: só atribuí-los se forem strings (ou undefined)
      ...(typeof m.name === 'string' ? { name: m.name } : {}),
      ...(typeof m.client === 'string' ? { client: m.client } : {}),
      ...(typeof m.startDate === 'string' ? { startDate: m.startDate } : {}),
      ...(typeof m.endDate === 'string' ? { endDate: m.endDate } : {}),
      ...(typeof m.weekendPolicyId === 'string' ? { weekendPolicyId: m.weekendPolicyId } : {}),
      ...(typeof m.equalizeCostsAcrossTechs === 'boolean'
        ? { equalizeCostsAcrossTechs: m.equalizeCostsAcrossTechs }
        : {}),
      ...(typeof m.equalizationMode === 'string' ? { equalizationMode: m.equalizationMode } : {}),
      ...(typeof m.allowMultiTechPerInventory === 'boolean'
        ? { allowMultiTechPerInventory: m.allowMultiTechPerInventory }
        : {}),
      ...(typeof m.notes === 'string' ? { notes: m.notes } : {}),
      // adicione outros campos esperados manualmente aqui...
    }

    // Tratamento específico para enums / union types (ex: status)
    // Se for string, atribui; se for FieldValue, ignora (não vaza FieldValue para enum)
    if (typeof m.status === 'string') {
      doc.status = m.status
    }

    // Agora aplique timestamps via helper. Se modelObject trouxe createdAt (FieldValue),
    // preservamos essa intenção (por exemplo, setOnInsert).
    const hasCreatedAt = m && (m.createdAt !== undefined && m.createdAt !== null)

    // withTimestampsForWrite deverá injetar serverTimestamp() em updatedAt
    const docWithTs = withTimestampsForWrite(doc, { touchCreated: !hasCreatedAt })

    // Se o modelObject incluiu explicitamente createdAt (FieldValue), mantenha-o
    if (hasCreatedAt) {
      ;(docWithTs as any).createdAt = m.createdAt
    }

    // Se options indicate merge, o SDK usará a segunda assinatura; retornamos DocumentData
    return docWithTs as DocumentData
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Operation {
    const data = snapshot.data() as any
    return {
      id: snapshot.id,
      name: (data.name as string) ?? '',
      client: (data.client as string) ?? undefined,
      startDate: (data.startDate as string) ?? undefined,
      endDate: (data.endDate as string) ?? undefined,
      weekendPolicyId: (data.weekendPolicyId as string) ?? undefined,
      equalizeCostsAcrossTechs: (data.equalizeCostsAcrossTechs as boolean) ?? false,
      equalizationMode: (data.equalizationMode as any) ?? 'replicate',
      allowMultiTechPerInventory: (data.allowMultiTechPerInventory as boolean) ?? false,
      notes: (data.notes as string) ?? undefined,
      status: (data.status as any) ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Operation
  },
}

const withTimestamps = <T>(partial: T | Partial<T>): any => ({
  ...partial,
  createdAt: partial && (partial as any).createdAt ? (partial as any).createdAt : Timestamp.now(),
  updatedAt: Timestamp.now(),
})

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


