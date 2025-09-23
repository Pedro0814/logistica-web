import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listCollection, setDocData } from '@/lib/firebase/db'
import { useDebouncedCallback } from './_debounce'
import { optimisticListKey } from './_optimistic'

export function usePlanning(operationId: string, range: { startISO: string; endISO: string }) {
  const key = ['planning', operationId, range.startISO, range.endISO]
  const query = useQuery({
    queryKey: key,
    queryFn: () => listCollection(`operations/${operationId}/planning`, {
      where: [
        ['date', '>=', range.startISO],
        ['date', '<=', range.endISO],
      ],
      order: [['date', 'asc']],
    }),
    enabled: !!operationId && !!range.startISO && !!range.endISO,
  })
  const client = useQueryClient()
  const upsert = useMutation({
    mutationFn: async ({ dayId, patch }: { dayId?: string; patch: any }) => {
      const id = dayId || crypto.randomUUID()
      await setDocData(`operations/${operationId}/planning/${id}`, { ...patch, updatedAt: new Date(), createdAt: new Date() }, true)
      return { id, ...patch }
    },
    ...optimisticListKey(client, key, 'id'),
  })

  const save = useDebouncedCallback((dayId: string, patch: any) => upsert.mutate({ dayId, patch }), 500)
  return { ...query, upsert, save, updating: upsert.isPending }
}


