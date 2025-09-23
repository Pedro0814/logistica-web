"use client"

import CEPField from '@/components/CEPField'

export type UnitForm = {
  id: string
  cep: string
  addressLine?: string
  district?: string
  city?: string
  state?: string
  autoFilledFromCEP: boolean
}

export default function UnitsForm({ units, onChange, onAdd }: { units: UnitForm[]; onChange: (id: string, partial: Partial<UnitForm>) => void; onAdd: () => void }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Unidades (CEP → Autofill)</h2>
        <button type="button" onClick={onAdd} className="px-3 py-2 rounded-lg bg-blue-600 text-white">Adicionar Unidade</button>
      </div>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-sm text-gray-500">Dica: informe o CEP e saia do campo (Tab) para preencher automaticamente logradouro, bairro, cidade e UF. Os dados podem ser editados.</p>
      </div>
      <div className="space-y-4">
        {units.map((u) => (
          <div key={u.id} className="border rounded-xl p-4">
            <div className="grid md:grid-cols-5 gap-4">
              <CEPField
                value={u.cep}
                onChange={(v) => onChange(u.id, { cep: v })}
                onAutoFill={(addr) => onChange(u.id, {
                  addressLine: addr.addressLine,
                  district: addr.district,
                  city: addr.city,
                  state: addr.state,
                  autoFilledFromCEP: addr.autoFilledFromCEP,
                })}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700">Logradouro</label>
                <input value={u.addressLine || ''} onChange={(e) => onChange(u.id, { addressLine: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Bairro</label>
                <input value={u.district || ''} onChange={(e) => onChange(u.id, { district: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Cidade</label>
                <input value={u.city || ''} onChange={(e) => onChange(u.id, { city: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">UF</label>
                <input value={u.state || ''} onChange={(e) => onChange(u.id, { state: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Autofill: {u.autoFilledFromCEP ? 'Sim' : 'Não'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


