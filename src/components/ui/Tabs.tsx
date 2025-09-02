'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TabsProps {
  value: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)} data-value={value} data-role="tabs">
      {children}
    </div>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-background-100 p-1 text-background-700', className)} {...props} />
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  active?: boolean
}

export function TabsTrigger({ className, active, ...props }: TabsTriggerProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus:outline-none focus:ring-2 data-[state=active]:bg-white data-[state=active]:text-background-900 data-[state=active]:shadow',
        active ? 'bg-white text-background-900 shadow' : 'text-background-600 hover:text-background-900',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4', className)} {...props} />
}


