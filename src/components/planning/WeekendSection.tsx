"use client"

import WeekendPolicyBuilder from '@/components/WeekendPolicyBuilder'
import { businessDaysBetween } from '@/lib/planning/utils'

type Week = { weekIndex: number; saturday: 'work' | 'off'; sunday: 'work' | 'off' }

export default function WeekendSection({
  startISO,
  endISO,
  weeks,
  onChange,
}: {
  startISO: string
  endISO: string
  weeks: Week[]
  onChange: (next: Week[]) => void
}) {
  const total = Math.max(weeks.length, Math.ceil((new Date(endISO).getTime() - new Date(startISO).getTime()) / (7 * 24 * 3600 * 1000))) || 1
  const { satWork, sunWork } = businessDaysBetween(weeks, startISO, endISO)

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Regras de Fim de Semana</h2>
      <WeekendPolicyBuilder weeks={weeks} totalWeeks={total} onChange={onChange} />
      <p className="text-xs text-gray-500 mt-2">Sábados trabalhados: {satWork}/{total} · Domingos trabalhados: {sunWork}/{total}</p>
    </div>
  )
}


