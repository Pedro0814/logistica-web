# Configuração do Firebase

Este projeto agora usa o Firebase como banco de dados para salvar os planejamentos e anexos. Siga as instruções abaixo para configurar:

## 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Digite um nome para o projeto (ex: "inventory-route-planner")
4. Siga os passos de configuração

## 2. Habilitar Serviços

### Firestore Database
1. No console do Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Escolha uma localização (ex: "us-central1")

### Storage
1. No console do Firebase, vá para "Storage"
2. Clique em "Começar"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Escolha a mesma localização do Firestore

## 3. Configurar Regras de Segurança

### Firestore Rules
No console do Firebase, vá para "Firestore Database" > "Regras" e substitua por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /planners/{plannerId} {
      allow read, write: if true; // Para desenvolvimento
    }
    match /attachments/{attachmentId} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

### Storage Rules
No console do Firebase, vá para "Storage" > "Regras" e substitua por:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /attachments/{userId}/{plannerId}/{fileName} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

## 4. Obter Configuração

1. No console do Firebase, clique na engrenagem (⚙️) ao lado de "Visão geral do projeto"
2. Selecione "Configurações do projeto"
3. Role até "Seus aplicativos" e clique em "Adicionar aplicativo"
4. Escolha "Web" (</>) 
5. Digite um nome para o app (ex: "inventory-planner-web")
6. Copie as configurações

## 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# OSRM Configuration
NEXT_PUBLIC_OSRM_URL=https://router.project-osrm.org

# Contact Email (for Nominatim geocoding)
NEXT_PUBLIC_CONTACT_EMAIL=seu_email@dominio.com
```

## 6. Testar

1. Execute `npm run dev`
2. Acesse a aplicação
3. Tente criar um planejamento
4. Verifique se os dados aparecem no Firestore

## Funcionalidades Implementadas

- ✅ Salvar planejamentos no Firestore
- ✅ Carregar planejamentos do Firestore
- ✅ Atualizar títulos dos planejamentos
- ✅ Excluir planejamentos
- ✅ Upload de anexos para Firebase Storage
- ✅ Download de anexos
- ✅ Exclusão de anexos
- ✅ Exportação para Excel (CSV)

## Próximos Passos

Para produção, considere:
1. Implementar autenticação de usuários
2. Configurar regras de segurança mais restritivas
3. Implementar backup automático
4. Configurar monitoramento e analytics
