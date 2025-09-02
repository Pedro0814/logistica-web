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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
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

// Funções para gerenciar anexos no Firebase Storage
export async function uploadAttachment(
  file: File,
  plannerId: string,
  userId?: string
): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `attachments/${userId || 'anonymous'}/${plannerId}/${fileName}`
    const storageRef = ref(storage, filePath)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    // Salvar metadados do anexo no Firestore
    await addDoc(collection(db, ATTACHMENTS_COLLECTION), {
      plannerId,
      userId: userId || 'anonymous',
      fileName: file.name,
      filePath,
      downloadURL,
      fileSize: file.size,
      mimeType: file.type,
      createdAt: serverTimestamp(),
    })
    
    return downloadURL
  } catch (error) {
    console.error('Erro ao fazer upload do anexo:', error)
    throw new Error('Falha ao fazer upload do anexo')
  }
}

export async function getAttachmentsForPlanner(plannerId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, ATTACHMENTS_COLLECTION),
      where('plannerId', '==', plannerId)
    )
    
    const querySnapshot = await getDocs(q)
    const attachments: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      attachments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      })
    })
    
    return attachments
  } catch (error) {
    console.error('Erro ao carregar anexos:', error)
    throw new Error('Falha ao carregar anexos')
  }
}

export async function deleteAttachment(attachmentId: string, filePath: string): Promise<boolean> {
  try {
    // Deletar do Storage
    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)
    
    // Deletar do Firestore
    const docRef = doc(db, ATTACHMENTS_COLLECTION, attachmentId)
    await deleteDoc(docRef)
    
    return true
  } catch (error) {
    console.error('Erro ao excluir anexo:', error)
    throw new Error('Falha ao excluir anexo')
  }
}

