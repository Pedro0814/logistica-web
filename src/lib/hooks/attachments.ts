import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listCollection, setDocData, updateDocData } from '@/lib/firebase/db'
import { serverTimestamp, doc, deleteDoc } from 'firebase/firestore'
import { uploadUnsigned } from '@/lib/cloudinary/upload'

export type Attachment = {
  id: string
  dayId?: string
  unitId?: string
  techId?: string
  category: 'hotel' | 'alimentacao' | 'transporte' | 'passagens' | 'outros'
  url: string
  publicId: string
  bytes: number
  mime: string
  uploadedAt: any
  userId?: string
}

export function useAttachments(operationId: string, dayId?: string) {
  const qc = useQueryClient()
  const key = useMemo(() => ['attachments', operationId, dayId || 'all'], [operationId, dayId])

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(operationId),
    queryFn: async () => {
      const filters: any = { order: [['uploadedAt', 'desc']] }
      if (dayId) filters.where = [['dayId', '==', dayId]]
      const rows = await listCollection(`operations/${operationId}/attachments`, filters)
      return rows as unknown as Attachment[]
    },
  })

  const upload = useMutation({
    mutationFn: async ({ file, meta }: { file: File; meta: { dayId?: string; unitId?: string; techId?: string; category: Attachment['category'] } }) => {
      const up = await uploadUnsigned(file)
      const id = crypto.randomUUID()
      await setDocData(`operations/${operationId}/attachments/${id}`, {
        id,
        dayId: meta.dayId || null,
        unitId: meta.unitId || null,
        techId: meta.techId || null,
        category: meta.category,
        url: up.url,
        publicId: up.publicId,
        bytes: up.bytes,
        mime: up.mime,
        uploadedAt: serverTimestamp(),
      }, true)
      return { id, ...up, ...meta } as any
    },
    onMutate: async ({ file, meta }) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<Attachment[]>(key) || []
      const temp: Attachment = {
        id: 'temp-' + crypto.randomUUID(),
        url: '',
        publicId: '',
        bytes: file.size,
        mime: file.type,
        category: meta.category,
        dayId: meta.dayId,
        unitId: meta.unitId,
        techId: meta.techId,
        uploadedAt: Date.now(),
      }
      qc.setQueryData(key, [temp, ...prev])
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev) },
    onSettled: () => { qc.invalidateQueries({ queryKey: key }) },
  })

  const remove = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      // Here we assume a server route handles Cloudinary deletion. For now only remove Firestore doc.
      await updateDocData(`operations/${operationId}/attachments/${id}`, { deletedAt: serverTimestamp() })
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<Attachment[]>(key) || []
      qc.setQueryData(key, prev.filter((a) => a.id !== id))
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev) },
    onSettled: () => { qc.invalidateQueries({ queryKey: key }) },
  })

  return {
    items: (query.data || []) as Attachment[],
    isLoading: query.isLoading,
    error: query.error,
    upload,
    remove,
  }
}


