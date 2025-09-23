"use client"

import { useEffect, useMemo, useState } from 'react'

type Week = { weekIndex: number; saturday: 'work' | 'off'; sunday: 'work' | 'off' }

interface WeekendPolicyBuilderProps {
  weeks: Week[]
  onChange: (next: Week[]) => void
  totalWeeks: number
  readonly?: boolean
  className?: string
}

export default function WeekendPolicyBuilder({ weeks, onChange, totalWeeks, readonly, className }: WeekendPolicyBuilderProps) {
  const [local, setLocal] = useState<Week[]>([])

  useEffect(() => {
    const base: Week[] = Array.from({ length: totalWeeks }).map((_, i) => ({ weekIndex: i + 1, saturday: 'off', sunday: 'off' }))
    const merged = base.map((w) => weeks.find((x) => x.weekIndex === w.weekIndex) || w)
    setLocal(merged)
  }, [weeks, totalWeeks])

  const summary = useMemo(() => {
    const sat = local.filter((w) => w.saturday === 'work').length
    const sun = local.filter((w) => w.sunday === 'work').length
    return { sat, sun }
  }, [local])

  const toggle = (index: number, day: 'saturday' | 'sunday') => {
    if (readonly) return
    const next = local.map((w, i) => (i === index ? { ...w, [day]: w[day] === 'work' ? 'off' : 'work' } : w))
    setLocal(next)
    onChange(next)
  }

  const markAll = (day: 'saturday' | 'sunday', value: 'work' | 'off') => {
    if (readonly) return
    const next = local.map((w) => ({ ...w, [day]: value }))
    setLocal(next)
    onChange(next)
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Defina trabalho/folga por semana.</p>
        {!readonly && (
          <div className="flex gap-2">
            <button type="button" className="px-3 py-1 border rounded-lg text-xs" onClick={() => markAll('saturday', 'off')}>Sábado off</button>
            <button type="button" className="px-3 py-1 border rounded-lg text-xs" onClick={() => markAll('saturday', 'work')}>Sábado work</button>
            <button type="button" className="px-3 py-1 border rounded-lg text-xs" onClick={() => markAll('sunday', 'off')}>Domingo off</button>
            <button type="button" className="px-3 py-1 border rounded-lg text-xs" onClick={() => markAll('sunday', 'work')}>Domingo work</button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Sábados</h4>
          <div className="flex flex-wrap gap-2">
            {local.map((w, i) => (
              <button key={`sat-${w.weekIndex}`} type="button" onClick={() => toggle(i, 'saturday')} className={`px-3 py-2 rounded-lg border ${w.saturday === 'work' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                Semana {w.weekIndex}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Domingos</h4>
          <div className="flex flex-wrap gap-2">
            {local.map((w, i) => (
              <button key={`sun-${w.weekIndex}`} type="button" onClick={() => toggle(i, 'sunday')} className={`px-3 py-2 rounded-lg border ${w.sunday === 'work' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                Semana {w.weekIndex}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">Sábados trabalhados: {summary.sat}/{local.length} · Domingos trabalhados: {summary.sun}/{local.length}</p>
    </div>
  )
}


