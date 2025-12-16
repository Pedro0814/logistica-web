import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  uploadAttachment,
  listAttachments as listAttachmentsService,
  removeAttachment as removeAttachmentService,
} from '@/services/attachmentService'

export type Attachment = {
  id: string
  dayId?: string
  unitId?: string
  techId?: string
  category: 'hotel' | 'alimentacao' | 'transporte' | 'passagens' | 'outros'
  amountCents?: number
  url: string
  publicId: string
  bytes: number
  mime: string
  uploadedAt: any
  uploadedBy?: string
  deletedAt?: any
}

export function useAttachments(operationId: string, dayId?: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = useMemo(() => ['attachments', operationId, dayId || 'all'], [operationId, dayId])

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(operationId),
    queryFn: async () => {
      const rows = await listAttachmentsService(operationId, { dayId })
      return (rows as any[]).filter((r) => !r.deletedAt) as unknown as Attachment[]
    },
  })

  const upload = useMutation({
    mutationFn: async ({ file, meta }: { file: File; meta: { dayId?: string; unitId?: string; techId?: string; category: Attachment['category']; amountCents?: number } }) => {
      const rec = await uploadAttachment({
        operationId,
        file,
        meta: {
          ...meta,
          uploadedBy: user?.uid || null,
        },
      })
      return rec as any
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
        amountCents: meta.amountCents,
        dayId: meta.dayId,
        unitId: meta.unitId,
        techId: meta.techId,
        uploadedAt: Date.now(),
        uploadedBy: 'you',
      }
      qc.setQueryData(key, [temp, ...prev])
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev) },
    onSettled: () => { qc.invalidateQueries({ queryKey: key }) },
  })

  const remove = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await removeAttachmentService(operationId, id)
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


