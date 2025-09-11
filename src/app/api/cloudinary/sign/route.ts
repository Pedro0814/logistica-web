import { NextRequest, NextResponse } from 'next/server';
import { generateSignature } from '@/utils/cloudinary';
import { verifyIdToken } from '@/lib/firebase-admin';

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
    const { planId, folder } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId é obrigatório' }, { status: 400 });
    }

    // Configurações do Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      return NextResponse.json({ error: 'Configuração do Cloudinary não encontrada' }, { status: 500 });
    }

    // Gerar timestamp e folder
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadFolder = folder || `planner_uploads/${planId}`;

    // Parâmetros para assinatura
    const params = {
      timestamp,
      folder: uploadFolder,
      api_key: apiKey
    };

    // Gerar assinatura
    const signature = generateSignature(params);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder: uploadFolder
    });

  } catch (error) {
    console.error('Erro na API de sign:', error);
    
    if (error instanceof Error && error.message.includes('Token')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

