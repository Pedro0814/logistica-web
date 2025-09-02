export default function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-background-300 rounded-xl bg-white">
      <div className="mx-auto h-12 w-12 rounded-lg bg-background-100 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-background-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 002-2h14a2 2 0 012 2M3 7h18" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-background-900">{title}</h3>
      <p className="mt-2 text-sm text-background-600">{description}</p>
      {action ? <div className="mt-6 flex items-center justify-center">{action}</div> : null}
    </div>
  )
}


