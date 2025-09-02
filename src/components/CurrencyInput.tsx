import { useMemo } from 'react'
import type React from 'react'

type CurrencyInputProps = {
  label?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}

export default function CurrencyInput({ label, value, onChange, placeholder = "0,00", className = "" }: CurrencyInputProps) {
  const formatted = useMemo(() => {
    const safe = typeof value === 'number' && isFinite(value) ? value : 0
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
  }, [value])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove tudo exceto números e vírgula
    const clean = input.replace(/[^\d,]/g, '')
    // Converte vírgula para ponto para parsing
    const withDot = clean.replace(',', '.')
    const num = parseFloat(withDot)
    
    if (!isNaN(num) && isFinite(num)) {
      onChange(num)
    } else if (input === '' || input === 'R$ ') {
      onChange(0)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
          value={formatted}
          onChange={handleInput}
          placeholder={placeholder}
          onFocus={(e) => e.target.select()}
        />
      </div>
    </div>
  )
}


