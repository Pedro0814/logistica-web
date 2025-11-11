export async function uploadUnsigned(
  file: File,
  _opts?: { category?: string; amountCents?: number }
): Promise<{ url: string; publicId: string; bytes: number; mime: string }> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  if (!cloud || !preset) throw new Error('Cloudinary env não configurado')

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Falha no upload Cloudinary')
  const json = await res.json()
  return {
    url: json.secure_url as string,
    publicId: json.public_id as string,
    bytes: Number(json.bytes) || file.size,
    mime: (json.resource_type && json.format) ? `${json.resource_type}/${json.format}` : file.type || 'application/octet-stream',
  }
}


