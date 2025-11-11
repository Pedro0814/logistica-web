type Row = { date: string; unitId: string; techIds: string[]; plannedAssets?: number; actualAssets?: number; plannedCosts?: Record<string, number>; actualCosts?: Record<string, number> }

export function buildRows(planning: Row[], actuals: Row[]) {
  const byId = new Map(actuals.map((a:any) => [a.id, a]))
  return (planning as any[]).map((p:any) => ({
    date: p.date,
    unitId: p.unitId,
    techIds: (p.techIds||[]).join('|'),
    plannedAssets: p.plannedAssets||0,
    actualAssets: (byId.get(p.id)?.actualAssets)||0,
    ticketsPlan: p.plannedCosts?.ticketsCents||0,
    ticketsReal: byId.get(p.id)?.actualCosts?.ticketsCents||0,
    transportPlan: p.plannedCosts?.transportLocalCents||0,
    transportReal: byId.get(p.id)?.actualCosts?.transportLocalCents||0,
    hotelPlan: p.plannedCosts?.hotelCents||0,
    hotelReal: byId.get(p.id)?.actualCosts?.hotelCents||0,
    foodPlan: p.plannedCosts?.foodCents||0,
    foodReal: byId.get(p.id)?.actualCosts?.foodCents||0,
    hydrationPlan: p.plannedCosts?.hydrationCents||0,
    hydrationReal: byId.get(p.id)?.actualCosts?.hydrationCents||0,
    allowancePlan: p.plannedCosts?.allowanceExtraCents||0,
    allowanceReal: byId.get(p.id)?.actualCosts?.allowanceExtraCents||0,
  }))
}

export function toCsv(rows: any[]) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const esc = (s:any) => '"'+String(s ?? '').replace(/"/g,'""')+'"'
  return [headers.join(','), ...rows.map(r=>headers.map(h=>esc((r as any)[h])).join(','))].join('\n')
}


