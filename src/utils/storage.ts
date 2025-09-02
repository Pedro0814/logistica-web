import type { PlannerInput, SavedPlanner, PlannerMetadata, PlannerList } from '@/types/planner'

const STORAGE_KEY = 'inventory_route_planner_beta__planners'
const DRAFT_KEY = 'inventory_route_planner_beta__plannerDraft'

// Funções para gerenciar múltiplos planejamentos (legado / fallback local)
// Observação: A base do app passou a usar a API de Draft (saveDraft/loadDraft/clearDraft).
// Estas funções de múltiplos planejamentos continuam disponíveis como fallback/local apenas.
export function savePlannerRecord(planner: PlannerInput, title?: string): string {
  const planners = loadAllPlanners()
  
  // Gerar ID único
  const id = crypto.randomUUID()
  
  // Criar metadados
  const metadata: PlannerMetadata = {
    id,
    title: title || `Planejamento ${planners.planners.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    technicianName: planner.global.technicianName,
    originCity: planner.global.originCity,
    totalCities: planner.itinerary.length,
    totalStores: planner.itinerary.reduce((sum, city) => sum + city.stores.length, 0),
    estimatedDays: Math.ceil(
      planner.itinerary.reduce((sum, city) => sum + city.stores.reduce((citySum, store) => citySum + store.approxAssets, 0), 0) / 
      planner.global.assetsPerDay
    )
  }
  
  // Salvar planejamento completo
  const savedPlanner: SavedPlanner = { metadata, data: planner }
  planners.planners.push(metadata)
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(planners))
  localStorage.setItem(`${STORAGE_KEY}__${id}`, JSON.stringify(savedPlanner))
  
  return id
}

export function loadAllPlanners(): PlannerList {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { planners: [] }
  } catch {
    return { planners: [] }
  }
}

export function loadPlannerById(id: string): SavedPlanner | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}__${id}`)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function updatePlannerTitle(id: string, newTitle: string): boolean {
  try {
    const planners = loadAllPlanners()
    const plannerIndex = planners.planners.findIndex(p => p.id === id)
    
    if (plannerIndex === -1) return false
    
    // Atualizar metadados
    planners.planners[plannerIndex].title = newTitle
    planners.planners[plannerIndex].updatedAt = new Date().toISOString()
    
    // Atualizar lista
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planners))
    
    // Atualizar planejamento salvo
    const savedPlanner = loadPlannerById(id)
    if (savedPlanner) {
      savedPlanner.metadata.title = newTitle
      savedPlanner.metadata.updatedAt = new Date().toISOString()
      localStorage.setItem(`${STORAGE_KEY}__${id}`, JSON.stringify(savedPlanner))
    }
    
    return true
  } catch {
    return false
  }
}

export function deletePlanner(id: string): boolean {
  try {
    const planners = loadAllPlanners()
    const plannerIndex = planners.planners.findIndex(p => p.id === id)
    
    if (plannerIndex === -1) return false
    
    // Remover da lista
    planners.planners.splice(plannerIndex, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planners))
    
    // Remover dados
    localStorage.removeItem(`${STORAGE_KEY}__${id}`)
    
    return true
  } catch {
    return false
  }
}

// Funções para rascunho (mantidas para compatibilidade)
export function savePlannerDraft(planner: PlannerInput): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(planner))
}

export function loadPlannerDraft<T = PlannerInput>(): T | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearPlannerDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}

// Função para limpar todos os dados (útil para testes)
export function clearAllPlanners(): void {
  const planners = loadAllPlanners()
  planners.planners.forEach(planner => {
    localStorage.removeItem(`${STORAGE_KEY}__${planner.id}`)
  })
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(DRAFT_KEY)
}


// ======================================
// API PADRÃO: Draft (utilizada pelo app)
// ======================================
// Toda a base do app utiliza os métodos abaixo.
// Mantemos aliases com nomes antigos para compatibilidade.

export function saveDraft(data: PlannerInput): void {
  savePlannerDraft(data)
}

export function loadDraft<T = PlannerInput>(): T | null {
  return loadPlannerDraft<T>()
}

export function clearDraft(): void {
  clearPlannerDraft()
}

// Aliases de compatibilidade (código legado)
// Atenção: os aliases abaixo referem-se ao Draft, e não ao sistema de múltiplos planejamentos.
export const savePlanner = saveDraft
export const loadPlanner = loadDraft
export const clearPlanner = clearDraft

