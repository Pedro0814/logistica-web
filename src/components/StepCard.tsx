"use client"

// InformationCircleIcon component inline
import { cn } from '@/lib/utils'

interface StepCardProps {
  title: string
  description: string
  helpText?: string
  children: React.ReactNode
  className?: string
  isActive?: boolean
}

export default function StepCard({ 
  title, 
  description, 
  helpText, 
  children, 
  className,
  isActive = true 
}: StepCardProps) {
  return (
    <div className={cn(
      "w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300",
      isActive ? "opacity-100" : "opacity-50 pointer-events-none",
      className
    )}>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-blue-100 mt-1">{description}</p>
            </div>
          </div>
          
          {helpText && (
            <div className="relative group">
              <svg className="w-6 h-6 text-white/80 hover:text-white cursor-help transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {helpText}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}
