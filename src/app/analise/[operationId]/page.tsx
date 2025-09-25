"use client"
import { useParams } from 'next/navigation'
import { usePlanning } from '@/lib/hooks/planning'
import { useActuals } from '@/lib/hooks/actuals'
import { formatCurrencyBRL } from '@/lib/format/currency'
import { aggregateTotals, aggregateByCategory, aggregateByTechUnit, exportToCsv } from '@/lib/analytics'
import DeviationChart from '@/components/DeviationChart'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { useOperation } from '@/lib/hooks/operations'
import { useAttachments } from '@/lib/hooks/attachments'

export default function AnalysisPage() {
  const params = useParams()
  const operationId = String(params?.operationId || '')
  const { data: op } = useOperation(operationId)
  const startISO = (op as any)?.startDate || ''
  const endISO = (op as any)?.endDate || ''

  const { data: planning } = usePlanning(operationId, { startISO, endISO })
  const { data: actuals } = useActuals(operationId, { startISO, endISO })
  const totals = useMemo(() => aggregateTotals((planning as any)||[], (actuals as any)||[]), [planning, actuals])
  const byCategory = useMemo(() => aggregateByCategory((planning as any)||[], (actuals as any)||[]), [planning, actuals])
  const byTechUnit = useMemo(() => aggregateByTechUnit((planning as any)||[], (actuals as any)||[]), [planning, actuals])
  const [comment, setComment] = useState('')

  const onExportCsv = () => {
    const csv = exportToCsv(byTechUnit, ['unitId','techId','plannedCost','actualCost','plannedDays','actualDays','plannedAssets','actualAssets','deviationPct'])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analise-${operationId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Análise — {(op as any)?.name || operationId}</h1>
        <div className="flex gap-2">
          <Button onClick={onExportCsv}>Exportar CSV</Button>
          <Button variant="outline" onClick={() => window.print()}>Exportar PDF</Button>
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Custo Planejado" value={formatCurrencyBRL((totals.plannedCost||0)/100)} />
        <Kpi label="Custo Real" value={formatCurrencyBRL((totals.actualCost||0)/100)} />
        <Kpi label="% Desvio" value={`${(totals.deviationPct||0).toFixed(1)}%`} />
        <Kpi label="Custo por Bem (Real)" value={formatCurrencyBRL((totals.costPerAssetActual||0)/100)} />
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Desvio por Categoria</h2>
        <DeviationChart data={byCategory} />
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Tabela por Técnico/Unidade</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">Unidade</th>
                <th className="p-2">Técnico</th>
                <th className="p-2">Plan (R$)</th>
                <th className="p-2">Real (R$)</th>
                <th className="p-2">% Desvio</th>
                <th className="p-2">Dias Plan</th>
                <th className="p-2">Dias Real</th>
                <th className="p-2">Bens Plan</th>
                <th className="p-2">Bens Real</th>
              </tr>
            </thead>
            <tbody>
              {byTechUnit.map((r) => (
                <tr key={`${r.unitId}-${r.techId}`} className="border-t">
                  <td className="p-2">{r.unitId}</td>
                  <td className="p-2">{r.techId}</td>
                  <td className="p-2">{formatCurrencyBRL((r.plannedCost||0)/100)}</td>
                  <td className="p-2">{formatCurrencyBRL((r.actualCost||0)/100)}</td>
                  <td className={`p-2 ${r.deviationPct>10?'text-red-600': (r.deviationPct<-10?'text-blue-600':'')}`}>{r.deviationPct.toFixed(1)}%</td>
                  <td className="p-2">{r.plannedDays}</td>
                  <td className="p-2">{r.actualDays}</td>
                  <td className="p-2">{r.plannedAssets}</td>
                  <td className="p-2">{r.actualAssets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Justificativas (Global)</h2>
        <textarea className="w-full border rounded p-2 h-28" placeholder="Descreva os principais desvios e justificativas" value={comment} onChange={(e)=>setComment(e.target.value)} />
        <div className="mt-2">
          <SaveComment opId={operationId} text={comment} />
        </div>
      </section>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function SaveComment({ opId, text }: { opId: string; text: string }) {
  const [saving, setSaving] = useState(false)
  const onSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/comments/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ opId, text, scope: 'global' }) })
      if (!res.ok) throw new Error('Falha ao salvar')
      alert('Comentário salvo')
    } catch (e) {
      alert('Erro ao salvar comentário')
    } finally {
      setSaving(false)
    }
  }
  return <Button disabled={saving || !text.trim()} onClick={onSave}>{saving? 'Salvando…' : 'Salvar Comentário'}</Button>
}


