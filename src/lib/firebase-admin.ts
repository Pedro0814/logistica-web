import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Configuração do Firebase Admin
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Inicializar Firebase Admin (apenas se não estiver inicializado)
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseAdminConfig);
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
  }
} else {
  app = getApps()[0];
}

// Exportar serviços
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Função para verificar ID Token
export const verifyIdToken = async (idToken: string) => {
  if (!auth) {
    throw new Error('Firebase Admin Auth não configurado');
  }
  
  try {
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw new Error('Token inválido');
  }
};

