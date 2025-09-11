import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import type { Attachment } from '@/types/attachments';

export const listAttachments = async (planId: string): Promise<Attachment[]> => {
  if (!db) {
    throw new Error('Firebase não configurado');
  }

  try {
    const attachmentsRef = collection(db, 'plans', planId, 'attachments');
    const q = query(attachmentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Attachment));
  } catch (error) {
    console.error('Erro ao listar anexos:', error);
    throw new Error('Falha ao carregar anexos');
  }
};

export const addAttachment = async (planId: string, attachmentData: Omit<Attachment, 'id'>): Promise<string> => {
  if (!db) {
    throw new Error('Firebase não configurado');
  }

  try {
    const attachmentsRef = collection(db, 'plans', planId, 'attachments');
    const docRef = await addDoc(attachmentsRef, attachmentData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar anexo:', error);
    throw new Error('Falha ao salvar anexo');
  }
};

export const removeAttachment = async (planId: string, attachmentId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firebase não configurado');
  }

  try {
    const attachmentRef = doc(db, 'plans', planId, 'attachments', attachmentId);
    await deleteDoc(attachmentRef);
  } catch (error) {
    console.error('Erro ao remover anexo:', error);
    throw new Error('Falha ao remover anexo');
  }
};

export const getAttachmentCount = async (planId: string): Promise<number> => {
  if (!db) {
    return 0;
  }

  try {
    const attachmentsRef = collection(db, 'plans', planId, 'attachments');
    const snapshot = await getDocs(attachmentsRef);
    return snapshot.size;
  } catch (error) {
    console.error('Erro ao contar anexos:', error);
    return 0;
  }
};

