"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import CEPField from '@/components/CEPField'
import MoneyInput from '@/components/MoneyInput'
import WeekendPolicyBuilder from '@/components/WeekendPolicyBuilder'
import TechMultiSelect from '@/components/TechMultiSelect'
import { Button } from '@/components/ui/Button'

type Unit = {
  id: string
  cep: string
  logradouro?: string
  bairro?: string
  cidade?: string
  uf?: string
  autoFilledFromCEP: boolean
}

type ScheduleEntry = {
  id: string
  dateISO: string
  unitId: string
  technicians: string[]
  assetsPerDay: number
  costs: {
    passagens: number
    transporteLocal: number
    hotel: number
    alimentacao: number
    hidratacao: number
    ajudaExtra: number
  }
}

type PlanningDoc = {
  header: {
    nome: string
    cliente: string
    periodoInicio: string
    periodoFim: string
    multiTecnico: boolean
    equalizarCustos: boolean
    equalizarModo: 'replicar' | 'dividir'
  }
  weekendPolicy: { saturdays: boolean[]; sundays: boolean[] }
  units: Unit[]
  schedule: ScheduleEntry[]
}

export default function PlanningPage() {
  const params = useParams()
  const operationId = String(params?.operationId || '')

  const [docState, setDocState] = useState<PlanningDoc>({
    header: {
      nome: '',
      cliente: '',
      periodoInicio: '',
      periodoFim: '',
      multiTecnico: false,
      equalizarCustos: false,
      equalizarModo: 'replicar',
    },
    weekendPolicy: { saturdays: [], sundays: [] },
    units: [],
    schedule: [],
  })

  useEffect(() => {
    const load = async () => {
      if (!db || !operationId) return
      const ref = doc(db, 'operations', operationId)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data() as PlanningDoc
        setDocState({
          header: data.header || docState.header,
          weekendPolicy: data.weekendPolicy || { saturdays: [], sundays: [] },
          units: data.units || [],
          schedule: data.schedule || [],
        })
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationId])

  const save = async () => {
    if (!db || !operationId) return
    const ref = doc(db, 'operations', operationId)
    await setDoc(ref, docState, { merge: true })
    alert('Planejamento salvo!')
  }

  const addUnit = () => {
    setDocState((s) => ({
      ...s,
      units: [
        ...s.units,
        { id: crypto.randomUUID(), cep: '', autoFilledFromCEP: false },
      ],
    }))
  }

  const updateUnit = (id: string, partial: Partial<Unit>) => {
    setDocState((s) => ({
      ...s,
      units: s.units.map((u) => (u.id === id ? { ...u, ...partial } : u)),
    }))
  }

  const addScheduleRow = () => {
    setDocState((s) => ({
      ...s,
      schedule: [
        ...s.schedule,
        {
          id: crypto.randomUUID(),
          dateISO: new Date().toISOString().slice(0, 10),
          unitId: s.units[0]?.id || '',
          technicians: [],
          assetsPerDay: 0,
          costs: { passagens: 0, transporteLocal: 0, hotel: 0, alimentacao: 0, hidratacao: 0, ajudaExtra: 0 },
        },
      ],
    }))
  }

  const techOptions = useMemo(() => [
    { id: 't1', name: 'Técnico 1' },
    { id: 't2', name: 'Técnico 2' },
    { id: 't3', name: 'Técnico 3' },
  ], [])

  const equalizeCostsIfNeeded = (rowIndex: number, technicians: string[]) => {
    setDocState((s) => {
      const row = s.schedule[rowIndex]
      if (!row) return s
      const multi = s.header.multiTecnico
      const equal = s.header.equalizarCustos
      const mode = s.header.equalizarModo
      if (!multi || !equal) {
        return {
          ...s,
          schedule: s.schedule.map((r, i) => i === rowIndex ? { ...r, technicians } : r)
        }
      }

      const num = Math.max(technicians.length, 1)
      const shared = ['passagens', 'transporteLocal', 'hotel', 'alimentacao', 'hidratacao', 'ajudaExtra'] as const
      const nextRow: ScheduleEntry = { ...row, technicians }
      if (mode === 'replicar') {
        // mantém custos por dia iguais; interpretação na análise/exibição por técnico
      } else {
        // dividir pelos técnicos
        for (const k of shared) {
          const original = row.costs[k]
          nextRow.costs[k] = Math.round(original / num)
        }
      }
      const next = s.schedule.map((r, i) => (i === rowIndex ? nextRow : r))
      return { ...s, schedule: next }
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
      <div className="space-y-6 pb-28">
        {/* Cabeçalho da Operação */}
        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Cabeçalho da Operação</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Nome da Operação</label>
              <input
                value={docState.header.nome}
                onChange={(e) => setDocState((s) => ({ ...s, header: { ...s.header, nome: e.target.value } }))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Cliente</label>
              <input
                value={docState.header.cliente}
                onChange={(e) => setDocState((s) => ({ ...s, header: { ...s.header, cliente: e.target.value } }))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Início</label>
              <input
                type="date"
                value={docState.header.periodoInicio}
                onChange={(e) => setDocState((s) => ({ ...s, header: { ...s.header, periodoInicio: e.target.value } }))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Fim</label>
              <input
                type="date"
                value={docState.header.periodoFim}
                onChange={(e) => setDocState((s) => ({ ...s, header: { ...s.header, periodoFim: e.target.value } }))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-3 gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={docState.header.multiTecnico} onChange={(e) => setDocState((s) => ({ ...s, header: { ...s.header, multiTecnico: e.target.checked } }))} />
              <span className="text-sm">Multi-técnico por inventário</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={docState.header.equalizarCustos} onChange={(e) => setDocState((s) => ({ ...s, header: { ...s.header, equalizarCustos: e.target.checked } }))} />
              <span className="text-sm">Equalizar custos entre técnicos</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm">Modo:</span>
              <select
                value={docState.header.equalizarModo}
                onChange={(e) => setDocState((s) => ({ ...s, header: { ...s.header, equalizarModo: e.target.value as 'replicar' | 'dividir' } }))}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="replicar">Replicar</option>
                <option value="dividir">Dividir</option>
              </select>
            </div>
          </div>
        </div>

        {/* Regras de Fim de Semana */}
        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Regras de Fim de Semana</h2>
          <WeekendPolicyBuilder
            value={docState.weekendPolicy}
            onChange={(v) => setDocState((s) => ({ ...s, weekendPolicy: v }))}
          />
        </div>

        {/* Unidades com CEP */}
        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Unidades (CEP → Autofill)</h2>
            <Button onClick={addUnit}>Adicionar Unidade</Button>
          </div>
          {/* Hint visível em quadro branco com letras claras sobre o CEP */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-sm text-gray-500">
              Dica: informe o CEP e saia do campo (Tab) para preencher automaticamente logradouro, bairro, cidade e UF. Os dados podem ser editados.
            </p>
          </div>
          <div className="space-y-4">
            {docState.units.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Você pode utilizar o CEP para preencher automaticamente os endereços das unidades.
                </p>
                <Button onClick={addUnit}>Adicionar primeira unidade</Button>
              </div>
            )}
            {docState.units.map((u) => (
              <div key={u.id} className="border rounded-xl p-4">
                <div className="grid md:grid-cols-5 gap-4">
                  <CEPField
                    value={u.cep}
                    onChange={(v) => updateUnit(u.id, { cep: v })}
                    onAddress={(addr) => updateUnit(u.id, {
                      logradouro: addr.logradouro,
                      bairro: addr.bairro,
                      cidade: addr.cidade,
                      uf: addr.uf,
                      autoFilledFromCEP: addr.autoFilledFromCEP,
                    })}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Logradouro</label>
                    <input value={u.logradouro || ''} onChange={(e) => updateUnit(u.id, { logradouro: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Bairro</label>
                    <input value={u.bairro || ''} onChange={(e) => updateUnit(u.id, { bairro: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Cidade</label>
                    <input value={u.cidade || ''} onChange={(e) => updateUnit(u.id, { cidade: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">UF</label>
                    <input value={u.uf || ''} onChange={(e) => updateUnit(u.id, { uf: e.target.value })} className="block w-full px-4 py-3 border rounded-xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Autofill: {u.autoFilledFromCEP ? 'Sim' : 'Não'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cronograma Planejado */}
        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cronograma Planejado</h2>
            <Button onClick={addScheduleRow}>Adicionar Dia</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="p-2">Data</th>
                  <th className="p-2">Unidade</th>
                  <th className="p-2">Técnicos</th>
                  <th className="p-2">Bens/dia</th>
                  <th className="p-2">Passagens</th>
                  <th className="p-2">Transp. Local</th>
                  <th className="p-2">Hotel</th>
                  <th className="p-2">Alimentação</th>
                  <th className="p-2">Hidratação</th>
                  <th className="p-2">Ajuda Extra</th>
                </tr>
              </thead>
              <tbody>
                {docState.schedule.map((row, idx) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2">
                      <input type="date" value={row.dateISO} onChange={(e) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, dateISO: e.target.value } : r) }))} className="px-2 py-1 border rounded" />
                    </td>
                    <td className="p-2">
                      <select value={row.unitId} onChange={(e) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, unitId: e.target.value } : r) }))} className="px-2 py-1 border rounded">
                        <option value="">Selecione</option>
                        {docState.units.map((u) => (
                          <option key={u.id} value={u.id}>{u.logradouro || u.cep}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <TechMultiSelect
                        options={techOptions}
                        value={row.technicians}
                        onChange={(ids) => equalizeCostsIfNeeded(idx, ids)}
                      />
                    </td>
                    <td className="p-2">
                      <input type="number" min={0} value={row.assetsPerDay} onChange={(e) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, assetsPerDay: Number(e.target.value) } : r) }))} className="w-24 px-2 py-1 border rounded" />
                    </td>
                    <td className="p-2"><MoneyInput valueInCents={row.costs.passagens} onChange={(v) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, costs: { ...r.costs, passagens: v } } : r) }))} /></td>
                    <td className="p-2"><MoneyInput valueInCents={row.costs.transporteLocal} onChange={(v) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, costs: { ...r.costs, transporteLocal: v } } : r) }))} /></td>
                    <td className="p-2"><MoneyInput valueInCents={row.costs.hotel} onChange={(v) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, costs: { ...r.costs, hotel: v } } : r) }))} /></td>
                    <td className="p-2"><MoneyInput valueInCents={row.costs.alimentacao} onChange={(v) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, costs: { ...r.costs, alimentacao: v } } : r) }))} /></td>
                    <td className="p-2"><MoneyInput valueInCents={row.costs.hidratacao} onChange={(v) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, costs: { ...r.costs, hidratacao: v } } : r) }))} /></td>
                    <td className="p-2"><MoneyInput valueInCents={row.costs.ajudaExtra} onChange={(v) => setDocState((s) => ({ ...s, schedule: s.schedule.map((r, i) => i === idx ? { ...r, costs: { ...r.costs, ajudaExtra: v } } : r) }))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save}>Salvar Planejamento</Button>
        </div>
      </div>
    </div>
  )
}


