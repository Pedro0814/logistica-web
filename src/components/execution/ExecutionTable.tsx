"use client"
import MoneyInput from '@/components/MoneyInput'

type Row = {
  id: string
  date: string
  unitLabel: string
  techIds: string[]
  plannedAssets: number
  plannedCosts: any
  actualAssets?: number
  actualCosts?: any
  note?: string
}

export default function ExecutionTable({ rows, onChange, savingIds, readOnly }: { rows: Row[]; onChange: (id: string, patch: any) => void; savingIds?: Set<string>; readOnly?: boolean }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Lançamentos Reais</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">Data</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Bens (real)</th>
              <th className="p-2">Passagens</th>
              <th className="p-2">Transp. Local</th>
              <th className="p-2">Hotel</th>
              <th className="p-2">Alimentação</th>
              <th className="p-2">Hidratação</th>
              <th className="p-2">Ajuda Extra</th>
              <th className="p-2">Obs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pc = r.plannedCosts || {}
              const ac = r.actualCosts || {}
              const over = (val: number, plan: number) => plan > 0 ? Math.round((val / plan) * 100) : (val > 0 ? 200 : 0)
              const cls = (val: number, plan: number) => (plan > 0 && val > plan * 1.5) ? 'ring-1 ring-red-400 rounded' : ''
              return (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-xs text-gray-500">{r.date}</div>
                    <div className="text-[10px] text-gray-400">{savingIds?.has(r.id) ? 'Salvando…' : '✓ salvo'}</div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-xs text-gray-700" title={r.unitLabel==='—' ? 'Unidade não encontrada' : undefined}>{r.unitLabel}</div>
                    <div className="text-[10px] text-gray-400">{r.techIds.length} técnicos</div>
                  </td>
                  <td className="p-2">
                    <div className="text-[10px] text-gray-500 mb-1">Plan: {r.plannedAssets}</div>
                    <input type="number" min={0} className="w-24 px-2 py-1 border rounded" value={r.actualAssets || 0} onChange={(e) => onChange(r.id, { actualAssets: Math.max(0, Number(e.target.value||0)) })} readOnly={readOnly} />
                  </td>
                  {([
                    ['ticketsCents','Passagens'],
                    ['transportLocalCents','Transp. Local'],
                    ['hotelCents','Hotel'],
                    ['foodCents','Alimentação'],
                    ['hydrationCents','Hidratação'],
                    ['allowanceExtraCents','Ajuda Extra'],
                  ] as const).map(([key]) => {
                    const plan = pc[key] || 0
                    const val = ac[key] || 0
                    const pct = over(val, plan)
                    return (
                      <td key={key} className="p-2">
                        <div className={`text-[10px] mb-1 ${plan>0 && pct>150 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{plan>0? `${pct}% do planejado${pct>150?' (>'+150+'%)':''}` : (val>0? 'sem referência' : '')}</div>
                        <div className={cls(val, plan)}>
                          <MoneyInput valueInCents={val} onChange={(v) => onChange(r.id, { actualCosts: { ...ac, [key]: Math.max(0, v||0) } })} disabled={readOnly} />
                        </div>
                        <div className="text-[10px] text-gray-400">(Plan: R$ {(plan/100).toFixed(2)})</div>
                      </td>
                    )
                  })}
                  <td className="p-2">
                    <input className="w-40 px-2 py-1 border rounded" value={r.note||''} onChange={(e) => onChange(r.id, { note: e.target.value })} readOnly={readOnly} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


