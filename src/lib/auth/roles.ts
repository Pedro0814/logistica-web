export type UserRole = 'admin' | 'coord' | 'tech' | 'viewer'

// Simple role resolver: reads from localStorage 'app_role' if present; defaults to 'admin' for dev.
export function getCurrentUserRole(): UserRole {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('app_role') as UserRole | null
    if (stored === 'admin' || stored === 'coord' || stored === 'tech' || stored === 'viewer') return stored
  }
  return 'admin'
}

export function canEditActuals(role: UserRole): boolean {
  return role === 'admin' || role === 'coord' || role === 'tech'
}

export function canUploadAttachments(role: UserRole): boolean {
  return role === 'admin' || role === 'coord' || role === 'tech'
}

export function canEditPlanning(role: UserRole): boolean {
  return role === 'admin' || role === 'coord'
}

export function canReadEverything(role: UserRole): boolean {
  return role === 'admin' || role === 'coord' || role === 'tech' || role === 'viewer'
}


