import { useState } from 'react'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import {
  savePlannerToFirebase,
  loadAllPlannersFromFirebase,
  loadPlannerByIdFromFirebase,
  updatePlannerTitleInFirebase,
  deletePlannerFromFirebase,
} from '@/services/firebase'
import type { PlannerInput, SavedPlanner, PlannerMetadata } from '@/types/planner'

export function useFirebase() {
  const { user, loading, error: authError } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const savePlanner = async (planner: PlannerInput, title: string): Promise<string> => {
    try {
      setError(null)
      if (!db) {
        throw new Error('Firebase não configurado. Configure as credenciais para salvar planejamentos.')
      }
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login para salvar planejamentos.')
      }
      return await savePlannerToFirebase(planner, title, user.uid)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  const loadAllPlanners = async (): Promise<PlannerMetadata[]> => {
    try {
      setError(null)
      if (!db) {
        throw new Error('Firebase não configurado. Configure as credenciais para carregar planejamentos.')
      }
      return await loadAllPlannersFromFirebase(user?.uid)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  const loadPlannerById = async (id: string): Promise<SavedPlanner | null> => {
    try {
      setError(null)
      return await loadPlannerByIdFromFirebase(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  const updatePlannerTitle = async (id: string, newTitle: string): Promise<boolean> => {
    try {
      setError(null)
      return await updatePlannerTitleInFirebase(id, newTitle)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  const deletePlanner = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      return await deletePlannerFromFirebase(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  return {
    user,
    loading,
    error: error || authError,
    savePlanner,
    loadAllPlanners,
    loadPlannerById,
    updatePlannerTitle,
    deletePlanner,
  }
}
