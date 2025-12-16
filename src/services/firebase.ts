import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PlannerInput, SavedPlanner, PlannerMetadata } from '@/types/planner'

const PLANNERS_COLLECTION = 'planners'
const ATTACHMENTS_COLLECTION = 'attachments'

// Funções para gerenciar planejamentos no Firebase
export async function savePlannerToFirebase(
  planner: PlannerInput,
  title: string,
  userId?: string
): Promise<string> {
  try {
    const metadata: Omit<PlannerMetadata, 'id'> = {
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      technicianName: planner.global.technicianName,
      originCity: planner.global.originCity,
      totalCities: planner.itinerary.length,
      totalStores: planner.itinerary.reduce((sum, city) => sum + city.stores.length, 0),
      estimatedDays: Math.ceil(
        planner.itinerary.reduce((sum, city) => 
          sum + city.stores.reduce((citySum, store) => citySum + store.approxAssets, 0), 0
        ) / planner.global.assetsPerDay
      ),
    }

    const plannerData = {
      ...metadata,
      data: planner,
      userId: userId || 'anonymous',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, PLANNERS_COLLECTION), plannerData)
    return docRef.id
  } catch (error) {
    console.error('Erro ao salvar planejamento no Firebase:', error)
    throw new Error('Falha ao salvar planejamento no Firebase')
  }
}

export async function loadAllPlannersFromFirebase(userId?: string): Promise<PlannerMetadata[]> {
  try {
    const q = userId 
      ? query(
          collection(db, PLANNERS_COLLECTION),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        )
      : query(
          collection(db, PLANNERS_COLLECTION),
          orderBy('updatedAt', 'desc')
        )

    const querySnapshot = await getDocs(q)
    const planners: PlannerMetadata[] = []

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data()
      planners.push({
        id: doc.id,
        title: data.title,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        technicianName: data.technicianName,
        originCity: data.originCity,
        totalCities: data.totalCities,
        totalStores: data.totalStores,
        estimatedDays: data.estimatedDays,
      })
    })

    return planners
  } catch (error) {
    console.error('Erro ao carregar planejamentos do Firebase:', error)
    throw new Error('Falha ao carregar planejamentos do Firebase')
  }
}

export async function loadPlannerByIdFromFirebase(id: string): Promise<SavedPlanner | null> {
  try {
    const docRef = doc(db, PLANNERS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        metadata: {
          id: docSnap.id,
          title: data.title,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          technicianName: data.technicianName,
          originCity: data.originCity,
          totalCities: data.totalCities,
          totalStores: data.totalStores,
          estimatedDays: data.estimatedDays,
        },
        data: data.data,
      }
    }

    return null
  } catch (error) {
    console.error('Erro ao carregar planejamento do Firebase:', error)
    throw new Error('Falha ao carregar planejamento do Firebase')
  }
}

export async function updatePlannerTitleInFirebase(id: string, newTitle: string): Promise<boolean> {
  try {
    const docRef = doc(db, PLANNERS_COLLECTION, id)
    await updateDoc(docRef, {
      title: newTitle,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error('Erro ao atualizar título no Firebase:', error)
    throw new Error('Falha ao atualizar título no Firebase')
  }
}

export async function deletePlannerFromFirebase(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, PLANNERS_COLLECTION, id)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error('Erro ao excluir planejamento do Firebase:', error)
    throw new Error('Falha ao excluir planejamento do Firebase')
  }
}

