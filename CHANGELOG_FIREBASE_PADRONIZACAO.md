# Changelog - Padronização Firebase Rules e ownerUid

## ✅ Mudanças Realizadas

### 1. Padronização de `userId` → `ownerUid`

**Arquivos atualizados:**

- ✅ `src/services/plannerService.ts`
  - Interface `Planner`: `userId` → `ownerUid`
  - Função `savePlanner`: parâmetro `userId` → `ownerUid`
  - Campos salvos no Firestore: `userId` → `ownerUid`

- ✅ `src/app/planner/page.tsx`
  - Chamada `savePlannerService`: `userId` → `ownerUid`

- ✅ `src/app/api/cloudinary/delete/route.ts`
  - Mantida compatibilidade com ambos (`ownerUid` e `userId`) durante migração
  - Prioriza `ownerUid`, aceita `userId` como fallback

### 2. Consolidação das Regras do Firestore

**Arquivo:** `firestore.rules` (reescrito completamente)

**Melhorias implementadas:**

1. ✅ **Regras para coleção `users` adicionadas**
   - Permite criar/ler/atualizar documentos de usuários
   - Proteção adequada por role e ownership

2. ✅ **Padronização de `ownerUid` em `plans`**
   - Regras agora verificam `ownerUid` (com compatibilidade temporária para `userId`)
   - Validações adequadas para permissões de update/delete

3. ✅ **Validações em `plans/attachments`**
   - Validação de campos obrigatórios (`url`, `publicId`, `uploadedAt`)
   - Verificação de ownership do plano pai

4. ✅ **Helper function `planOwnerUid()`**
   - Função auxiliar para obter ownerUid com compatibilidade para `userId`
   - Usado nas regras de `plans/attachments`

5. ✅ **Estrutura organizada e documentada**
   - Seções claramente separadas
   - Comentários explicativos
   - Helpers reutilizáveis

### 3. Arquivos Removidos

- ❌ `firestore.rules.updated` (removido - consolidado em `firestore.rules`)

## 📋 Estrutura das Regras

As regras agora cobrem:

1. **users** - Gerenciamento de usuários
2. **operations** - Operações principais
   - planning - Planejamento diário
   - actuals - Dados reais/executados
   - attachments - Anexos de operações
   - assignments - Atribuições de técnicos
   - comments - Comentários
3. **technicians** - Técnicos
4. **units** - Unidades
5. **weekendPolicies** - Políticas de fim de semana
6. **plans** - Planejadores (legado/compatibilidade)
   - attachments - Anexos de planejadores

## 🔄 Compatibilidade

### Durante Migração

As regras e código mantêm compatibilidade com documentos antigos que usam `userId`:

- **Regras:** Verificam tanto `ownerUid` quanto `userId`
- **API Route:** Aceita ambos os campos
- **Código novo:** Usa apenas `ownerUid`

### Próximos Passos (Opcional)

Após confirmar que tudo funciona:

1. Migrar documentos existentes de `userId` para `ownerUid` (script de migração)
2. Remover verificação de `userId` nas regras
3. Simplificar código da API route

## ⚠️ Nota sobre Coleção `planners`

O serviço `src/services/firebase.ts` ainda usa a coleção `planners` (diferente de `plans`). 

- **Status:** Mantido como está (coleção diferente)
- **Uso:** Utilizado por `src/app/planner/schedule/page.tsx`
- **Ação:** Se necessário, adicionar regras para `planners` também, ou migrar para `plans`

## 🚀 Como Aplicar

1. **Copiar regras para Firebase Console:**
   - Abra `firestore.rules`
   - Copie todo o conteúdo
   - Cole no Firebase Console > Firestore Database > Regras
   - Publique

2. **Testar aplicação:**
   - Verificar criação de novos plans (devem usar `ownerUid`)
   - Verificar permissões de edição/exclusão
   - Verificar upload de anexos

3. **Verificar logs:**
   - Verificar se há erros de permissão no console
   - Testar com diferentes roles (admin, coord, tech)

