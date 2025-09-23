"use client"
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { TOAST_DURATION_MS } from '@/lib/config'

type Toast = { id: string; message: string; type?: 'error'|'success'|'info' }

const ToastCtx = createContext<{ push: (t: Omit<Toast,'id'>) => void } | null>(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = crypto.randomUUID()
    setItems((s) => [...s, { id, ...t }])
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), TOAST_DURATION_MS)
  }, [])
  const value = useMemo(() => ({ push }), [push])
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-3 right-3 z-[1000] space-y-2">
        {items.map((t) => (
          <div key={t.id} className={`px-3 py-2 rounded shadow text-sm ${t.type==='error'?'bg-red-600 text-white':t.type==='success'?'bg-emerald-600 text-white':'bg-gray-900 text-white'}`}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}


