import { useQuery } from '@tanstack/react-query'
import { listPlanners } from '@/services/plannerService'

/**
 * Hook de leitura de planejamentos.
 * Usa exclusivamente o plannerService (mock ou firestore), sem tocar Firebase diretamente.
 */
export function usePlanners() {
  const query = useQuery({
    queryKey: ['planners'],
    queryFn: () => listPlanners(),
  })

  return { planners: query.data || [], isLoading: query.isLoading }
}


