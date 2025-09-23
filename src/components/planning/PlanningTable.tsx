"use client"

import MoneyInput from '@/components/MoneyInput'
import TechMultiSelect, { type TechOption } from '@/components/TechMultiSelect'
import { applyEqualizationReplicate, applyEqualizationSplit } from '@/lib/planning/equalization'

export type PlanningRow = {
  id: string
  dateISO: string
  unitId: string
  technicians: string[]
  assetsPerDay: number
  costs: {
    passagens: number
    transporteLocal: number
    hotel: number
    alimentacao: number
    hidratacao: number
    ajudaExtra: number
  }
}

export default function PlanningTable({
  rows,
  units,
  techOptions,
  equalize: { enabled, mode },
  onChange,
  onDuplicate,
}: {
  rows: PlanningRow[]
  units: { id: string; label: string }[]
  techOptions: TechOption[]
  equalize: { enabled: boolean; mode: 'replicate' | 'split' }
  onChange: (idx: number, next: PlanningRow) => void
  onDuplicate: (idx: number) => void
}) {
  const handleTechs = (idx: number, nextTechs: string[]) => {
    const r = rows[idx]
    let next = { ...r, technicians: nextTechs }
    if (enabled) {
      if (mode === 'split') {
        const eq = applyEqualizationSplit({
          ticketsCents: r.costs.passagens,
          transportLocalCents: r.costs.transporteLocal,
          hotelCents: r.costs.hotel,
          foodCents: r.costs.alimentacao,
          hydrationCents: r.costs.hidratacao,
          allowanceExtraCents: r.costs.ajudaExtra,
        }, nextTechs.length)
        next = {
          ...next,
          costs: {
            passagens: eq.ticketsCents,
            transporteLocal: eq.transportLocalCents,
            hotel: eq.hotelCents,
            alimentacao: eq.foodCents,
            hidratacao: eq.hydrationCents,
            ajudaExtra: eq.allowanceExtraCents,
          }
        }
      } else {
        const eq = applyEqualizationReplicate({
          ticketsCents: r.costs.passagens,
          transportLocalCents: r.costs.transporteLocal,
          hotelCents: r.costs.hotel,
          foodCents: r.costs.alimentacao,
          hydrationCents: r.costs.hidratacao,
          allowanceExtraCents: r.costs.ajudaExtra,
        })
        next = {
          ...next,
          costs: {
            passagens: eq.ticketsCents,
            transporteLocal: eq.transportLocalCents,
            hotel: eq.hotelCents,
            alimentacao: eq.foodCents,
            hidratacao: eq.hydrationCents,
            ajudaExtra: eq.allowanceExtraCents,
          }
        }
      }
    }
    onChange(idx, next)
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Cronograma Planejado</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">Data</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Técnicos</th>
              <th className="p-2">Bens/dia</th>
              <th className="p-2">Passagens</th>
              <th className="p-2">Transp. Local</th>
              <th className="p-2">Hotel</th>
              <th className="p-2">Alimentação</th>
              <th className="p-2">Hidratação</th>
              <th className="p-2">Ajuda Extra</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-t">
                <td className="p-2">
                  <input type="date" value={row.dateISO} onChange={(e) => onChange(idx, { ...row, dateISO: e.target.value })} className="px-2 py-1 border rounded" />
                </td>
                <td className="p-2">
                  <select value={row.unitId} onChange={(e) => onChange(idx, { ...row, unitId: e.target.value })} className="px-2 py-1 border rounded">
                    <option value="">Selecione</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <TechMultiSelect options={techOptions} value={row.technicians} onChange={(ids) => handleTechs(idx, ids)} />
                </td>
                <td className="p-2">
                  <input type="number" min={0} value={row.assetsPerDay} onChange={(e) => onChange(idx, { ...row, assetsPerDay: Number(e.target.value) })} className="w-24 px-2 py-1 border rounded" />
                </td>
                <td className="p-2"><MoneyInput valueCents={row.costs.passagens} onChange={(v) => onChange(idx, { ...row, costs: { ...row.costs, passagens: v || 0 } })} /></td>
                <td className="p-2"><MoneyInput valueCents={row.costs.transporteLocal} onChange={(v) => onChange(idx, { ...row, costs: { ...row.costs, transporteLocal: v || 0 } })} /></td>
                <td className="p-2"><MoneyInput valueCents={row.costs.hotel} onChange={(v) => onChange(idx, { ...row, costs: { ...row.costs, hotel: v || 0 } })} /></td>
                <td className="p-2"><MoneyInput valueCents={row.costs.alimentacao} onChange={(v) => onChange(idx, { ...row, costs: { ...row.costs, alimentacao: v || 0 } })} /></td>
                <td className="p-2"><MoneyInput valueCents={row.costs.hidratacao} onChange={(v) => onChange(idx, { ...row, costs: { ...row.costs, hidratacao: v || 0 } })} /></td>
                <td className="p-2"><MoneyInput valueCents={row.costs.ajudaExtra} onChange={(v) => onChange(idx, { ...row, costs: { ...row.costs, ajudaExtra: v || 0 } })} /></td>
                <td className="p-2">
                  <button type="button" onClick={() => onDuplicate(idx)} className="px-2 py-1 border rounded">Duplicar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


