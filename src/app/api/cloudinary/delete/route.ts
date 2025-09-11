import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyIdToken } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Parse do body
    const body = await request.json();
    const { planId, publicId, attachmentId } = body;

    if (!planId || !publicId || !attachmentId) {
      return NextResponse.json({ 
        error: 'planId, publicId e attachmentId são obrigatórios' 
      }, { status: 400 });
    }

    // Verificar se o usuário é dono do plano
    if (!db) {
      return NextResponse.json({ error: 'Firebase não configurado' }, { status: 500 });
    }

    const planRef = db.collection('plans').doc(planId);
    const planDoc = await planRef.get();
    
    if (!planDoc.exists) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    const planData = planDoc.data() as { ownerUid?: string } | undefined;
    if (!planData || planData.ownerUid !== uid) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Deletar do Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error('Erro ao deletar do Cloudinary:', cloudinaryError);
      // Continuar mesmo se falhar no Cloudinary (arquivo pode já ter sido deletado)
    }

    // Remover do Firestore
    const attachmentRef = db.collection('plans').doc(planId).collection('attachments').doc(attachmentId);
    await attachmentRef.delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API de delete:', error);
    
    if (error instanceof Error && error.message.includes('Token')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
