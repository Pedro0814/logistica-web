"use client"

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface StepFooterProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSaveDraft: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  className?: string
}

export default function StepFooter({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSaveDraft,
  canGoNext,
  canGoPrevious,
  className
}: StepFooterProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-[100] shadow-lg",
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="px-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
          
          <span className="text-sm text-gray-500">
            Etapa {currentStep + 1} de {totalSteps}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            className="px-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Salvar Rascunho
          </Button>
          
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Próximo
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Gerar Cronograma
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
