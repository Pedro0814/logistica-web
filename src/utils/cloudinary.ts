// Note: Avoid importing Node 'crypto' at module scope to keep client bundle clean

// Client-side utilities
export const buildUploadUrl = (): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }
  return `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
};

export const buildThumbUrl = (publicId: string, format: string, options: {
  width?: number;
  height?: number;
  quality?: string;
} = {}): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  const { width = 320, height = 240, quality = 'auto' } = options;
  
  // Para PDFs, usar pg=1 para primeira página
  const pageParam = format === 'pdf' ? ',pg_1' : '';
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality},c_fill,w_${width},h_${height}${pageParam}/${publicId}`;
};

export const buildSecureUrl = (publicId: string, format: string): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
};

// Server-side utilities
export const generateSignature = (params: Record<string, any>): string => {
  // Import crypto only on server
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require('crypto') as typeof import('crypto');
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is not configured');
  }

  // Ordenar parâmetros alfabeticamente
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');
};

export const isSignedUploadEnabled = (): boolean => {
  return process.env.CLOUDINARY_SIGNED_ENABLED === 'true';
};

// Validação de tipos de arquivo
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip'
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não suportado. Tipos aceitos: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1]).join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
};

// Formatação de tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

