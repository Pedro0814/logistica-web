"use client"
import { buildCostCumulativeSeries, seriesAssetsByDate, movingAverage } from '@/lib/execution/metrics'
import { formatCurrencyBRL } from '@/lib/format/currency'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, Bar } from 'recharts'

export default function RealtimeCharts({ planning, actuals }: { planning: any[]; actuals: any[] }) {
  const costSeries = buildCostCumulativeSeries(planning as any, actuals as any)
  const assetSeries = seriesAssetsByDate(planning as any, actuals as any)
  const avg = movingAverage(assetSeries.map((d) => d?.actual ?? null), 3)
  const assetSeriesWithAvg = assetSeries.map((d, i) => ({ ...d, avg: avg[i] }))

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Gráficos em Tempo Real</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v:number)=> formatCurrencyBRL((Number(v||0))/100)} />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#8884d8" name="Plan (acum)" />
              <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Real (acum)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assetSeriesWithAvg}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#8884d8" name="Bens Plan/dia" />
              <Bar dataKey="actual" fill="#82ca9d" name="Bens Real/dia" />
              <Line type="monotone" dataKey="avg" stroke="#ef4444" name="Média móvel (3d)" dot={false} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


