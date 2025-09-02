"use client"

import { useState, useEffect } from 'react'
import { useFirebase } from '@/hooks/useFirebase'

interface FieldAttachmentsProps {
  plannerId: string
  fieldType: string
  className?: string
}

interface Attachment {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  downloadURL: string
  createdAt: string
}

export default function FieldAttachments({ plannerId, fieldType, className = "" }: FieldAttachmentsProps) {
  const { getAttachments } = useFirebase()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (plannerId) {
      loadFieldAttachments()
    }
  }, [plannerId, fieldType])

  const loadFieldAttachments = async () => {
    try {
      setLoading(true)
      const allAttachments = await getAttachments(plannerId)
      // Filtrar anexos por fieldType (assumindo que o fileName contém o fieldType)
      const fieldAttachments = allAttachments.filter((att: any) => 
        att.fileName.includes(fieldType) || att.fileName.includes(fieldType.replace('_', '-'))
      )
      setAttachments(fieldAttachments)
    } catch (error) {
      console.error('Erro ao carregar anexos do campo:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className={`text-xs text-gray-400 ${className}`}>
        <svg className="w-3 h-3 animate-spin inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Carregando...
      </div>
    )
  }

  if (attachments.length === 0) {
    return null
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-2 py-1">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <svg className="w-3 h-3 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-green-700 truncate" title={attachment.fileName}>
              {attachment.fileName}
            </span>
            <span className="text-xs text-green-600">
              ({formatFileSize(attachment.fileSize)})
            </span>
          </div>
          <a
            href={attachment.downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 ml-2"
            title="Baixar arquivo"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>
        </div>
      ))}
    </div>
  )
}
