"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAttachment, listAttachments as listAttachmentsService, removeAttachment as removeAttachmentService } from '@/services/attachmentService';
import type { AttachmentRecord } from '@/services/attachmentService';
import { validateFile, formatFileSize, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/utils/cloudinary';
// Simple notifier fallback
const notify = {
  success: (msg: string) => (typeof window !== 'undefined' ? window.alert(msg) : console.log(msg)),
  error: (msg: string) => (typeof window !== 'undefined' ? window.alert(msg) : console.error(msg)),
};

interface AttachmentManagerProps {
  planId: string;
  readOnly?: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function AttachmentManager({ planId, readOnly = false }: AttachmentManagerProps) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar anexos
  const loadAttachments = useCallback(async () => {
    if (!planId) return;

    try {
      setLoading(true);
      // Reutilizamos attachmentService, tratando planId como operationId
      const data = await listAttachmentsService(planId);
      setAttachments(data);
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
      notify.error('Erro ao carregar anexos');
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  // Upload de arquivo (via attachmentService + Cloudinary)
  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const rec = await uploadAttachment({
      operationId: planId,
      file,
      meta: {
        category: 'outros',
        uploadedBy: user?.uid || null,
      },
    });

    return rec;
  };

  // Processar upload com progresso
  const handleFileUpload = async (files: FileList) => {
    if (!user || !planId) {
      notify.error('Usuário não autenticado');
      return;
    }

    const fileArray = Array.from(files);
    setUploading(true);
    
    // Inicializar progresso
    const initialProgress: UploadProgress[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));
    setUploadProgress(initialProgress);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        try {
          // Simular progresso (Cloudinary não fornece progresso real)
          for (let progress = 0; progress <= 100; progress += 10) {
            setUploadProgress(prev => prev.map((item, idx) => 
              idx === i ? { ...item, progress } : item
            ));
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const result = await uploadFile(file);
          
          // Atualizar progresso
          setUploadProgress(prev => prev.map((item, idx) => 
            idx === i ? { ...item, status: 'success', progress: 100 } : item
          ));

          notify.success(`${file.name} enviado com sucesso`);
          
        } catch (error) {
          console.error(`Erro ao enviar ${file.name}:`, error);
          setUploadProgress(prev => prev.map((item, idx) => 
            idx === i ? { 
              ...item, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            } : item
          ));
          notify.error(`Erro ao enviar ${file.name}`);
        }
      }

      // Recarregar anexos
      await loadAttachments();
      
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress([]), 3000);
    }
  };

  // Remover anexo
  const handleRemoveAttachment = async (attachment: AttachmentRecord) => {
    if (!user) {
      notify.error('Usuário não autenticado');
      return;
    }

    try {
      await removeAttachmentService(planId, attachment.id);
      setAttachments(prev => prev.filter(a => a.id !== attachment.id));
      notify.success('Anexo removido com sucesso');
      
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      notify.error('Erro ao remover anexo');
    }
  };

  // Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly || uploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [readOnly, uploading, handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Seleção de arquivos
  const handleFileSelect = () => {
    if (readOnly || uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Carregar anexos ao montar
  React.useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const isImage = (format: string) => ['jpg', 'jpeg', 'png', 'webp'].includes(format.toLowerCase());
  const isPdf = (format: string) => format.toLowerCase() === 'pdf';

  return (
    <div className="w-full border rounded-xl bg-white">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          Anexos do Planejamento
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{attachments.length} anexos</span>
          <span className="text-xs px-2 py-0.5 rounded border">Cloudinary</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Upload Area */}
        {!readOnly && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_FILE_TYPES.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="space-y-2">
              <div className="text-gray-500">
                {uploading ? (
                  <p>Enviando arquivos...</p>
                ) : (
                  <>
                    <p>Arraste arquivos aqui ou</p>
                    <button 
                      className="inline-flex items-center px-3 py-2 rounded border bg-white hover:bg-gray-50"
                      onClick={handleFileSelect}
                      disabled={uploading}
                    >
                      Selecionar arquivos
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-xs text-gray-400">
                Tipos aceitos: {ALLOWED_FILE_TYPES.map(t => t.split('/')[1]).join(', ')}
                <br />
                Tamanho máximo: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          </div>
        )}

        {/* Progresso de Upload */}
        {uploadProgress.length > 0 && (
          <div className="space-y-2">
            {uploadProgress.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.file.name}</span>
                  <span className="text-gray-500">
                    {item.status === 'success' && '✓'}
                    {item.status === 'error' && '✗'}
                    {item.status === 'uploading' && `${item.progress}%`}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${item.progress}%` }} />
                </div>
                {item.error && (
                  <p className="text-xs text-red-500">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lista de Anexos */}
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Carregando anexos...</p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum anexo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="border rounded-lg p-3 space-y-2">
                {/* Preview */}
                <div className="aspect-video bg-gray-100 rounded overflow-hidden relative">
                  {isImage(attachment.format) ? (
                    <Image
                      src={attachment.thumbUrl}
                      alt={attachment.originalFilename || 'preview'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : isPdf(attachment.format) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src={attachment.thumbUrl}
                        alt="PDF preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📄</div>
                        <div className="text-xs text-gray-500">{attachment.format.toUpperCase()}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate" title={attachment.originalFilename}>
                    {attachment.originalFilename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.bytes)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded border bg-white hover:bg-gray-50 text-sm"
                    onClick={() => window.open(attachment.secureUrl, '_blank')}
                  >
                    {isPdf(attachment.format) ? 'Abrir' : 'Ver'}
                  </button>
                  
                  {!readOnly && (
                    <button
                      className="inline-flex items-center justify-center px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                      onClick={() => handleRemoveAttachment(attachment)}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}