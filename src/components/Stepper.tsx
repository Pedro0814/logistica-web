"use client"

// CheckIcon component inline
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  title: string
  description: string
  status: 'upcoming' | 'current' | 'completed'
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  className?: string
}

export default function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "", "sm:flex-1")}>
            {step.status === 'completed' ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-green-600" />
                </div>
                <button
                  onClick={() => onStepClick?.(stepIdx)}
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-600 hover:bg-green-900 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="sr-only">{step.title}</span>
                </button>
              </>
            ) : step.status === 'current' ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <button
                  onClick={() => onStepClick?.(stepIdx)}
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-600 bg-white transition-colors duration-200"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-green-600" aria-hidden="true" />
                  <span className="sr-only">{step.title}</span>
                </button>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <button
                  onClick={() => onStepClick?.(stepIdx)}
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400 transition-colors duration-200"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                  <span className="sr-only">{step.title}</span>
                </button>
              </>
            )}
            
            {/* Sem legendas visíveis */}
          </li>
        ))}
      </ol>
    </nav>
  )
}
