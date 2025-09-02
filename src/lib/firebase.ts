import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Configuração padrão para desenvolvimento (sem credenciais)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
}

// Verificar se temos credenciais válidas
const hasValidCredentials = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

let app: any = null
let db: any = null
let auth: any = null
let storage: any = null

if (hasValidCredentials) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig)
    
    // Initialize Firebase services
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
    // Em caso de erro, não inicializar serviços
    app = null
    db = null
    auth = null
    storage = null
  }
} else {
  console.warn('Firebase credentials not found. Using mock services for development.')
  // Garantir que storage seja null quando não há credenciais
  storage = null
}

export { db, auth, storage }
export default app
