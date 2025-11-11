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

// Robust cumulative series for costs (in cents). Fills gaps with zeros before accumulating.
export function buildCostCumulativeSeries(planning: PlannedRow[], actuals: ActualRow[]) {
  if (!Array.isArray(planning)) planning = []
  if (!Array.isArray(actuals)) actuals = []
  const dates = Array.from(new Set([...planning, ...actuals].map((r) => r.date))).sort()
  let plannedAcc = 0
  let actualAcc = 0
  const series = dates.map((date) => {
    const plannedForDay = sumPlannedCosts(planning.filter((r) => r.date === date))
    const actualForDay = sumActualCosts(actuals.filter((r) => r.date === date))
    plannedAcc += plannedForDay
    actualAcc += actualForDay
    return { date, planned: plannedAcc, actual: actualAcc }
  })
  return series
}

export function seriesAssetsByDate(planning: PlannedRow[], actuals: ActualRow[]) {
  const dates = Array.from(new Set([...planning, ...actuals].map((r) => r.date))).sort()
  return dates.map((d) => ({
    date: d,
    planned: sumPlannedAssets(planning.filter((r) => r.date === d)),
    actual: sumActualAssets(actuals.filter((r) => r.date === d)),
  }))
}

// Moving average that ignores null/undefined and only emits when enough samples exist.
// Returns null when there are not enough valid points to compute a full window.
export function movingAverage(values: Array<number | null | undefined>, windowSize = 3): Array<number | null> {
  const out: Array<number | null> = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const slice = values.slice(start, i + 1)
    const valid = slice.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
    if (valid.length < windowSize) {
      out.push(null)
      continue
    }
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length
    out.push(avg)
  }
  return out
}


