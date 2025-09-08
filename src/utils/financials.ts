import type { ComputedPlan } from '@/types/schedule'
import type { FinancialInput, CostCategory } from '@/types/planner'

export const DEFAULT_TAX_PERCENT = 9.65

export type FinancialSummary = {
  revenueGross: number
  taxes: number
  revenueNet: number
  costEstimatedByCat: Record<CostCategory, number>
  costActualByCat: Record<CostCategory, number>
  costEstimatedTotal: number
  costActualTotal: number
  profitEstimated: number
  profitActual: number
  marginEstimatedPct: number
  marginActualPct: number
  varianceByCat: Array<{ cat: CostCategory; estimated: number; actual: number; variance: number }>
}

const CATEGORIES: CostCategory[] = ['Transport', 'Lodging', 'PerDiem', 'Technician']

export function estimateCostsByCategory(plan: ComputedPlan): Record<CostCategory, number> {
  const base: Record<CostCategory, number> = {
    Transport: 0,
    Lodging: 0,
    PerDiem: 0,
    Technician: 0,
  }
  plan.days.forEach((d) => {
    if (d.type === 'DESCANSO') return
    base.Transport += d.costs.transport || 0
    base.Lodging += d.costs.lodging || 0
    base.PerDiem += d.costs.perDiem || 0
    base.Technician += d.costs.technician || 0
  })
  return base
}

export function computeFinancials(plan: ComputedPlan, fin: FinancialInput): FinancialSummary {
  const revenueGross = Number(fin.billedAmount || 0)
  const taxPercent = Number(fin.taxPercent ?? DEFAULT_TAX_PERCENT)
  const taxes = revenueGross * (taxPercent / 100)
  const revenueNet = Math.max(0, revenueGross - taxes)

  const costEstimatedByCat = estimateCostsByCategory(plan)
  const costEstimatedTotal = CATEGORIES.reduce((sum, c) => sum + (costEstimatedByCat[c] || 0), 0)

  const costActualByCat: Record<CostCategory, number> = { ...costEstimatedByCat }
  if (fin.actualCosts) {
    for (const key of Object.keys(fin.actualCosts) as CostCategory[]) {
      const v = fin.actualCosts[key]
      if (typeof v === 'number' && !Number.isNaN(v)) costActualByCat[key] = v
    }
  }
  const costActualTotal = CATEGORIES.reduce((sum, c) => sum + (costActualByCat[c] || 0), 0)

  const profitEstimated = revenueNet - costEstimatedTotal
  const profitActual = revenueNet - costActualTotal
  const marginEstimatedPct = revenueNet > 0 ? (profitEstimated / revenueNet) * 100 : 0
  const marginActualPct = revenueNet > 0 ? (profitActual / revenueNet) * 100 : 0

  const varianceByCat = CATEGORIES.map((cat) => {
    const estimated = costEstimatedByCat[cat] || 0
    const actual = costActualByCat[cat] || 0
    return { cat, estimated, actual, variance: estimated - actual }
  })

  return {
    revenueGross,
    taxes,
    revenueNet,
    costEstimatedByCat,
    costActualByCat,
    costEstimatedTotal,
    costActualTotal,
    profitEstimated,
    profitActual,
    marginEstimatedPct,
    marginActualPct,
    varianceByCat,
  }
}


