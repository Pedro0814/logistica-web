import { useQuery } from '@tanstack/react-query'
import { listPlanners, type Planner } from '@/services/plannerService'
import type { PlannerMetadata } from '@/types/planner'

/**
 * Transforma Planner do service em PlannerMetadata para uso na UI
 * Garante que technicianName seja sempre string (nunca ReactNode)
 */
function transformPlannerToMetadata(planner: Planner): PlannerMetadata {
  const data = planner.data || {}
  const global = data.global || {}
  
  // Garantir que technicianName seja sempre string (nunca ReactNode ou outro tipo)
  let technicianName = ''
  if (typeof global.technicianName === 'string') {
    technicianName = global.technicianName
  } else if (global.technicianName != null) {
    // Converter para string se não for null/undefined
    technicianName = String(global.technicianName)
  }
  
  // Calcular estimatedDays se não estiver presente
  let estimatedDays = planner.estimatedDays || 0
  if (!estimatedDays && Array.isArray(data.itinerary) && typeof global.assetsPerDay === 'number' && global.assetsPerDay > 0) {
    const totalAssets = data.itinerary.reduce(
      (sum: number, city: any) =>
        sum + (Array.isArray(city.stores)
          ? city.stores.reduce((citySum: number, store: any) => citySum + (typeof store.approxAssets === 'number' ? store.approxAssets : 0), 0)
          : 0),
      0
    )
    estimatedDays = Math.ceil(totalAssets / global.assetsPerDay)
  }
  
  // Converter createdAt para string ISO
  let createdAt = new Date().toISOString()
  if (planner.createdAt) {
    if (typeof planner.createdAt === 'string') {
      createdAt = planner.createdAt
    } else if (typeof planner.createdAt === 'object' && planner.createdAt !== null) {
      // Firestore Timestamp tem método toDate()
      const date = (planner.createdAt as any).toDate?.() || planner.createdAt
      createdAt = date instanceof Date ? date.toISOString() : new Date(date).toISOString()
    }
  }
  
  // Converter updatedAt para string ISO
  let updatedAt = new Date().toISOString()
  if (planner.updatedAt) {
    if (typeof planner.updatedAt === 'string') {
      updatedAt = planner.updatedAt
    } else if (typeof planner.updatedAt === 'object' && planner.updatedAt !== null) {
      // Firestore Timestamp tem método toDate()
      const date = (planner.updatedAt as any).toDate?.() || planner.updatedAt
      updatedAt = date instanceof Date ? date.toISOString() : new Date(date).toISOString()
    }
  }
  
  return {
    id: planner.id,
    title: planner.title || 'Planejamento',
    createdAt,
    updatedAt,
    technicianName,
    originCity: typeof global.originCity === 'string' ? global.originCity : (global.originCity?.toString() || ''),
    totalCities: Array.isArray(data.itinerary) ? data.itinerary.length : 0,
    totalStores: Array.isArray(data.itinerary)
      ? data.itinerary.reduce(
          (sum: number, city: any) =>
            sum + (Array.isArray(city.stores) ? city.stores.length : 0),
          0
        )
      : 0,
    estimatedDays,
  }
}

/**
 * Hook de leitura de planejamentos.
 * Usa exclusivamente o plannerService (mock ou firestore), sem tocar Firebase diretamente.
 * Transforma Planner[] em PlannerMetadata[] para compatibilidade com componentes React.
 */
export function usePlanners() {
  const query = useQuery({
    queryKey: ['planners'],
    queryFn: async () => {
      const planners = await listPlanners()
      return planners.map(transformPlannerToMetadata)
    },
  })

  return { planners: query.data || [], isLoading: query.isLoading }
}


