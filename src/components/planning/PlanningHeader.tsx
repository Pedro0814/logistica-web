"use client"

import { Button } from '@/components/ui/Button'

export type OperationHeader = {
  nome: string
  cliente: string
  periodoInicio: string
  periodoFim: string
  multiTecnico: boolean
  equalizarCustos: boolean
  equalizarModo: 'replicate' | 'split'
}

export default function PlanningHeader({ value, onChange }: { value: OperationHeader; onChange: (next: OperationHeader) => void }) {
  const set = (partial: Partial<OperationHeader>) => onChange({ ...value, ...partial })
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Cabeçalho da Operação</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Nome da Operação</label>
          <input value={value.nome} onChange={(e) => set({ nome: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Cliente</label>
          <input value={value.cliente} onChange={(e) => set({ cliente: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Início</label>
          <input type="date" value={value.periodoInicio} onChange={(e) => set({ periodoInicio: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Fim</label>
          <input type="date" value={value.periodoFim} onChange={(e) => set({ periodoFim: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
      </div>
      <div className="mt-4 grid md:grid-cols-3 gap-4 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={value.multiTecnico} onChange={(e) => set({ multiTecnico: e.target.checked })} />
          <span className="text-sm">Multi-técnico por inventário</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={value.equalizarCustos} onChange={(e) => set({ equalizarCustos: e.target.checked })} />
          <span className="text-sm">Equalizar custos entre técnicos</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm">Modo:</span>
          <select value={value.equalizarModo} onChange={(e) => set({ equalizarModo: e.target.value as 'replicate' | 'split' })} className="px-3 py-2 border rounded-lg">
            <option value="replicate">Replicar</option>
            <option value="split">Dividir</option>
          </select>
        </div>
      </div>
    </div>
  )
}


