"use client"

import { useId, useState } from 'react'
import { getAddressByCEP, type ViaCepAddress } from '@/lib/cep/viaCep'

type CEPFieldProps = {
  value: string
  onChange: (cep: string) => void
  onAutoFill?: (addr: {
    addressLine: string
    district: string
    city: string
    state: string
    ibgeCode?: string
    autoFilledFromCEP: boolean
  }) => void
  label?: string
  disabled?: boolean
  error?: string
  id?: string
  'aria-label'?: string
}

export default function CEPField({ value, onChange, onAutoFill, label = 'CEP', disabled, error, id, ...aria }: CEPFieldProps) {
  const reactId = useId()
  const inputId = id || `cep-${reactId}`
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const normalize = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }

  const handleChange = (raw: string) => {
    const norm = normalize(raw)
    onChange(norm)
  }

  const handleBlur = async () => {
    setLocalError(null)
    const onlyDigits = (value || '').replace(/\D/g, '')
    if (onlyDigits.length !== 8) return
    setLoading(true)
    const res: ViaCepAddress | null = await getAddressByCEP(onlyDigits)
    setLoading(false)
    if (!res) {
      setLocalError('CEP não encontrado. Edite manualmente.')
      return
    }
    onAutoFill?.({
      addressLine: res.logradouro || '',
      district: res.bairro || '',
      city: res.localidade || '',
      state: res.uf || '',
      ibgeCode: res.ibge,
      autoFilledFromCEP: true,
    })
  }

  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700">{label}</label>}
      <input
        id={inputId}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="00000-000"
        disabled={disabled}
        aria-invalid={!!(error || localError)}
        {...aria}
        className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 transition-all duration-200 ${error || localError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
      />
      {loading && <p className="text-xs text-gray-500">Consultando ViaCEP...</p>}
      {(error || localError) && <p className="text-xs text-red-600">{error || localError}</p>}
    </div>
  )
}


