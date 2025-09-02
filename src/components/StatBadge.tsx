export default function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-background-200 bg-white px-3 py-1 text-sm">
      <span className="text-background-500">{label}</span>
      <span className="font-semibold text-background-900">{value}</span>
    </div>
  )
}


