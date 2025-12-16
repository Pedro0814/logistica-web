import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

/**
 * Auth service — única superfície que conhece Firebase Auth.
 * UI deve consumir somente este módulo.
 */

export type AuthUser = User | null

export function onAuthChange(handler: (user: AuthUser) => void) {
  if (!auth) {
    // Retorna unsubscribe no-op para evitar que a UI quebre em modo mock.
    handler(null)
    return () => undefined
  }
  return onAuthStateChanged(auth, handler)
}

export async function login(email: string, password: string) {
  if (!auth) throw new Error('Auth não configurado')
  await signInWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  if (!auth) throw new Error('Auth não configurado')
  await signOut(auth)
}

export async function resetPassword(email: string) {
  if (!auth) throw new Error('Auth não configurado')
  await sendPasswordResetEmail(auth, email)
}

export function getCurrentUser(): AuthUser {
  return auth?.currentUser ?? null
}

