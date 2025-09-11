export type Attachment = {
  id: string;                 // docId Firestore
  planId: string;             // referência ao plano
  publicId: string;           // Cloudinary public_id
  secureUrl: string;          // Cloudinary secure_url
  thumbUrl: string;           // URL transformação p/ thumb (pg=1 p/ PDF)
  format: string;             // jpg, pdf, xlsx...
  bytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
  createdAt: number;          // Date.now()
  ownerUid: string;           // request.auth.uid
}

export type AttachmentUpload = {
  file: File;
  planId: string;
  onProgress?: (progress: number) => void;
}

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  original_filename?: string;
}

export type CloudinarySignResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

