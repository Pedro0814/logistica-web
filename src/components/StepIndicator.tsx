interface StepIndicatorProps {
  steps: string[]
  current: number
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-3">
      {steps.map((label, index) => {
        const active = index <= current
        return (
          <li key={label} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${active ? 'bg-blue-600 text-white' : 'bg-background-200 text-background-600'}`}>{index + 1}</span>
            <span className={`text-sm font-medium ${active ? 'text-background-900' : 'text-background-500'}`}>{label}</span>
            {index < steps.length - 1 && <span className="mx-2 h-px w-8 bg-background-300" />}
          </li>
        )
      })}
    </ol>
  )
}


