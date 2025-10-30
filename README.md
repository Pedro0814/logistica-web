# Logística Web - Planejador de Rotas

Sistema de planejamento logístico com integração Firebase + Cloudinary para gerenciamento de anexos.

## Configuração do Ambiente

### Variáveis de Ambiente (.env.local)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# OSRM Configuration
NEXT_PUBLIC_OSRM_URL=https://router.project-osrm.org

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_planner_beta
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_SIGNED_ENABLED=true
```

### Configuração do Cloudinary

1. **Criar conta no Cloudinary**: https://cloudinary.com
2. **Configurar Upload Preset** (para modo beta):
   - Acesse Dashboard > Settings > Upload
   - Crie um preset chamado `unsigned_planner_beta`
   - Marque como "Unsigned"
   - Configure folder: `planner_uploads`
3. **Obter credenciais**:
   - Cloud Name: Dashboard > Account Details
   - API Key: Dashboard > Account Details  
   - API Secret: Dashboard > Account Details

### Configuração do Firebase

1. **Firebase Project**: Criar projeto no https://console.firebase.google.com
2. **Authentication**: Habilitar Email/Password
3. **Firestore**: Criar banco de dados
4. **Service Account**: 
   - Project Settings > Service Accounts
   - Gerar nova chave privada
   - Baixar JSON e extrair credenciais

### Regras do Firestore

Aplicar as regras do arquivo `firestore.rules` no console do Firebase:

```bash
firebase deploy --only firestore:rules
```

## Funcionalidades

### Sistema de Anexos

- **Upload**: Drag & drop ou seleção de arquivos
- **Tipos suportados**: JPG, PNG, WebP, PDF, CSV, XLS, XLSX, ZIP
- **Tamanho máximo**: 20MB por arquivo
- **Armazenamento**: Cloudinary (arquivos) + Firestore (metadados)
- **Modos**:
  - **Beta**: Upload não assinado (apenas Firestore)
  - **Produção**: Upload assinado (Cloudinary + Firestore)

### Estrutura de Dados

```
plans/{planId}/attachments/{attachmentId}
├── id: string
├── planId: string  
├── publicId: string (Cloudinary)
├── secureUrl: string
├── thumbUrl: string
├── format: string
├── bytes: number
├── width?: number
├── height?: number
├── originalFilename?: string
├── createdAt: number
└── ownerUid: string
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy no Vercel
vercel --prod

# Emuladores Firebase (Firestore + Functions)
npm run emulators

# Cloud Functions
npm run functions:build
npm run functions:serve
npm run functions:deploy
```

### Cloud Functions (rollups analyticsCache)

Triggers em `operations/{operationId}/planning/{dayId}` e `operations/{operationId}/actuals/{dayId}` recalculam agregados e gravam em `analyticsCache/{operationId}`.

Agregados:
- byDay: totais plan/real por data
- byUnit: totais plan/real por unidade
- byTech: totais plan/real por técnico (custos repartidos pelos técnicos do dia)
- byCategory: totais globais por categoria de custo

Teste local:
1. `npm run functions:build`
2. `npm run emulators`
3. Edite um doc em `operations/<op>/actuals` no emulador → verifique `analyticsCache/<op>`.

## Segurança

- **API Routes**: Protegidas por Firebase ID Token
- **Firestore Rules**: Validação de ownership
- **Cloudinary**: Upload assinado em produção
- **Validação**: Tipos de arquivo e tamanho no client/server

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/cloudinary/     # API routes para Cloudinary
│   ├── planner/            # Páginas do planejador
│   └── ...
├── components/
│   ├── AttachmentManager.tsx  # Gerenciador de anexos
│   └── ...
├── types/
│   └── attachments.ts      # Tipos para anexos
├── utils/
│   ├── cloudinary.ts       # Utils do Cloudinary
│   └── firestore-attachments.ts  # Utils do Firestore
└── lib/
    └── firebase-admin.ts   # Configuração Firebase Admin
```

## Critérios de Aceite ✅

- [x] Upload funciona (unsigned/signed conforme flag)
- [x] Arquivos salvos no Cloudinary + metadados no Firestore
- [x] Listagem com thumbs/ícones corretos
- [x] Exclusão: Beta (só Firestore) / Produção (Cloudinary + Firestore)
- [x] Integração nas páginas /planner e /planner/schedule
- [x] Nenhum segredo exposto no client
- [x] Build Vercel verde