'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DialogContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

export function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(Boolean(open))
  const isControlled = typeof open === 'boolean'
  const actualOpen = isControlled ? Boolean(open) : internalOpen
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v)
    onOpenChange?.(v)
  }
  return <DialogContext.Provider value={{ open: actualOpen, setOpen }}>{children}</DialogContext.Provider>
}

export function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('Dialog components must be used within <Dialog>')
  return ctx
}

export function DialogTrigger({ children }: { children: React.ReactElement }) {
  const { setOpen } = useDialog()
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      setOpen(true)
    },
  })
}

export function DialogOverlay({ className }: { className?: string }) {
  const { open, setOpen } = useDialog()
  if (!open) return null
  return <div className={cn('fixed inset-0 z-40 bg-black/40 backdrop-blur-sm', className)} onClick={() => setOpen(false)} />
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useDialog()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className={cn('mx-4 w-full max-w-lg rounded-xl border border-background-200 bg-white p-6 shadow-lg', className)}>{children}</div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-background-600', className)} {...props} />
}


