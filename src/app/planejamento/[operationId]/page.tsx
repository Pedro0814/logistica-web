"use client"

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import PlanningHeader from '@/components/planning/PlanningHeader'
import WeekendSection from '@/components/planning/WeekendSection'
import UnitsForm from '@/components/planning/UnitsForm'
import PlanningTable from '@/components/planning/PlanningTable'
import { useOperation } from '@/lib/hooks/operations'
import { useWeekendPolicy } from '@/lib/hooks/weekendPolicy'
import { useUnits } from '@/lib/hooks/units'
import { usePlanning } from '@/lib/hooks/planning'
import { Button } from '@/components/ui/Button'

export default function PlanningPage() {
  const params = useParams()
  const operationId = String(params?.operationId || '')

  const { data: op, update: updateOp, updating: opSaving, isLoading: opLoading } = useOperation(operationId)
  const policyId = (op as any)?.weekendPolicyId || null
  const { data: policy, updateWeeks, updating: policySaving, isLoading: policyLoading } = useWeekendPolicy(policyId, operationId)
  const { units, saveField: saveUnitField, addUnit, isLoading: unitsLoading, updating: unitsSaving } = useUnits(operationId)

  const startISO = (op as any)?.startDate || ''
  const endISO = (op as any)?.endDate || ''
  const { data: planning, save: savePlanning, isLoading: planningLoading, updating: planningSaving } = usePlanning(operationId, { startISO, endISO })

  const techOptions = useMemo(() => [
    { id: 't1', name: 'Técnico 1' },
    { id: 't2', name: 'Técnico 2' },
    { id: 't3', name: 'Técnico 3' },
  ], [])

  const saving = opSaving || policySaving || unitsSaving || planningSaving

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
      <div className="space-y-6 pb-28">
        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cabeçalho da Operação</h2>
            <span className="text-xs text-gray-500">{opLoading ? 'Carregando…' : saving ? 'Salvando…' : 'Salvo ✓'}</span>
          </div>
          {op && (
            <PlanningHeader
              value={{
                nome: (op as any)?.name || '',
                cliente: (op as any)?.client || '',
                periodoInicio: (op as any)?.startDate || '',
                periodoFim: (op as any)?.endDate || '',
                multiTecnico: !!(op as any)?.allowMultiTechPerInventory,
                equalizarCustos: !!(op as any)?.equalizeCostsAcrossTechs,
                equalizarModo: ((op as any)?.equalizationMode as any) || 'replicate',
              }}
              onChange={(patch) => updateOp({
                name: patch.nome,
                client: patch.cliente,
                startDate: patch.periodoInicio,
                endDate: patch.periodoFim,
                allowMultiTechPerInventory: patch.multiTecnico,
                equalizeCostsAcrossTechs: patch.equalizarCustos,
                equalizationMode: patch.equalizarModo,
              })}
            />
          )}
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Regras de Fim de Semana</h2>
            <span className="text-xs text-gray-500">{policyLoading ? 'Carregando…' : saving ? 'Salvando…' : 'Salvo ✓'}</span>
          </div>
          <WeekendSection
            startISO={startISO}
            endISO={endISO}
            weeks={(policy as any)?.weeks || []}
            onChange={(weeks) => updateWeeks(weeks)}
          />
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Unidades (CEP → Autofill)</h2>
            <Button onClick={() => addUnit()}>Adicionar Unidade</Button>
          </div>
          <UnitsForm
            units={(units as any) || []}
            onChange={(id, patch) => saveUnitField(id, patch)}
            onAdd={() => addUnit()}
          />
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cronograma Planejado</h2>
            <span className="text-xs text-gray-500">{planningLoading ? 'Carregando…' : saving ? 'Salvando…' : 'Salvo ✓'}</span>
          </div>
          <PlanningTable
            rows={(planning as any) || []}
            units={(units as any)?.map((u: any) => ({ id: u.id, label: u.addressLine || u.cep })) || []}
            techOptions={techOptions}
            equalize={{ enabled: !!(op as any)?.equalizeCostsAcrossTechs, mode: ((op as any)?.equalizationMode as any) || 'replicate' }}
            onChange={(idx, next) => savePlanning(next.id, {
              id: next.id,
              date: next.dateISO,
              unitId: next.unitId,
              techIds: next.technicians,
              plannedAssets: next.assetsPerDay,
              plannedCosts: {
                ticketsCents: next.costs.passagens || 0,
                transportLocalCents: next.costs.transporteLocal || 0,
                hotelCents: next.costs.hotel || 0,
                foodCents: next.costs.alimentacao || 0,
                hydrationCents: next.costs.hidratacao || 0,
                allowanceExtraCents: next.costs.ajudaExtra || 0,
              },
            })}
            onDuplicate={(idx) => {
              const row = (planning as any)?.[idx]
              if (!row) return
              const id = crypto.randomUUID()
              savePlanning(id, { ...row, id })
            }}
          />
        </div>

        <div className="flex justify-end text-xs text-gray-500">{saving ? 'Salvando…' : 'Salvo ✓'}</div>
      </div>
    </div>
  )
}


