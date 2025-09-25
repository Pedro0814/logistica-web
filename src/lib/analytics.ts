import { sumCosts } from '@/lib/execution/metrics'

type PlanDay = { date: string; unitId: string; techIds: string[]; plannedAssets?: number; plannedCosts?: Record<string, number> }
type ActualDay = { date: string; unitId: string; techIds: string[]; actualAssets?: number; actualCosts?: Record<string, number> }

export function aggregateTotals(planning: PlanDay[], actuals: ActualDay[]) {
  const plannedCost = planning.reduce((acc, r) => acc + sumCosts(r.plannedCosts as any), 0)
  const actualCost = actuals.reduce((acc, r) => acc + sumCosts(r.actualCosts as any), 0)
  const plannedAssets = planning.reduce((acc, r) => acc + Math.max(0, r.plannedAssets || 0), 0)
  const actualAssets = actuals.reduce((acc, r) => acc + Math.max(0, r.actualAssets || 0), 0)
  const deviationPct = plannedCost > 0 ? ((actualCost - plannedCost) / plannedCost) * 100 : 0
  const costPerAssetPlan = plannedAssets > 0 ? plannedCost / plannedAssets : 0
  const costPerAssetActual = actualAssets > 0 ? actualCost / actualAssets : 0
  return { plannedCost, actualCost, plannedAssets, actualAssets, deviationPct, costPerAssetPlan, costPerAssetActual }
}

export function aggregateByCategory(planning: PlanDay[], actuals: ActualDay[]) {
  const categories = ['ticketsCents','transportLocalCents','hotelCents','foodCents','hydrationCents','allowanceExtraCents']
  const sumBy = (rows: any[], key: string) => rows.reduce((acc, r) => acc + Math.max(0, (r?.[key] || 0)), 0)
  const plan = Object.fromEntries(categories.map((c) => [c, planning.reduce((acc, r) => acc + Math.max(0, (r.plannedCosts?.[c] || 0)), 0)])) as Record<string, number>
  const act = Object.fromEntries(categories.map((c) => [c, actuals.reduce((acc, r) => acc + Math.max(0, (r.actualCosts?.[c] || 0)), 0)])) as Record<string, number>
  return categories.map((c) => ({ category: c, planned: plan[c], actual: act[c] }))
}

export function aggregateByTechUnit(planning: PlanDay[], actuals: ActualDay[]) {
  type Agg = { plannedCost: number; actualCost: number; plannedDays: number; actualDays: number; plannedAssets: number; actualAssets: number }
  const keyFor = (unitId: string, techId: string) => `${unitId || '—'}::${techId || '—'}`
  const agg = new Map<string, Agg>()
  const ensure = (k: string) => { if (!agg.has(k)) agg.set(k, { plannedCost: 0, actualCost: 0, plannedDays: 0, actualDays: 0, plannedAssets: 0, actualAssets: 0 }); return agg.get(k)! }
  for (const p of planning) {
    for (const t of (p.techIds || ['—'])) {
      const a = ensure(keyFor(p.unitId, t))
      a.plannedCost += sumCosts(p.plannedCosts as any)
      a.plannedDays += 1
      a.plannedAssets += Math.max(0, p.plannedAssets || 0)
    }
  }
  for (const aRow of actuals) {
    for (const t of (aRow.techIds || ['—'])) {
      const a = ensure(keyFor(aRow.unitId, t))
      a.actualCost += sumCosts(aRow.actualCosts as any)
      a.actualDays += 1
      a.actualAssets += Math.max(0, aRow.actualAssets || 0)
    }
  }
  return Array.from(agg.entries()).map(([k, v]) => {
    const [unitId, techId] = k.split('::')
    const deviationPct = v.plannedCost > 0 ? ((v.actualCost - v.plannedCost) / v.plannedCost) * 100 : 0
    return { unitId, techId, ...v, deviationPct }
  })
}

export function exportToCsv(rows: any[], headers: string[]): string {
  const esc = (s: any) => '"' + String(s ?? '').replace(/"/g, '""') + '"'
  const head = headers.map(esc).join(',')
  const body = rows.map((r) => headers.map((h) => esc((r as any)[h])).join(',')).join('\n')
  return [head, body].join('\n')
}


