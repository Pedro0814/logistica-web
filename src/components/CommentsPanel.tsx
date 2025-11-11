"use client"
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCollection, setDocData } from '@/lib/firebase/db'
import { serverTimestamp } from 'firebase/firestore'

export type CommentDoc = {
  id: string
  authorId: string
  text: string
  scope: 'global' | 'unit' | 'tech' | 'day'
  refId?: string
  createdAt: any
}

export default function CommentsPanel({ operationId, initialScope = 'global', refId }: { operationId: string; initialScope?: CommentDoc['scope']; refId?: string }) {
  const qc = useQueryClient()
  const [scope, setScope] = useState<CommentDoc['scope']>(initialScope)
  const [filterRefId, setFilterRefId] = useState<string>(refId || '')
  const [text, setText] = useState('')

  const key = useMemo(() => ['comments', operationId, scope, filterRefId || 'all'], [operationId, scope, filterRefId])

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(operationId),
    queryFn: async () => {
      const filters: any = { order: [['createdAt', 'desc']] }
      if (scope !== 'global') {
        filters.where = [ ['scope', '==', scope], ['refId', '==', filterRefId] ]
      } else {
        filters.where = [ ['scope', '==', 'global'] ]
      }
      const rows = await listCollection(`operations/${operationId}/comments`, filters)
      return rows as unknown as CommentDoc[]
    }
  })

  const create = useMutation({
    mutationFn: async () => {
      const id = crypto.randomUUID()
      await setDocData(`operations/${operationId}/comments/${id}`, {
        id,
        authorId: (globalThis as any)?.__uid || 'anon',
        text,
        scope,
        refId: scope === 'global' ? null : (filterRefId || null),
        createdAt: serverTimestamp(),
      }, true)
      return id
    },
    onSuccess: () => {
      setText('')
      qc.invalidateQueries({ queryKey: key })
    }
  })

  useEffect(() => {
    if (refId) setFilterRefId(refId)
  }, [refId])

  return (
    <div className="rounded-xl border bg-white p-3 space-y-3">
      <div className="flex items-center gap-2">
        <select className="px-2 py-1 border rounded" value={scope} onChange={(e)=>setScope(e.target.value as any)}>
          <option value="global">Global</option>
          <option value="unit">Unidade</option>
          <option value="tech">Técnico</option>
          <option value="day">Dia</option>
        </select>
        {scope !== 'global' && (
          <input className="px-2 py-1 border rounded" placeholder="ref id" value={filterRefId} onChange={(e)=>setFilterRefId(e.target.value)} />
        )}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 px-2 py-1 border rounded" placeholder="Escreva um comentário" value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="px-3 py-2 border rounded" disabled={!text.trim()} onClick={()=>create.mutate()}>Comentar</button>
      </div>
      <div className="space-y-2">
        {(query.data||[]).map((c) => (
          <div key={c.id} className="border rounded p-2">
            <div className="text-xs text-gray-500">{c.authorId} • {c.createdAt ? new Date(c.createdAt.seconds? c.createdAt.seconds*1000 : c.createdAt).toLocaleString() : ''} • {c.scope}{c.refId? `:${c.refId}`:''}</div>
            <div className="text-sm">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


