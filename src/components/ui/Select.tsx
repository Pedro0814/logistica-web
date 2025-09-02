'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
}

export function Select({ className, label, helperText, children, ...props }: SelectProps) {
  return (
    <label className="block w-full">
      {label ? <span className="mb-1 block text-sm font-medium text-background-700">{label}</span> : null}
      <select
        className={cn(
          'block w-full rounded-md border border-background-300 bg-white px-3 py-2 text-sm text-background-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {helperText ? <span className="mt-1 block text-xs text-background-500">{helperText}</span> : null}
    </label>
  )
}


