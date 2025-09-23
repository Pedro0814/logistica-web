import { EXECUTION_CAP_MULTIPLIER } from '@/lib/config'

export type MoneyMap = Record<string, number>

export function validateAssetsNonNegative(n: unknown) {
  const v = Number(n ?? 0)
  return Number.isFinite(v) && v >= 0 && Number.isInteger(v)
}

export function validateMoneyNonNegative(v: unknown) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) && n >= 0
}

export function validateCapAgainstPlan(actual: number, planned: number) {
  if (!Number.isFinite(actual) || actual < 0) return false
  if (!Number.isFinite(planned) || planned < 0) return true
  return actual <= planned * EXECUTION_CAP_MULTIPLIER
}

export function validateRowPatch(patch: any, planned: { assets?: number; costs?: MoneyMap }) {
  const errors: string[] = []
  if (patch.actualAssets !== undefined && !validateAssetsNonNegative(patch.actualAssets)) {
    errors.push('Bens/dia deve ser inteiro não negativo.')
  }
  if (patch.actualCosts) {
    for (const [k, v] of Object.entries(patch.actualCosts as MoneyMap)) {
      if (!validateMoneyNonNegative(v)) errors.push(`Valor inválido em ${k}.`)
      const plan = (planned.costs?.[k] as number) || 0
      if (!validateCapAgainstPlan(Number(v), plan)) errors.push(`Valor em ${k} excede o limite (${EXECUTION_CAP_MULTIPLIER}x do planejado).`)
    }
  }
  return { ok: errors.length === 0, errors }
}


