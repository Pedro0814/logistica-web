import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDocData, setDocData } from '@/lib/firebase/db'
import { useDebouncedCallback } from './_debounce'

export function useWeekendPolicy(policyId: string | null, operationId: string) {
  const key = ['weekendPolicy', policyId || 'none']
  const query = useQuery({
    queryKey: key,
    queryFn: () => (policyId ? getDocData(`weekendPolicies/${policyId}`) : Promise.resolve(null)),
    enabled: !!policyId,
  })
  const client = useQueryClient()
  const upsert = useMutation({
    mutationFn: async (payload: { weeks: any[] }) => {
      if (!policyId) {
        const created = await setDocData(`weekendPolicies/${crypto.randomUUID()}`, { name: `POLICY-${operationId}`, weeks: payload.weeks, createdAt: new Date(), updatedAt: new Date() }, true)
        await setDocData(`operations/${operationId}`, { weekendPolicyId: created.id }, true)
        return created
      }
      const updated = await setDocData(`weekendPolicies/${policyId}`, { weeks: payload.weeks, updatedAt: new Date() }, true)
      return updated
    },
    onMutate: async (payload) => {
      await client.cancelQueries({ queryKey: key })
      const snapshot = client.getQueryData<any>(key)
      client.setQueryData<any>(key, (old) => ({ ...(old || {}), weeks: payload.weeks }))
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) client.setQueryData(key, ctx.snapshot)
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })

  const updateWeeks = useDebouncedCallback((weeks: any[]) => upsert.mutate({ weeks }), 500)
  return { ...query, updateWeeks, updating: upsert.isPending }
}


