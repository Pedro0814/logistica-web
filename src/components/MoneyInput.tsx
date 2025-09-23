"use client"

import { useState, useEffect, useId } from 'react'
import { formatCurrencyBRL, parseCurrencyToCents } from '@/lib/format/currency'

type MoneyInputProps = {
  label?: string
  valueCents: number | null
  onChange: (cents: number | null) => void
  placeholder?: string
  disabled?: boolean
  hint?: string
  error?: string
  currency?: 'BRL'
  allowNull?: boolean
  id?: string
  'aria-label'?: string
}

export default function MoneyInput({ label, valueCents, onChange, placeholder, disabled, hint, error, currency = 'BRL', allowNull = false, id, ...aria }: MoneyInputProps) {
  const reactId = useId()
  const inputId = id || `money-${reactId}`
  const [text, setText] = useState('')

  useEffect(() => {
    setText(formatCurrencyBRL(valueCents ?? 0))
  }, [valueCents])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setText(raw)
    const cents = parseCurrencyToCents(raw)
    if (cents === null) {
      onChange(allowNull ? null : 0)
    } else {
      onChange(cents)
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700">{label}</label>
      )}
      <input
        id={inputId}
        value={text}
        onChange={handleChange}
        placeholder={placeholder || 'R$ 0,00'}
        disabled={disabled}
        aria-invalid={!!error}
        {...aria}
        className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}


