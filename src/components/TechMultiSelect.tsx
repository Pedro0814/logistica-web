"use client"

import { useEffect, useMemo, useState, useId } from 'react'

export type TechOption = { id: string; name: string; email?: string; role?: string }
type TechMultiSelectProps = {
  value: string[]
  onChange: (techIds: string[]) => void
  options: TechOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  maxItems?: number
  searchable?: boolean
  id?: string
}

export default function TechMultiSelect({ value, onChange, options, label, placeholder = 'Selecionar técnicos...', disabled, error, maxItems, searchable = true, id }: TechMultiSelectProps) {
  const reactId = useId()
  const inputId = id || `techmulti-${reactId}`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return options.filter(o => o.name.toLowerCase().includes(q) || (o.email || '').toLowerCase().includes(q))
  }, [options, query])

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      if (maxItems && value.length >= maxItems) return
      onChange([...value, id])
    }
  }

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700">{label}</label>}
      <div className={`rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} bg-white`}>        
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left px-3 py-2 rounded-xl"
        >
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {value.map((id) => {
                const t = options.find((o) => o.id === id)
                if (!t) return null
                return (
                  <span key={id} className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                    {t.name}
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggle(id) }} className="text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )
              })}
            </div>
          )}
        </button>
        {open && (
          <div className="p-2 border-t">
            {searchable && (
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-2 py-1 border rounded"
              />
            )}
            <div className="max-h-48 overflow-auto mt-2 space-y-1">
              {filtered.map((opt) => {
                const selected = value.includes(opt.id)
                const disabledItem = !!maxItems && value.length >= maxItems && !selected
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabledItem}
                    onClick={() => toggle(opt.id)}
                    className={`w-full text-left px-2 py-2 rounded ${selected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'} ${disabledItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.name}</span>
                      {opt.email && <span className="text-xs text-gray-500">{opt.email}</span>}
                    </div>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">Nenhum técnico encontrado</div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}


