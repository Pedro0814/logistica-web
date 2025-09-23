"use client"

import { useState } from 'react'

interface WeekendPolicyBuilderProps {
  value: { saturdays: boolean[]; sundays: boolean[] } // arrays por semana
  onChange: (v: { saturdays: boolean[]; sundays: boolean[] }) => void
  weeks?: number
}

export default function WeekendPolicyBuilder({ value, onChange, weeks = 5 }: WeekendPolicyBuilderProps) {
  const [local, setLocal] = useState(() => {
    return {
      saturdays: value?.saturdays?.length ? value.saturdays.slice(0, weeks) : Array.from({ length: weeks }, () => false),
      sundays: value?.sundays?.length ? value.sundays.slice(0, weeks) : Array.from({ length: weeks }, () => false),
    }
  })

  const toggle = (day: 'saturdays' | 'sundays', index: number) => {
    const next = { ...local, [day]: local[day].map((v, i) => (i === index ? !v : v)) }
    setLocal(next)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Marque quais sábados e domingos serão trabalhados em cada semana do período.</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Sábados</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: weeks }).map((_, i) => (
              <button
                key={`sat-${i}`}
                type="button"
                onClick={() => toggle('saturdays', i)}
                className={`px-3 py-2 rounded-lg border ${local.saturdays[i] ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Semana {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Domingos</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: weeks }).map((_, i) => (
              <button
                key={`sun-${i}`}
                type="button"
                onClick={() => toggle('sundays', i)}
                className={`px-3 py-2 rounded-lg border ${local.sundays[i] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Semana {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


