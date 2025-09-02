import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning'
}

const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-background-100 text-background-800 border-background-200',
  outline: 'bg-transparent text-background-800 border-background-300',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}


