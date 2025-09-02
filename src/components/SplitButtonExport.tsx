import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function SplitButtonExport({ onExportCSV }: { onExportCSV: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-flex">
      <Button onClick={onExportCSV}>Exportar CSV</Button>
      <Button variant="outline" size="icon" className="ml-1" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        ▾
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-10 mt-12 w-40 rounded-md border border-background-200 bg-white shadow-sm">
          <button className="block w-full px-3 py-2 text-left text-sm hover:bg-background-50" onClick={() => { setOpen(false); onExportCSV(); }}>
            Exportar CSV
          </button>
        </div>
      )}
    </div>
  )
}
