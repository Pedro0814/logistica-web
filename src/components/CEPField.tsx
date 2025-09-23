"use client"

import { useState } from 'react'
import { getAddressByCEP, type ViaCEPAddress } from '@/utils/cep'

interface CEPFieldProps {
  value: string
  onChange: (value: string) => void
  onAddress: (addr: { logradouro?: string; bairro?: string; cidade?: string; uf?: string; autoFilledFromCEP: boolean }) => void
}

export default function CEPField({ value, onChange, onAddress }: CEPFieldProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBlur = async () => {
    setError(null)
    const onlyDigits = (value || '').replace(/\D/g, '')
    if (onlyDigits.length !== 8) return
    setLoading(true)
    const res: ViaCEPAddress | null = await getAddressByCEP(onlyDigits)
    setLoading(false)
    if (!res) {
      setError('CEP não encontrado. Edite manualmente.')
      onAddress({ autoFilledFromCEP: false })
      return
    }
    onAddress({
      logradouro: res.logradouro,
      bairro: res.bairro,
      cidade: res.localidade,
      uf: res.uf,
      autoFilledFromCEP: true,
    })
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-700">CEP</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="00000-000"
        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
      />
      {loading && <p className="text-xs text-gray-500">Consultando ViaCEP...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}


