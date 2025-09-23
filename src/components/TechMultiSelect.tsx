"use client"

interface TechOption {
  id: string
  name: string
}

interface TechMultiSelectProps {
  options: TechOption[]
  value: string[] // selected ids
  onChange: (ids: string[]) => void
}

export default function TechMultiSelect({ options, value, onChange }: TechMultiSelectProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => toggle(opt.id)}
          className={`px-3 py-2 rounded-lg border text-sm ${value.includes(opt.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
        >
          {opt.name}
        </button>
      ))}
    </div>
  )
}


