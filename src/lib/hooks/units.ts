import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listCollection, setDocData } from '@/lib/firebase/db'
import { useDebouncedCallback } from './_debounce'
import { optimisticListKey, optimisticRemoveKey } from './_optimistic'

export function useUnits(operationId: string) {
  const key = ['units', operationId]
  const query = useQuery({
    queryKey: key,
    queryFn: () => listCollection('units'), // ajustar se unidades forem por operação
    enabled: !!operationId,
  })
  const client = useQueryClient()
  const upsert = useMutation({
    mutationFn: async ({ unitId, patch }: { unitId?: string; patch: any }) => {
      const id = unitId || crypto.randomUUID()
      await setDocData(`units/${id}`, { ...patch, updatedAt: new Date(), createdAt: new Date() }, true)
      return { id, ...patch }
    },
    ...optimisticListKey(client, key, 'id'),
  })

  const remove = useMutation({
    mutationFn: async (unitId: string) => {
      // opcional: implementar delete
      return unitId
    },
    ...optimisticRemoveKey(client, key, 'id'),
  })

  const saveField = useDebouncedCallback((unitId: string, patch: any) => upsert.mutate({ unitId, patch }), 400)
  const addUnit = () => upsert.mutate({ patch: { cep: '', autoFilledFromCEP: false } })

  return { units: query.data || [], ...query, upsert, remove, saveField, addUnit, updating: upsert.isPending }
}


