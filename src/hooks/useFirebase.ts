import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth, db, storage } from '@/lib/firebase'
import {
  savePlannerToFirebase,
  loadAllPlannersFromFirebase,
  loadPlannerByIdFromFirebase,
  updatePlannerTitleInFirebase,
  deletePlannerFromFirebase,
  uploadAttachment,
  getAttachmentsForPlanner,
  deleteAttachment,
} from '@/services/firebase'
import type { PlannerInput, SavedPlanner, PlannerMetadata } from '@/types/planner'

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false) // Mudado para false por padrão
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se o Firebase está disponível
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      // Firebase não disponível - modo desenvolvimento
      setLoading(false)
      setError('Firebase não configurado. Configure as credenciais para usar funcionalidades completas.')
    }
  }, [])

  const savePlanner = async (planner: PlannerInput, title: string): Promise<string> => {
    try {
      setError(null)
      if (!db) {
        throw new Error('Firebase não configurado. Configure as credenciais para salvar planejamentos.')
      }
      return await savePlannerToFirebase(planner, title, user?.uid)
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

  const uploadFile = async (file: File, plannerId: string): Promise<string> => {
    try {
      setError(null)
      if (!storage) {
        throw new Error('Firebase Storage não está disponível. Configure as credenciais para usar anexos.')
      }
      return await uploadAttachment(file, plannerId, user?.uid)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  const getAttachments = async (plannerId: string): Promise<any[]> => {
    try {
      setError(null)
      if (!storage) {
        console.warn('Firebase Storage não disponível - retornando array vazio')
        return []
      }
      return await getAttachmentsForPlanner(plannerId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  const deleteFile = async (attachmentId: string, filePath: string): Promise<boolean> => {
    try {
      setError(null)
      if (!storage) {
        throw new Error('Firebase Storage não está disponível. Configure as credenciais para usar anexos.')
      }
      return await deleteAttachment(attachmentId, filePath)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    savePlanner,
    loadAllPlanners,
    loadPlannerById,
    updatePlannerTitle,
    deletePlanner,
    uploadFile,
    getAttachments,
    deleteFile,
  }
}
