import type { ActualRow, ActualCostsCents } from '@/lib/hooks/actuals'

export type PlannedRow = {
  id: string
  date: string
  plannedAssets: number
  plannedCosts: ActualCostsCents
}

export function sumCosts(costs?: ActualCostsCents): number {
  if (!costs) return 0
  const v = (n?: number) => (typeof n === 'number' && n > 0 ? n : 0)
  return v(costs.ticketsCents) + v(costs.transportLocalCents) + v(costs.hotelCents) + v(costs.foodCents) + v(costs.hydrationCents) + v(costs.allowanceExtraCents)
}

export function sumPlannedCosts(rows: PlannedRow[]): number {
  return rows.reduce((acc, r) => acc + sumCosts(r.plannedCosts), 0)
}

export function sumActualCosts(rows: ActualRow[]): number {
  return rows.reduce((acc, r) => acc + sumCosts(r.actualCosts), 0)
}

export function sumPlannedAssets(rows: PlannedRow[]): number {
  return rows.reduce((acc, r) => acc + Math.max(0, r.plannedAssets || 0), 0)
}

export function sumActualAssets(rows: ActualRow[]): number {
  return rows.reduce((acc, r) => acc + Math.max(0, r.actualAssets || 0), 0)
}

export function joinPlanningActuals(planning: PlannedRow[], actuals: ActualRow[]) {
  const byId = new Map(actuals.map((a) => [a.id, a]))
  return planning.map((p) => ({
    ...p,
    actualAssets: byId.get(p.id)?.actualAssets || 0,
    actualCosts: byId.get(p.id)?.actualCosts || {},
  }))
}

export function cumulativeSeriesByDate(planning: PlannedRow[], actuals: ActualRow[]) {
  const dates = Array.from(new Set([...planning, ...actuals].map((r) => r.date))).sort()
  let planAcc = 0
  let actAcc = 0
  return dates.map((d) => {
    planAcc += sumPlannedCosts(planning.filter((r) => r.date === d))
    actAcc += sumActualCosts(actuals.filter((r) => r.date === d))
    return { date: d, planned: planAcc, actual: actAcc }
  })
}

export function seriesAssetsByDate(planning: PlannedRow[], actuals: ActualRow[]) {
  const dates = Array.from(new Set([...planning, ...actuals].map((r) => r.date))).sort()
  return dates.map((d) => ({
    date: d,
    planned: sumPlannedAssets(planning.filter((r) => r.date === d)),
    actual: sumActualAssets(actuals.filter((r) => r.date === d)),
  }))
}

export function movingAverage(values: number[], windowSize = 3) {
  const out: number[] = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const slice = values.slice(start, i + 1)
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return out
}


