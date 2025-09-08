"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { PlannerInput, CostCategory } from '@/types/planner'
import type { ComputedPlan } from '@/types/schedule'
import { computeSchedule, computeCosts, type Assumptions } from '@/utils/planner'
import { computeFinancials, DEFAULT_TAX_PERCENT, estimateCostsByCategory } from '@/utils/financials'
import { loadDraft, saveDraft } from '@/utils/storage'
import { Button } from '@/components/ui/Button'
import { CostsPie } from '@/components/Charts'

export default function FinancePage() {
  const [planner, setPlanner] = useState<PlannerInput | null>(null)
  const [assumptions] = useState<Assumptions>({ dailyWorkingHours: 8, travelHoursPerLeg: 2 })
  const [billedAmount, setBilledAmount] = useState<number>(0)
  const [taxPercent, setTaxPercent] = useState<number>(DEFAULT_TAX_PERCENT)
  const [actualCosts, setActualCosts] = useState<Partial<Record<CostCategory, number>>>({})

  useEffect(() => {
    const d = loadDraft<PlannerInput>()
    if (d) {
      setPlanner(d)
      const fin = d.financial
      if (fin) {
        setBilledAmount(fin.billedAmount || 0)
        setTaxPercent(fin.taxPercent ?? DEFAULT_TAX_PERCENT)
        setActualCosts({ ...(fin.actualCosts || {}) })
      }
    }
  }, [])

  const schedule: ComputedPlan | null = useMemo(() => {
    if (!planner) return null
    const sched = computeSchedule(planner, assumptions)
    const costs = computeCosts(planner, sched)
    return { ...sched, totalCosts: costs.total }
  }, [planner, assumptions])

  const summary = useMemo(() => {
    if (!schedule) return null
    return computeFinancials(schedule, {
      billedAmount,
      taxPercent,
      actualCosts: actualCosts as any,
    })
  }, [schedule, billedAmount, taxPercent, actualCosts])

  const handleRecalc = () => {
    // Recalcular reexecuta memos pois inputs mudaram; aqui basta forçar uma pequena alteração inócua
    setTaxPercent((v) => Number(v))
  }

  const handleSave = () => {
    if (!planner) return
    const next: PlannerInput = {
      ...planner,
      financial: {
        billedAmount: Math.max(0, billedAmount || 0),
        taxPercent: Math.max(0, taxPercent || 0),
        actualCosts: actualCosts as any,
      },
    }
    saveDraft(next)
    setPlanner(next)
    alert('Financeiro salvo no rascunho!')
  }

  if (!planner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Carregue ou crie um planejamento</h1>
            <p className="text-gray-600 mb-8">Para usar o Financeiro, crie um plano e informe o valor cobrado.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/planner">
                <Button size="md">Criar Plano</Button>
              </Link>
              <Link href="/planner/schedule">
                <Button variant="secondary">Ver Cronograma</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const catMap: ReadonlyArray<{ key: CostCategory; label: string }> = [
    { key: 'Transport', label: 'Transporte' },
    { key: 'Lodging', label: 'Hospedagem' },
    { key: 'PerDiem', label: 'Diária (Refeições)' },
    { key: 'Technician', label: 'Técnico' },
  ]

  const estimatedCats = schedule ? estimateCostsByCategory(schedule) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/planner/schedule" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
                <p className="text-sm text-gray-600 mt-1">Impostos considerados: {taxPercent.toFixed(2)}% (aplicados sobre a receita)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleRecalc}>Recalcular</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4">
            Os gráficos consideram Receita Líquida (= Receita Bruta – Impostos de {taxPercent.toFixed(2)}%) para cálculo de lucro e margem. Ajuste o percentual se necessário.
          </div>

          {/* Inputs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Parâmetros</h2>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor cobrado (R$)</label>
                <input
                  type="number"
                  min={0}
                  value={billedAmount}
                  onChange={(e) => setBilledAmount(Number(e.target.value))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">% Impostos</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">Impostos considerados: {taxPercent.toFixed(2)}% (aplicados sobre a receita)</div>
              </div>
            </div>
          </div>

          {/* Empty state when no billedAmount */}
          {(!billedAmount || billedAmount <= 0) && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-gray-100">
              <p className="text-gray-600">Informe o valor cobrado para liberar os gráficos e o resumo financeiro.</p>
            </div>
          )}

          {/* KPI Cards */}
          {summary && billedAmount > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              <KPI label="Receita Bruta" value={summary.revenueGross} accent="text-emerald-600" />
              <KPI label={`Impostos (${taxPercent.toFixed(2)}%)`} value={summary.taxes} accent="text-red-600" />
              <KPI label="Receita Líquida" value={summary.revenueNet} accent="text-emerald-700" />
              <KPI label="Custo Total (Estimado)" value={summary.costEstimatedTotal} />
              <KPI label="Custo Total (Real)" value={summary.costActualTotal} />
              <KPI label="Lucro Estimado" value={summary.profitEstimated} />
              <KPI label="Lucro Real" value={summary.profitActual} />
              <KPIPct label="Margem Estimada" pct={summary.marginEstimatedPct} />
              <KPIPct label="Margem Real" pct={summary.marginActualPct} />
            </div>
          )}

          {/* Table Costs by Category */}
          {summary && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Custos por Categoria</h2>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real (editável)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {catMap.map(({ key, label }) => {
                      const est = summary.costEstimatedByCat[key] || 0
                      const act = (summary.costActualByCat[key] ?? est)
                      const diff = act - est
                      return (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{label}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {est.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min={0}
                              value={Number(actualCosts[key] ?? act)}
                              onChange={(e) => setActualCosts((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                              className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${diff <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {diff <= 0 ? 'Economia' : 'Estouro'}: R$ {Math.abs(diff).toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Charts */}
          {summary && billedAmount > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Custos por Categoria</h3>
                <CostsPie data={Object.entries(summary.costActualByCat).map(([name, value]) => ({ name, value }))} />
                <div className="text-xs text-gray-500 mt-2">Impostos: {taxPercent.toFixed(2)}% aplicados sobre a receita</div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo: Receita, Impostos, Líquida, Custo, Lucro</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span>Receita Bruta</span><span className="font-semibold">R$ {summary.revenueGross.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Impostos</span><span className="font-semibold text-red-600">R$ {summary.taxes.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Receita Líquida</span><span className="font-semibold text-emerald-700">R$ {summary.revenueNet.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Custo Total (Real)</span><span className="font-semibold">R$ {summary.costActualTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Lucro Real</span><span className="font-semibold">R$ {summary.profitActual.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Margem Real</span><span className="font-semibold">{summary.marginActualPct.toFixed(2)}%</span></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Nota: Lucro/Margem calculados sobre Receita Líquida (Bruta – Impostos).</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent || 'text-gray-900'}`}>R$ {Number(value || 0).toFixed(2)}</div>
    </div>
  )
}

function KPIPct({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{Number(pct || 0).toFixed(2)}%</div>
    </div>
  )
}


