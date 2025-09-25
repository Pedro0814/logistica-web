"use client"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatCurrencyBRL } from '@/lib/format/currency'

export default function DeviationChart({ data }: { data: Array<{ category: string; planned: number; actual: number }> }) {
  const pretty = (k: string) => ({
    ticketsCents: 'Passagens',
    transportLocalCents: 'Transp. Local',
    hotelCents: 'Hotel',
    foodCents: 'Alimentação',
    hydrationCents: 'Hidratação',
    allowanceExtraCents: 'Ajuda Extra',
  } as any)[k] || k
  const chartData = data.map(d => ({ ...d, label: pretty(d.category) }))
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(v:number)=> formatCurrencyBRL((Number(v||0))/100)} />
          <Legend />
          <Bar dataKey="planned" name="Planejado" fill="#6366f1" />
          <Bar dataKey="actual" name="Real" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


