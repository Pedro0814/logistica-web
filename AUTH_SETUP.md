# Configuração de Autenticação Firebase

Este documento explica como configurar e usar o sistema de autenticação do Firebase no projeto.

## 📋 Pré-requisitos

1. **Projeto Firebase criado** (se ainda não tiver, siga as instruções em `FIREBASE_SETUP.md`)
2. **Autenticação por Email/Senha habilitada** no Firebase Console

## 🔧 Configuração

### 1. Habilitar Autenticação no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication** > **Sign-in method**
4. Clique em **Email/Password**
5. Ative a opção **Enable**
6. Clique em **Save**

### 2. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` contém as credenciais do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Aplicar Regras do Firestore

As regras do Firestore já estão configuradas para funcionar com autenticação. Certifique-se de que as regras estão publicadas no Firebase Console (veja `FIX_ATTACHMENTS_PERMISSIONS.md`).

## 🚀 Como Usar

### Para Usuários

1. **Acessar a aplicação**: Abra a aplicação no navegador
2. **Fazer login**: Se não estiver logado, será redirecionado para `/login`
3. **Criar conta**: Clique em "Criar conta" e preencha:
   - Nome (opcional)
   - Email
   - Senha (mínimo 6 caracteres)
4. **Entrar**: Use seu email e senha para fazer login
5. **Recuperar senha**: Clique em "Esqueceu sua senha?" na tela de login

### Para Desenvolvedores

#### Estrutura de Autenticação

- **AuthContext** (`src/contexts/AuthContext.tsx`): Gerencia o estado global de autenticação
- **LoginForm** (`src/components/auth/LoginForm.tsx`): Formulário de login/cadastro
- **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`): Componente para proteger rotas
- **Navbar** (`src/components/Navbar.tsx`): Mostra informações do usuário e botão de logout

#### Proteger uma Rota

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function MinhaPage() {
  return (
    <ProtectedRoute>
      <ConteudoDaPage />
    </ProtectedRoute>
  )
}
```

#### Usar Autenticação em um Componente

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MeuComponente() {
  const { user, loading, logout } = useAuth()
  
  if (loading) return <div>Carregando...</div>
  if (!user) return <div>Faça login</div>
  
  return (
    <div>
      <p>Olá, {user.email}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  )
}
```

#### Métodos Disponíveis no AuthContext

- `user`: Usuário atual (null se não estiver logado)
- `loading`: Estado de carregamento
- `error`: Mensagem de erro (se houver)
- `login(email, password)`: Fazer login
- `signup(email, password, displayName?)`: Criar conta
- `logout()`: Fazer logout
- `resetPassword(email)`: Enviar email de recuperação
- `clearError()`: Limpar mensagem de erro

## 🔐 Segurança

### Regras do Firestore

As regras do Firestore foram configuradas para:
- **Desenvolvimento**: Permitir qualquer usuário autenticado (quando não há custom claims)
- **Produção**: Validar por role/assignment (quando há custom claims configuradas)

### Custom Claims (Futuro)

Para implementar roles (admin, coord, tech) em produção:

1. Use Firebase Admin SDK para definir custom claims:
```typescript
await admin.auth().setCustomUserClaims(uid, { role: 'admin' })
```

2. O usuário precisa fazer logout/login para atualizar o token

3. As regras do Firestore já estão preparadas para validar roles

## 🐛 Troubleshooting

### Erro: "Firebase não configurado"

- Verifique se as variáveis de ambiente estão configuradas
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Reinicie o servidor de desenvolvimento após alterar variáveis de ambiente

### Erro: "Missing or insufficient permissions"

- Verifique se as regras do Firestore foram publicadas
- Verifique se o usuário está autenticado
- Verifique se a autenticação por email/senha está habilitada no Firebase Console

### Usuário não consegue fazer login

- Verifique se o email está correto
- Verifique se a senha tem pelo menos 6 caracteres
- Verifique se a autenticação por email/senha está habilitada
- Verifique o console do navegador para mensagens de erro

### Redirecionamento infinito

- Verifique se a página de login não está tentando redirecionar usuários já logados
- Verifique se o AuthContext está inicializando corretamente

## 📝 Notas

- A página de login (`/login`) não mostra a Navbar
- Usuários não autenticados são redirecionados para `/login`
- Usuários autenticados na página de login são redirecionados para `/`
- A Navbar mostra o nome/email do usuário e botão de logout quando logado
- O sistema funciona em modo desenvolvimento sem custom claims

## 🎯 Próximos Passos

1. Implementar custom claims para roles (admin, coord, tech)
2. Adicionar mais métodos de autenticação (Google, GitHub, etc.)
3. Implementar verificação de email
4. Adicionar redefinição de senha mais robusta
5. Implementar gestão de perfil do usuário

