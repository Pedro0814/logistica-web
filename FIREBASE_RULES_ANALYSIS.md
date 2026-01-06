# Análise das Regras do Firebase Firestore

## ✅ Pontos Positivos

1. **Estrutura bem organizada** com helpers reutilizáveis
2. **RBAC implementado** (admin, coord, tech)
3. **Validações de dados** (datas ISO, valores monetários, etc.)
4. **Verificações de assignment** para técnicos

## ⚠️ Problemas Identificados

### 1. **INCONSISTÊNCIA CRÍTICA: `userId` vs `ownerUid`**

**Problema:**
- O código em `plannerService.ts` salva documentos com campo `userId`
- As regras do Firestore verificam `resource.data.ownerUid`
- O API route `cloudinary/delete/route.ts` espera `ownerUid`

**Localização:**
- `src/services/plannerService.ts` linha 86: usa `userId`
- Regras linha 165: verifica `resource.data.ownerUid`
- `src/app/api/cloudinary/delete/route.ts` linha 47: espera `ownerUid`

**Solução:**
Você precisa escolher um padrão:
- **Opção A**: Padronizar para `ownerUid` (recomendado)
- **Opção B**: Padronizar para `userId`

### 2. **Coleção `users` sem regras de escrita**

**Problema:**
As regras verificam a existência de documentos em `users/{uid}`:
```javascript
exists(/databases/$(database)/documents/users/$(request.auth.uid))
```
Mas não há regras para criar/editar documentos nessa coleção.

**Solução:**
Adicionar regras para a coleção `users`:
```javascript
match /users/{userId} {
  // Permite leitura para o próprio usuário e admins/coords
  allow read: if hasUserDocOrRole() && (
    role() == null || 
    isAdmin() || 
    isCoord() || 
    userId == request.auth.uid
  );
  
  // Permite criação/atualização apenas do próprio documento ou por admin
  allow create: if hasUserDocOrRole() && (
    role() == null || 
    isAdmin() || 
    userId == request.auth.uid
  );
  
  allow update: if hasUserDocOrRole() && (
    role() == null || 
    isAdmin() || 
    (userId == request.auth.uid && request.resource.data.uid == userId)
  );
  
  allow delete: if hasUserDocOrRole() && (role() == null || isAdmin());
}
```

### 3. **Campo `ownerUid` pode ser null nas regras de `plans`**

**Problema:**
Na linha 165 das regras:
```javascript
resource.data.ownerUid == null ||
resource.data.ownerUid == request.auth.uid
```
Permite edição quando `ownerUid` é `null`, o que pode não ser o comportamento desejado.

**Solução:**
Se você quer que apenas o dono edite, remova a verificação de `null`:
```javascript
resource.data.ownerUid != null &&
resource.data.ownerUid == request.auth.uid
```

### 4. **Validações faltando em `plans/attachments`**

**Problema:**
As regras para `plans/{planId}/attachments/{attachmentId}` não validam os campos obrigatórios como `url`, `publicId`, `uploadedAt`.

**Solução:**
Adicionar validações similares às de `operations/attachments`:
```javascript
allow create: if hasUserDocOrRole() && (
  role() == null ||
  isAdmin() ||
  isCoord() ||
  resource.data.ownerUid == request.auth.uid
)
&& request.resource.data.url is string
&& request.resource.data.publicId is string
&& request.resource.data.uploadedAt != null;
```

### 5. **Permissão muito permissiva para criar `plans`**

**Problema:**
Qualquer usuário autenticado pode criar um `plan`, mas apenas o dono/admin/coord pode editar. Isso pode ser intencional, mas considere se faz sentido.

**Situação atual:**
```javascript
allow create: if hasUserDocOrRole();
```

## 🔧 Recomendações

### Prioridade ALTA

1. **Corrigir inconsistência `userId` vs `ownerUid`**
   - Decidir qual usar e atualizar código/regras
   - Sugestão: usar `ownerUid` para manter consistência com `operations`

2. **Adicionar regras para coleção `users`**
   - Permitir que usuários criem/atualizem seus próprios documentos

### Prioridade MÉDIA

3. **Padronizar comportamento de `ownerUid == null`**
   - Definir se documentos sem dono podem ser editados por qualquer um
   - Ou exigir que sempre haja um dono

4. **Adicionar validações em `plans/attachments`**
   - Garantir que campos obrigatórios estejam presentes

### Prioridade BAIXA

5. **Revisar permissões de criação de `plans`**
   - Se necessário, restringir criação apenas para usuários com role

## 📝 Sugestão de Regras Atualizadas

Veja arquivo `firestore.rules.updated` para versão corrigida com todas as melhorias.

## 🔴 Ação Imediata Necessária

### Problema Crítico: Inconsistência `userId` vs `ownerUid`

**Situação atual:**
- `plannerService.ts` salva documentos em `plans` com campo `userId`
- API route `cloudinary/delete/route.ts` espera campo `ownerUid`
- Regras do Firestore verificam `resource.data.ownerUid`

**Impacto:**
- As regras não vão funcionar corretamente para documentos criados pelo `plannerService`
- A API de delete não vai funcionar para documentos criados pelo `plannerService`
- Usuários podem conseguir editar documentos que não são deles

**Solução recomendada:**

1. **Padronizar para `ownerUid`** (mantém consistência com `operations`):
   - Atualizar `plannerService.ts` para usar `ownerUid` em vez de `userId`
   - Ou manter ambos durante migração

2. **Alternativa: Padronizar para `userId`**:
   - Atualizar API route e regras para usar `userId`
   - Mais trabalho, pois precisa atualizar regras também

**Recomendação:** Use `ownerUid` para manter consistência com o resto do sistema.

## 📋 Checklist de Implementação

- [ ] Corrigir inconsistência `userId`/`ownerUid` no código
- [ ] Adicionar regras para coleção `users`
- [ ] Testar permissões após atualização
- [ ] Atualizar regras no Firebase Console
- [ ] Verificar se documentos existentes precisam migração

