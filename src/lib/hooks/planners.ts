import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listCollection, setDocData } from '@/lib/firebase/db'
import { useDebouncedCallback } from './_debounce'

export function usePlanners() {
  const key = ['planners']
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        return await listCollection('plans')
      } catch (e) {
        console.warn('[usePlanners] fallback stub in use; returns empty list')
        return []
      }
    },
  })
  const client = useQueryClient()
  const upsert = useMutation({
    mutationFn: async ({ id, patch }: { id?: string; patch: any }) => {
      const docId = id || crypto.randomUUID()
      await setDocData(`plans/${docId}`, { ...patch, updatedAt: new Date(), createdAt: new Date() }, true)
      return { id: docId, ...patch }
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  })
  const updateField = useDebouncedCallback((id: string, patch: any) => upsert.mutate({ id, patch }), 500)
  return { planners: query.data || [], isLoading: query.isLoading, updateField }
}


