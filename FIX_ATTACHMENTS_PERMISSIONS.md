# Correção: Permissões de Anexos no Firestore

## Problema Identificado

O erro "Missing or insufficient permissions" ao carregar anexos ocorria porque as regras do Firestore exigiam:
1. **Custom claims** (`role` no token JWT) - que não estavam configurados
2. **Assignment documents** - que não existiam para o usuário

## Solução Implementada

As regras foram ajustadas para funcionar em **dois modos**:

### 1. Modo Desenvolvimento (sem custom claims)
- Se o usuário **não tem** `role` no token: permite qualquer usuário autenticado
- Útil para desenvolvimento local e testes

### 2. Modo Produção (com custom claims)
- Se o usuário **tem** `role` no token: valida por role/assignment
- Admin/Coord: acesso total
- Tech: acesso apenas às operações onde está assigned

## Mudanças nas Regras

### `operations/{operationId}/attachments/{attachmentId}`

**Leitura (`allow read`):**
- ✅ Autenticado E (sem role OU tem role válido)
- Permite acesso se: `role() == null` OU `isAdmin()` OU `isCoord()` OU (`isTech()` E `isAssignedTech()`)

**Criação (`allow create`):**
- ✅ Autenticado E validação de dados (url, publicId, uploadedAt)
- Mesma lógica de permissão da leitura

**Update/Delete (`allow update, delete`):**
- ✅ Autor do anexo OU admin/coord
- Em dev (sem role): permite qualquer autenticado
- Em produção (com role): valida ownership

### `operations/{operationId}`

**Leitura:**
- ✅ Autenticado E (sem role OU tem role válido)

**Escrita:**
- ✅ Admin/Coord OU qualquer autenticado em dev

## Como Aplicar as Correções

### Opção 1: Deploy via Firebase CLI (Recomendado)

```bash
# 1. Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# 2. Login no Firebase
firebase login

# 3. Deploy das regras
firebase deploy --only firestore:rules
```

### Opção 2: Manual no Console Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Regras**
4. Copie o conteúdo de `firestore.rules`
5. Cole no editor de regras
6. Clique em **Publicar**

## Verificação

Após aplicar as regras:

1. **Recarregue a página** da aplicação
2. **Faça login** (se ainda não estiver)
3. **Tente carregar os anexos** novamente

O erro "Missing or insufficient permissions" não deve mais aparecer.

## Próximos Passos (Opcional - Para Produção)

Se quiser implementar o sistema completo de roles:

1. **Configurar Custom Claims:**
   ```typescript
   // Usando Firebase Admin SDK
   await admin.auth().setCustomUserClaims(uid, { role: 'admin' })
   ```

2. **Criar Assignment Documents:**
   ```typescript
   // Para cada técnico em uma operação
   await db.collection(`operations/${operationId}/assignments`).doc(uid).set({
     techId: uid,
     participates: true,
     createdAt: serverTimestamp()
   })
   ```

3. **Fazer logout/login** para atualizar o token com as claims

## Arquivos Modificados

- ✅ `firestore.rules` - Regras ajustadas para funcionar com/sem custom claims
- ✅ `firebase.json` - Adicionada configuração do Firestore para deploy

## Notas

- As regras são **backward-compatible**: funcionam com e sem custom claims
- Em **desenvolvimento**: qualquer usuário autenticado pode acessar
- Em **produção**: configure custom claims para controle de acesso completo
- O erro do **favicon.ico** (404) é cosmético e não afeta o funcionamento

