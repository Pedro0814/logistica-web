"use client"
import { sumPlannedCosts, sumActualCosts, sumPlannedAssets, sumActualAssets } from '@/lib/execution/metrics'

export default function ExecutionHeaderKPIs({ planning, actuals, saving, readonly, role }: { planning: any[]; actuals: any[]; saving: boolean; readonly: boolean; role: string }) {
  const plannedCost = sumPlannedCosts(planning)
  const actualCost = sumActualCosts(actuals)
  const plannedAssets = sumPlannedAssets(planning)
  const actualAssets = sumActualAssets(actuals)

  const pctCost = plannedCost > 0 ? Math.round((actualCost / plannedCost) * 100) : (actualCost > 0 ? 200 : 0)
  const pctAssets = plannedAssets > 0 ? Math.round((actualAssets / plannedAssets) * 100) : (actualAssets > 0 ? 200 : 0)
  const costPerAssetPlan = plannedAssets > 0 ? Math.round(plannedCost / plannedAssets) : 0
  const costPerAssetReal = actualAssets > 0 ? Math.round(actualCost / actualAssets) : 0

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Acompanhamento</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{saving ? 'Salvando…' : 'Sincronizado ✓'}</span>
          <span className={`text-[10px] px-2 py-1 rounded ${readonly ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>{readonly ? `Somente leitura (${role})` : 'Edição habilitada'}</span>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Gasto vs Planejado</p>
          <p className="text-2xl font-semibold">{pctCost}%</p>
          <p className="text-xs text-gray-500">Real: R$ {(actualCost/100).toFixed(2)} / Plan: R$ {(plannedCost/100).toFixed(2)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Bens vs Planejado</p>
          <p className="text-2xl font-semibold">{pctAssets}%</p>
          <p className="text-xs text-gray-500">Real: {actualAssets} / Plan: {plannedAssets}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Custo por bem (Plan)</p>
          <p className="text-2xl font-semibold">R$ {(costPerAssetPlan/100).toFixed(2)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Custo por bem (Real)</p>
          <p className="text-2xl font-semibold">R$ {(costPerAssetReal/100).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}


