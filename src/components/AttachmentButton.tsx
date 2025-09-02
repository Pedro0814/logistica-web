"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { useFirebase } from '@/hooks/useFirebase'

interface AttachmentButtonProps {
  onFileSelect?: (file: File) => void
  plannerId?: string
  fieldType?: string
  acceptedTypes?: string
  tooltip?: string
  variant?: 'discrete' | 'full'
  className?: string
}

export default function AttachmentButton({ 
  onFileSelect, 
  plannerId,
  fieldType,
  acceptedTypes = "image/*,.pdf", 
  tooltip,
  variant = 'discrete',
  className = ""
}: AttachmentButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, error: firebaseError } = useFirebase()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      if (onFileSelect) {
        // Modo personalizado - chama callback
        await onFileSelect(file)
      } else if (plannerId) {
        // Modo Firebase - upload direto
        const attachmentId = await uploadFile(file, plannerId)
        console.log('Arquivo enviado com sucesso:', attachmentId)
        alert('Arquivo enviado com sucesso!')
      } else {
        console.warn('Nenhum callback ou plannerId fornecido')
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error)
      alert('Erro ao enviar arquivo. Tente novamente.')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  if (variant === 'discrete') {
    return (
      <div className={`relative inline-flex ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
          title={tooltip || "Anexar arquivo"}
        >
          {isUploading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Enviando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {tooltip || "Anexar arquivo"}
          </>
        )}
      </Button>
    </div>
  )
}
