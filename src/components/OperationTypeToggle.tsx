"use client"

import { cn } from '@/lib/utils'

interface OperationTypeToggleProps {
  value: 'travel' | 'regional'
  onChange: (value: 'travel' | 'regional') => void
  className?: string
}

export default function OperationTypeToggle({ value, onChange, className }: OperationTypeToggleProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="bg-gray-100 rounded-xl p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => onChange('travel')}
            className={cn(
              "px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200",
              value === 'travel'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Operação com Viagem</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => onChange('regional')}
            className={cn(
              "px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200",
              value === 'regional'
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Operação Regional</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            {value === 'travel' ? (
              <>
                <strong>Operação com Viagem:</strong> Técnico viaja entre cidades, pernoita em hotéis e 
                utiliza transporte intermunicipal. Inclui todos os custos de hospedagem, deslocamento e retorno.
              </>
            ) : (
              <>
                <strong>Operação Regional:</strong> Técnico trabalha em sua região, dorme em casa e 
                utiliza apenas transporte local. Sem custos de hotel, deslocamento intermunicipal ou retorno.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
