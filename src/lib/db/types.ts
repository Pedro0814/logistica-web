import type { Timestamp } from 'firebase/firestore'

export type OperationStatus = 'draft' | 'active' | 'closed'
export type Role = 'tech' | 'coord' | 'admin'
export type EqualizationMode = 'replicate' | 'split' | null

export interface Operation {
  name: string
  client: string
  startDate: string
  endDate: string
  status: OperationStatus
  weekendPolicyId: string | null
  allowMultiTechPerInventory: boolean
  equalizeCostsAcrossTechs: boolean
  equalizationMode: EqualizationMode
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Technician {
  name: string
  email: string
  phone?: string
  role: Role
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UnitDoc {
  code: string
  name: string
  cep: string
  addressLine: string
  district: string
  city: string
  state: string
  ibgeCode?: string
  geo?: { lat: number; lng: number }
  autoFilledFromCEP: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Assignment {
  techId: string
  unitId: string
  plannedDays: number
  plannedStart: string
  plannedEnd: string
  participates: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface PlannedCosts {
  ticketsCents: number
  transportLocalCents: number
  hotelCents: number
  foodCents: number
  hydrationCents: number
  allowanceExtraCents: number
}

export interface PlanningDay {
  date: string
  unitId: string
  techIds: string[]
  plannedAssets: number
  plannedCosts: PlannedCosts
  respectsWeekend: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ActualDay {
  date: string
  unitId: string
  techIds: string[]
  actualAssets: number
  actualCosts: PlannedCosts
  meta: {
    filledBy: string
    filledAt: Timestamp
    deviceInfo?: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type AttachmentCategory = 'hotel' | 'alimentacao' | 'transporte' | 'passagens' | 'outros'

export interface OperationAttachment {
  dayId: string
  unitId: string
  techId?: string
  category: AttachmentCategory
  url: string
  publicId: string
  bytes: number
  mime: string
  uploadedAt: Timestamp
  notes?: string
  createdAt: Timestamp
}

export interface WeekendPolicyWeek {
  weekIndex: number
  saturday: 'work' | 'off'
  sunday: 'work' | 'off'
}

export interface WeekendPolicy {
  name: string
  weeks: WeekendPolicyWeek[]
  createdAt: Timestamp
  updatedAt: Timestamp
}


