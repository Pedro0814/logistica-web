import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDocData, setDocData } from '@/lib/firebase/db'
import { useDebouncedCallback } from './_debounce'

export function useOperation(operationId: string) {
  const key = ['operation', operationId]
  const query = useQuery({
    queryKey: key,
    queryFn: () => getDocData(`operations/${operationId}`),
    enabled: !!operationId,
  })
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (patch: any) => setDocData(`operations/${operationId}`, { ...patch, updatedAt: new Date() }, true),
    onMutate: async (patch) => {
      await client.cancelQueries({ queryKey: key })
      const snapshot = client.getQueryData<any>(key)
      client.setQueryData<any>(key, (old: any) => ({ ...(old || {}), ...patch }))
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) client.setQueryData(key, ctx.snapshot)
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })

  const update = useDebouncedCallback((patch: any) => mutation.mutate(patch), 500)
  return { ...query, update, updating: mutation.isPending }
}


