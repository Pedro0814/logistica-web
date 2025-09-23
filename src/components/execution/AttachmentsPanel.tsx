"use client"
import { useState } from 'react'
import { Attachment } from '@/lib/hooks/attachments'

export default function AttachmentsPanel({ items, onUpload, onRemove, canUpload }: { items: Attachment[]; onUpload: (file: File, meta: { dayId?: string; category: Attachment['category'] }) => void; onRemove: (id: string) => void; canUpload?: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [dayId, setDayId] = useState<string>('')
  const [category, setCategory] = useState<Attachment['category']>('outros')

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Anexos</h2>
      </div>
      {canUpload !== false && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input type="text" placeholder="Dia (ID)" className="px-3 py-2 border rounded" value={dayId} onChange={(e) => setDayId(e.target.value)} />
          <select className="px-3 py-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            <option value="hotel">Hotel</option>
            <option value="alimentacao">Alimentação</option>
            <option value="transporte">Transporte</option>
            <option value="passagens">Passagens</option>
            <option value="outros">Outros</option>
          </select>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button className="px-3 py-2 border rounded" onClick={() => file && onUpload(file, { dayId: dayId || undefined, category })}>Enviar</button>
        </div>
      )}
      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="flex items-center justify-between border rounded p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                {a.url ? (<img src={a.url} alt={a.category} className="w-full h-full object-cover" />) : null}
              </div>
              <div>
                <p className="text-sm">{a.category} {a.bytes ? `(${Math.round(a.bytes/1024)} KB)` : ''}</p>
                <p className="text-[10px] text-gray-500">{a.dayId || 'sem dia'} • {a.mime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {a.url && (<a className="text-xs underline" href={a.url} target="_blank" rel="noreferrer">abrir</a>)}
              <button className="text-xs text-red-600" onClick={() => onRemove(a.id)}>remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


