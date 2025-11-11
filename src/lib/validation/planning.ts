export type PlanningCostsCents = {
  ticketsCents: number
  transportLocalCents: number
  hotelCents: number
  foodCents: number
  hydrationCents: number
  allowanceExtraCents: number
}

export type PlanningPatch = {
  id?: string
  date?: string
  unitId?: string
  techIds?: string[]
  plannedAssets?: number
  plannedCosts?: Partial<PlanningCostsCents>
}

export function isISODate(value: unknown): boolean {
  if (typeof value !== 'string' || value.length !== 10) return false
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)
}

export function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every((x) => typeof x === 'string' && x.length > 0)
}

export function validatePlanningPatch(patch: PlanningPatch) {
  const errors: string[] = []

  if (patch.date != null && !isISODate(patch.date)) {
    errors.push('Data inválida: esperado ISO YYYY-MM-DD')
  }
  if (patch.unitId != null && !isNonEmptyString(patch.unitId)) {
    errors.push('unitId inválido')
  }
  if (patch.techIds != null && !isStringArray(patch.techIds)) {
    errors.push('techIds deve ser uma lista de strings (>=1)')
  }
  if (patch.plannedAssets != null && !isNonNegativeInt(patch.plannedAssets)) {
    errors.push('plannedAssets deve ser inteiro não negativo')
  }

  if (patch.plannedCosts) {
    const c = patch.plannedCosts
    const entries: Array<[keyof PlanningCostsCents, unknown]> = [
      ['ticketsCents', c.ticketsCents],
      ['transportLocalCents', c.transportLocalCents],
      ['hotelCents', c.hotelCents],
      ['foodCents', c.foodCents],
      ['hydrationCents', c.hydrationCents],
      ['allowanceExtraCents', c.allowanceExtraCents],
    ]
    for (const [key, val] of entries) {
      if (val == null) continue
      if (!isNonNegativeInt(val)) {
        errors.push(`${String(key)} deve ser inteiro em centavos (>= 0)`) 
      }
    }
  }

  return { ok: errors.length === 0, errors }
}


