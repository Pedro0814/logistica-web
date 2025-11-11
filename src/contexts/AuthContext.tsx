'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      setError('Firebase não configurado. Configure as credenciais no arquivo .env.local')
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      setError(null)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      if (!auth) {
        throw new Error('Firebase não configurado')
      }
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      const errorMessage = err?.code === 'auth/user-not-found' 
        ? 'Usuário não encontrado'
        : err?.code === 'auth/wrong-password'
        ? 'Senha incorreta'
        : err?.code === 'auth/invalid-email'
        ? 'Email inválido'
        : err?.code === 'auth/too-many-requests'
        ? 'Muitas tentativas. Tente novamente mais tarde.'
        : err?.message || 'Erro ao fazer login'
      setError(errorMessage)
      throw err
    }
  }

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      if (!auth) {
        throw new Error('Firebase não configurado')
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName })
      }
    } catch (err: any) {
      const errorMessage = err?.code === 'auth/email-already-in-use'
        ? 'Este email já está em uso'
        : err?.code === 'auth/weak-password'
        ? 'Senha muito fraca. Use pelo menos 6 caracteres.'
        : err?.code === 'auth/invalid-email'
        ? 'Email inválido'
        : err?.message || 'Erro ao criar conta'
      setError(errorMessage)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      if (!auth) {
        throw new Error('Firebase não configurado')
      }
      await signOut(auth)
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer logout')
      throw err
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      if (!auth) {
        throw new Error('Firebase não configurado')
      }
      await sendPasswordResetEmail(auth, email)
    } catch (err: any) {
      const errorMessage = err?.code === 'auth/user-not-found'
        ? 'Usuário não encontrado'
        : err?.code === 'auth/invalid-email'
        ? 'Email inválido'
        : err?.message || 'Erro ao enviar email de recuperação'
      setError(errorMessage)
      throw err
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

