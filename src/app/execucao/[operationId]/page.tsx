"use client"
import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useOperation } from '@/lib/hooks/operations'
import { usePlanning } from '@/lib/hooks/planning'
import { useActuals } from '@/lib/hooks/actuals'
import { useAttachments } from '@/lib/hooks/attachments'
import { useUnits } from '@/lib/hooks/units'
import { getUnitLabel } from '@/lib/units/labels'
import ExecutionHeaderKPIs from '@/components/execution/ExecutionHeaderKPIs'
import ExecutionTable from '@/components/execution/ExecutionTable'
import AttachmentsPanel from '@/components/execution/AttachmentsPanel'
import RealtimeCharts from '@/components/execution/RealtimeCharts'
import { getCurrentUserRole, canEditActuals, canUploadAttachments } from '@/lib/auth/roles'
import { useToast } from '@/components/ui/Toaster'
import { validateRowPatch } from '@/lib/validation/actuals'
import { CELL_ERROR_DURATION_MS } from '@/lib/config'

export default function ExecutionPage() {
  const params = useParams()
  const operationId = String(params?.operationId || '')

  const { data: op } = useOperation(operationId)
  const startISO = (op as any)?.startDate || ''
  const endISO = (op as any)?.endDate || ''

  const { data: planning } = usePlanning(operationId, { startISO, endISO })
  const { data: actuals, save: saveActual, updating: savingActual } = useActuals(operationId, { startISO, endISO })
  const { items: attachments, upload, remove } = useAttachments(operationId)
  const { units } = useUnits(operationId)

  const [savingIds] = useState<Set<string>>(new Set())
  const role = getCurrentUserRole()
  const readOnly = !canEditActuals(role)
  const allowUpload = canUploadAttachments(role)
  const toast = useToast()
  const [errorCells, setErrorCells] = useState<Record<string, boolean>>({})

  const rows = useMemo(() => {
    const byId = new Map(actuals.map((a) => [a.id, a]))
    const byUnit = new Map((units as any[] || []).map((u: any) => [u.id, u]))
    return (planning || []).map((p: any) => ({
      id: p.id, // dayId compartilhado entre planning e actuals
      date: p.date,
      unitLabel: getUnitLabel(byUnit.get(p.unitId), { withCEP: true }),
      techIds: p.techIds || [],
      plannedAssets: p.plannedAssets || 0,
      plannedCosts: p.plannedCosts || {},
      actualAssets: byId.get(p.id)?.actualAssets || 0,
      actualCosts: byId.get(p.id)?.actualCosts || {},
      note: byId.get(p.id)?.note || '',
    }))
  }, [planning, actuals, units])

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <ExecutionHeaderKPIs planning={(planning as any) || []} actuals={(actuals as any) || []} saving={savingActual} readonly={readOnly} role={role} />

      <ExecutionTable
        rows={rows as any}
        savingIds={savingIds}
        readOnly={readOnly}
        onChange={(id, patch) => {
          if (readOnly) return
          const plan = (planning as any)?.find((p: any) => p.id === id)
          const planned = { assets: plan?.plannedAssets || 0, costs: plan?.plannedCosts || {} }
          const { ok, errors, warnings } = validateRowPatch(patch, planned)
          if (!ok) {
            setErrorCells((s) => ({ ...s, [id]: true }))
            toast.push({ type: 'error', message: errors[0] || 'Valor inválido' })
            setTimeout(() => setErrorCells((s) => { const n = { ...s }; delete n[id]; return n }), CELL_ERROR_DURATION_MS)
            return
          }
          if (warnings.length > 0) {
            toast.push({ type: 'info', message: warnings[0] })
          }
          ;(saveActual as any)({ dayId: id, patch, planned })
        }}
      />

      <AttachmentsPanel
        items={attachments}
        canUpload={allowUpload}
        onUpload={(file, meta) => allowUpload && upload.mutate({ file, meta })}
        onRemove={(id) => remove.mutate({ id })}
      />

      <RealtimeCharts planning={(planning as any) || []} actuals={(actuals as any) || []} />
    </div>
  )
}


