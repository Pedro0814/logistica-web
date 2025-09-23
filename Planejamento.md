Planejamento.md
Etapas 
0) Base & Env

Objetivo: Base do app pronta (UI, libs, .env).
Entregáveis: Tailwind + shadcn, Recharts, helpers de moeda (centavos↔BRL), fetch ViaCEP, SDK Cloudinary.
Critérios de aceite: build roda; formatCurrencyBRL() e parseCurrencyToCents() funcionam; getAddressByCEP() retorna logradouro/bairro/cidade/UF.

1) Modelo de Dados (Firestore) + Índices

Objetivo: Collections e tipos: operations, technicians, units, planning, actuals, attachments, weekendPolicies, comments.
Entregáveis: Esquemas TS, caminhos, índices por (operationId, date).
Critérios de aceite: CRUD mínimo via scripts; docs de exemplo criados.

2) Regras de Segurança (Firestore)

Objetivo: RBAC: admin, coordenação, técnico.
Entregáveis: firestore.rules cobrindo leitura/edição por role e por operationId.
Critérios de aceite: técnico só edita actuals e attachments da sua operação; admin/coord veem tudo.

3) Componentes Reutilizáveis

Objetivo: Montar blocos que serão usados nas telas.
Entregáveis: <MoneyInput />, <CEPField />, <WeekendPolicyBuilder />, <TechMultiSelect />.
Critérios de aceite: componentes com máscara BRL; CEP faz autofill; policy marca S/D por semana.

4) Etapa 1 – Tela de Planejamento

Objetivo: Criar /planejamento/[operationId].
Entregáveis:

Cabeçalho: cliente, período, toggles Multi-técnico e Equalizar custos (replicar|dividir).

Regras de fim de semana por semana (sábado/domingo).

Unidades com CEP→autofill (editável).

Cronograma (tabela): Data | Unidade | Técnicos[] | Bens/dia | Passagens | Transp. Local | Hotel | Alimentação | Hidratação | Ajuda Extra (todos em BRL).
Critérios de aceite: salvar em centavos; política de fim de semana reflete no preview; adicionar 2º técnico funciona.

5) Lógica de Equalização de Custos

Objetivo: Implementar regras replicate/divide.
Entregáveis: serviço applyCostEqualization(mode, techCount) aplicado ao cronograma.
Critérios de aceite:

Replicar: ao adicionar 2º técnico, custos por técnico se mantêm iguais.

Dividir: custos compartilhados divididos pelo nº de técnicos.

6) CEP → Autofill + Geocodificação (opcional)

Objetivo: Completar endereço via ViaCEP e armazenar autoFilledFromCEP.
Entregáveis: mutation de unidade; botão “Geocodificar” (stub).
Critérios de aceite: CEP inválido não quebra; campos continuam editáveis.

7) Etapa 2 – Execução em Tempo Real (tabela espelhada)

Objetivo: Criar /execucao/[operationId].
Entregáveis:

Mesmas colunas da Etapa 1, inputs reais vazios, ao lado o valor planejado em cinza (“ghost”).

Badge % acima de cada valor: real ÷ planejado.

Linha de bens reais do dia.
Critérios de aceite: autosave; destacar célula se real > 150% do planejado.

8) Anexos + Timeline (Cloudinary)

Objetivo: Upload e histórico de comprovantes.
Entregáveis: upload categorizado (hotel, alimentação, transporte, passagens, outros), lista com miniatura, data/hora, autor.
Critérios de aceite: salvar URL/publicId no Firestore; timeline ordenada por upload; abrir/baixar arquivo.

9) Gráficos em Tempo Real (rodapé da Execução)

Objetivo: Acompanhamento visual diário.
Entregáveis:

Gráfico 1: Gasto acumulado — Plan x Real por dia.

Gráfico 2: Bens/dia — Plan x Real + linha de tendência simples.
Critérios de aceite: atualiza ao editar valores; tooltips e legendas claros.

10) Etapa 3 – Análise & Comparação

Objetivo: Criar /analise/[operationId].
Entregáveis: KPIs (desvio custos, bens/dia, aderência a prazo), gráficos (barras agrupadas, linhas, scatter), tabela por unidade/técnico com var%.
Critérios de aceite: cálculos:

desvio% = (real − plan)/plan;

custo por bem = total/goods;

aderência = dias reais / planejados.

11) Comentários & Justificativas

Objetivo: Campo aberto e comentários ancorados.
Entregáveis: editor simples + salvar em /comments com scope (global|unit|tech|day).
Critérios de aceite: exibe autor e timestamp; listagem por escopo.

12) Exportações (PDF e CSV)

Objetivo: Relatório executivo e dados brutos.
Entregáveis: PDF com KPIs + gráficos; CSV por dia/linha.
Critérios de aceite: baixar arquivos; números formatados; datas ISO no CSV.

13) Cloud Functions (rollups) & Cache Analítico

Objetivo: Pré-agregar para performance.
Entregáveis: functions que consolidam plan/real por dia/unidade/técnico em analyticsCache.
Critérios de aceite: página de análise carrega em <1s com cache; invalidar em atualização de actuals.

14) Filtros, Paginação e Desempenho

Objetivo: Operações longas (4–5+ semanas).
Entregáveis: filtros por técnico/unidade/semana; paginação semanal; memoização de seletores.
Critérios de aceite: UI continua fluida com 1k+ linhas.

15) Auditoria & Logs

Objetivo: Rastreabilidade.
Entregáveis: eventos planning.created|updated, actuals.updated, attachment.uploaded, policy.changed com actorId, timestamp e diff.
Critérios de aceite: visualizar histórico por operação.

16) Seeds & Smoke Tests

Objetivo: Dados de demonstração e verificação básica.
Entregáveis: script que cria operação demo com 2 técnicos, 3 semanas, anexos fake.
Critérios de aceite: navegação completa nas 3 telas sem erros.