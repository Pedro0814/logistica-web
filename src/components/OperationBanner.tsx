"use client"

import { cn } from '@/lib/utils'

interface OperationBannerProps {
  operationType: 'travel' | 'regional'
  className?: string
}

export default function OperationBanner({ operationType, className }: OperationBannerProps) {
  const isRegional = operationType === 'regional'
  
  return (
    <div className={cn(
      "w-full rounded-xl border bg-card shadow-sm p-4 md:p-5 relative z-0 transition-all duration-300",
      isRegional 
        ? "bg-green-50 border-green-200 text-green-800" 
        : "bg-blue-50 border-blue-200 text-blue-800",
      className
    )}>
      <div className="flex items-center justify-center space-x-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isRegional ? "bg-green-100" : "bg-blue-100"
        )}>
          {isRegional ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )}
        </div>
        
        <div className="text-center">
          <span className="font-semibold">
            {isRegional ? 'Operação Regional' : 'Operação com Viagem'}
          </span>
          <p className="text-sm opacity-80 mt-1">
            {isRegional 
              ? 'Técnico trabalha em sua região, dorme em casa'
              : 'Técnico viaja entre cidades, pernoita em hotéis'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
