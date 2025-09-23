"use client"

import { useState, useEffect } from 'react'
import { formatCurrencyBRL, parseCurrencyToCents } from '@/utils/money'

interface MoneyInputProps {
  label?: string
  valueInCents: number
  onChange: (valueInCents: number) => void
  placeholder?: string
  disabled?: boolean
}

export default function MoneyInput({ label, valueInCents, onChange, placeholder, disabled }: MoneyInputProps) {
  const [text, setText] = useState('')

  useEffect(() => {
    setText(formatCurrencyBRL(valueInCents))
  }, [valueInCents])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setText(raw)
    const cents = parseCurrencyToCents(raw)
    onChange(cents)
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}
      <input
        value={text}
        onChange={handleChange}
        placeholder={placeholder || 'R$ 0,00'}
        disabled={disabled}
        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
      />
    </div>
  )
}


