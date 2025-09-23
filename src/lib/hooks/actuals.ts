import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listCollection, setDocData } from '@/lib/firebase/db'
import { serverTimestamp } from 'firebase/firestore'
import { useDebouncedCallback } from '@/lib/hooks/_debounce'

export type ActualCostsCents = {
  ticketsCents?: number
  transportLocalCents?: number
  hotelCents?: number
  foodCents?: number
  hydrationCents?: number
  allowanceExtraCents?: number
}

export type ActualRow = {
  id: string
  date: string
  unitId: string
  techIds: string[]
  actualAssets?: number
  actualCosts?: ActualCostsCents
  note?: string
}

export function useActuals(operationId: string, range: { startISO: string; endISO: string }) {
  const qc = useQueryClient()
  const key = useMemo(() => ['actuals', operationId, range.startISO, range.endISO], [operationId, range.startISO, range.endISO])

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(operationId && range.startISO && range.endISO),
    queryFn: async () => {
      if (!operationId || !range.startISO || !range.endISO) return [] as ActualRow[]
      const rows = await listCollection(`operations/${operationId}/actuals`, {
        where: [
          ['date', '>=', range.startISO],
          ['date', '<=', range.endISO],
        ],
        order: [['date', 'asc']],
      })
      return rows as unknown as ActualRow[]
    },
  })

  const doSave = async (dayId: string, patch: Partial<ActualRow> & { date?: string }) => {
    if (!operationId || !dayId) return
    const payload: any = {
      ...patch,
      updatedAt: serverTimestamp(),
      meta: { filledAt: serverTimestamp() },
    }
    await setDocData(`operations/${operationId}/actuals/${dayId}`, payload, true)
  }

  const mutation = useMutation({
    mutationFn: ({ dayId, patch }: { dayId: string; patch: Partial<ActualRow> }) => doSave(dayId, patch),
    onMutate: async ({ dayId, patch }) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ActualRow[]>(key) || []
      const next = (() => {
        const idx = prev.findIndex((r) => r.id === dayId)
        if (idx >= 0) {
          const merged = { ...prev[idx], ...patch, id: dayId }
          const clone = prev.slice()
          clone[idx] = merged as ActualRow
          return clone
        }
        return [...prev, { id: dayId, ...(patch as any) }]
      })()
      qc.setQueryData(key, next)
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key, exact: true })
    },
  })

  const debounceSave = useDebouncedCallback((dayId: string, patch: Partial<ActualRow>) => mutation.mutate({ dayId, patch }), 500)

  return {
    data: (query.data || []) as ActualRow[],
    isLoading: query.isLoading,
    error: query.error,
    save: debounceSave,
    updating: mutation.isPending,
  }
}


