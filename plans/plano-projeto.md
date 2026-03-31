# Plano de Projeto — ProtheusApp
## Integração Mobile com Protheus (TOTVS)

---

## Visão Geral das Fases

```
Fase 0 → Setup & Fundação
Fase 1 → Autenticação & Navegação
Fase 2 → Dashboard de Vendas
Fase 3 → Cadastros (Clientes, Produtos, Transportadoras, Tabelas)
Fase 4 → Pedido de Venda
Fase 5 → Perfis de Acesso & Permissões
Fase 6 → Polimento, Testes & Deploy
```

---

## FASE 0 — Setup & Fundação
**Objetivo:** Projeto configurado, estrutura de pastas criada, dependências instaladas.

### Tarefas
- [ ] Criar projeto com `npx create-expo-app protheusapp --template expo-template-blank-typescript`
- [ ] Instalar todas as dependências do stack (React Navigation, Zustand, TanStack Query, Axios, React Hook Form, Zod, React Native Paper, Victory Native, MMKV, SecureStore, date-fns)
- [ ] Criar estrutura de pastas conforme `CLAUDE.md`
- [ ] Configurar arquivo `.env` com variáveis de ambiente
- [ ] Configurar cliente Axios com interceptors de autenticação e retry
- [ ] Configurar tema global (cores, tipografia, Material Design 3)
- [ ] Configurar ESLint + Prettier
- [ ] Inicializar repositório Git e fazer primeiro commit

### Entregável
Projeto rodando no Expo Go com tela em branco e toda a infraestrutura pronta.

### Prompt sugerido para Claude Code
```
Fase 0: Setup do projeto ProtheusApp.
Leia o CLAUDE.md e instale todas as dependências listadas.
Crie a estrutura de pastas completa em src/.
Configure o cliente Axios em src/api/client.ts com:
- baseURL via EXPO_PUBLIC_API_URL
- interceptor para injetar Bearer token em toda requisição
- interceptor de resposta para tratar erros 401 (refresh token) e 5xx (retry 3x)
Configure o tema Material Design 3 em src/theme/index.ts.
Commit: "chore: project setup and base configuration"
```

---

## FASE 1 — Autenticação & Navegação
**Objetivo:** Login funcional integrado ao Protheus, navegação base configurada.

### Tarefas
- [ ] Tela de Login (usuário/senha, botão entrar, feedback de erro)
- [ ] Integração com endpoint `/api/oauth2/v1/token` do Protheus
- [ ] Armazenar token de forma segura com SecureStore
- [ ] Zustand store de autenticação (`useAuthStore`) com: token, usuário, perfil, empresa/filial
- [ ] Refresh token automático via interceptor Axios
- [ ] Navegação condicional: se logado → App, se não → Auth
- [ ] Bottom Tab Navigator com as abas: Dashboard, Pedidos, Clientes, Produtos
- [ ] Drawer lateral com: Perfil do usuário, Configurações, Sair
- [ ] Tela de loading/splash enquanto verifica sessão salva
- [ ] Logout com limpeza de token e redirecionamento

### Entregável
Fluxo completo de login/logout funcionando com a API real do Protheus.

### Prompt sugerido para Claude Code
```
Fase 1: Autenticação e Navegação.
Crie a tela de Login em src/screens/auth/LoginScreen.tsx usando React Native Paper.
Implemente useAuthStore com Zustand em src/store/authStore.ts.
Crie o endpoint de auth em src/api/endpoints/auth.ts.
Configure o React Navigation com:
- AuthStack (Login)
- AppStack com Bottom Tab (Dashboard, Pedidos, Clientes, Produtos)
- Drawer lateral com perfil e logout
Salvar token com Expo SecureStore, nunca AsyncStorage.
Commit: "feat: authentication and navigation setup"
```

---

## FASE 2 — Dashboard de Vendas
**Objetivo:** Vendedor visualiza seus KPIs e histórico de vendas em tempo real.

### Tarefas
- [ ] Tela Dashboard principal com header personalizado (nome do vendedor, data)
- [ ] Cards de KPI: Total de vendas do mês, Total de pedidos, Ticket médio, Meta vs Realizado
- [ ] Gráfico de linha: evolução de vendas nos últimos 30 dias (Victory Native)
- [ ] Gráfico de barras: top 5 produtos mais vendidos
- [ ] Lista dos últimos 5 pedidos realizados (com status)
- [ ] Pull-to-refresh para atualizar dados
- [ ] Skeleton loader enquanto carrega
- [ ] Para Supervisor/Gerente: seletor de vendedor para ver dashboard de outro membro da equipe

### Entregável
Dashboard completo e responsivo com dados reais da API.

### Prompt sugerido para Claude Code
```
Fase 2: Dashboard de Vendas.
Crie src/screens/dashboard/DashboardScreen.tsx.
Crie src/hooks/useDashboard.ts usando TanStack Query para buscar KPIs.
Implemente os cards de KPI com animação de entrada.
Adicione gráfico de linha (últimos 30 dias) e barras (top 5 produtos) com Victory Native XL.
Adicione pull-to-refresh e skeleton loaders.
Para perfil Supervisor/Gerente, adicionar dropdown para selecionar vendedor.
Commit: "feat: sales dashboard with charts and KPIs"
```

---

## FASE 3 — Cadastros (Clientes, Produtos, Transportadoras, Tabelas de Preço)
**Objetivo:** Vendedor consulta todos os cadastros necessários para montar um pedido.

### Tarefas

#### 3a — Clientes
- [ ] Listagem de clientes com busca por nome/CNPJ/código
- [ ] Paginação infinita (scroll infinito)
- [ ] Card do cliente: nome, CNPJ, cidade/estado, limite de crédito
- [ ] Tela de detalhe do cliente: dados completos + histórico de pedidos

#### 3b — Produtos
- [ ] Listagem de produtos com busca por código/descrição
- [ ] Card do produto: código, descrição, unidade, **saldo em estoque**, preço base
- [ ] Filtro por grupo de produto
- [ ] Tela de detalhe: dados completos + saldo por armazém

#### 3c — Tabelas de Preço
- [ ] Listagem de tabelas disponíveis para o vendedor
- [ ] Detalhe da tabela: preços por produto

#### 3d — Transportadoras
- [ ] Listagem de transportadoras com busca
- [ ] Card: nome, CNPJ, cidade

### Entregável
Todos os cadastros navegáveis, com busca e paginação funcionando.

### Prompt sugerido para Claude Code
```
Fase 3: Módulo de Cadastros.
Crie os endpoints em src/api/endpoints/ para clientes, produtos, tabelas e transportadoras.
Crie custom hooks: useClientes, useProdutos, useTabelas, useTransportadoras.
Implemente as telas de listagem com FlatList otimizada (keyExtractor, getItemLayout).
Adicionar busca com debounce de 300ms para não sobrecarregar a API.
Paginação infinita com useInfiniteQuery do TanStack Query.
Na listagem de produtos, sempre exibir saldo de estoque com destaque visual (verde/amarelo/vermelho).
Commit: "feat: cadastros module - clientes, produtos, tabelas e transportadoras"
```

---

## FASE 4 — Pedido de Venda
**Objetivo:** Vendedor consegue incluir um pedido completo pelo app, integrado ao Protheus.

### Tarefas

#### 4a — Criação do Pedido
- [ ] Seleção de cliente (busca e selecionar da listagem)
- [ ] Seleção de tabela de preço
- [ ] Seleção de transportadora
- [ ] Adição de itens: buscar produto → informar quantidade → preço carregado da tabela automaticamente
- [ ] Possibilidade de alterar preço (com validação de desconto máximo por perfil)
- [ ] Resumo do pedido: itens, subtotal, impostos (se retornado pela API), total
- [ ] Confirmação antes de enviar
- [ ] Envio via POST para a API do Protheus
- [ ] Feedback de sucesso com número do pedido gerado

#### 4b — Consulta de Pedidos
- [ ] Listagem de pedidos do vendedor com filtros: data, status, cliente
- [ ] Card do pedido: número, cliente, data, valor total, status (badge colorido)
- [ ] Tela de detalhe: todos os itens, dados do pedido, status de aprovação

### Entregável
Fluxo completo de criação e consulta de pedidos funcionando.

### Prompt sugerido para Claude Code
```
Fase 4: Módulo de Pedidos de Venda.
Crie o fluxo de criação em src/screens/pedidos/ como um wizard de 4 etapas:
  1. Selecionar cliente
  2. Selecionar tabela de preço e transportadora
  3. Adicionar itens (produto + quantidade, preço auto-carregado)
  4. Revisão e confirmação
Validar com React Hook Form + Zod em cada etapa.
Ao selecionar produto + tabela, buscar automaticamente o preço via API.
Criar endpoint POST em src/api/endpoints/pedidos.ts.
Criar tela de listagem de pedidos com filtros.
Criar tela de detalhe do pedido.
Commit: "feat: pedidos de venda - criação e consulta"
```

---

## FASE 5 — Perfis de Acesso & Permissões
**Objetivo:** Cada perfil vê e acessa apenas o que tem permissão.

### Tarefas
- [ ] Middleware de rota: bloquear acesso a telas não permitidas por perfil
- [ ] Dashboard do Supervisor: dropdown de vendedor + comparativo de equipe
- [ ] Dashboard do Gerente: visão consolidada de todas as equipes
- [ ] Permissão de desconto: Vendedor (até X%), Supervisor (até Y%), Gerente (livre)
- [ ] Aprovação de pedidos: Supervisor pode aprovar/reprovar pedidos da equipe
- [ ] Configurações: trocar senha, configurar empresa/filial (para multi-empresa)

### Entregável
Sistema de permissões completo funcionando por perfil.

### Prompt sugerido para Claude Code
```
Fase 5: Perfis de acesso e permissões.
Criar hook usePermissions que lê o perfil do useAuthStore.
Criar componente ProtectedRoute que bloqueia telas por perfil.
Ajustar Dashboard para exibir visão da equipe para Supervisor e Gerente.
Adicionar lógica de desconto máximo por perfil no formulário de pedido.
Criar tela de aprovação de pedidos para Supervisor.
Commit: "feat: role-based access control and permissions"
```

---

## FASE 6 — Polimento, Testes & Deploy
**Objetivo:** App estável, testado e pronto para distribuição.

### Tarefas
- [ ] Testes unitários dos hooks principais (useAuthStore, usePedidos, useClientes)
- [ ] Testes de integração dos fluxos críticos (login, criar pedido)
- [ ] Tratamento de erros de rede (sem internet, timeout, API fora do ar)
- [ ] Tela de erro genérica com botão "Tentar novamente"
- [ ] Ajustes de performance: memoização de listas, lazy loading de telas
- [ ] Acessibilidade: labels para leitores de tela, tamanhos de toque adequados
- [ ] Ícone do app e splash screen personalizados
- [ ] Build de produção com EAS Build (Expo Application Services)
- [ ] Configurar OTA updates com EAS Update
- [ ] Documentação do README com instruções de instalação e configuração

### Entregável
App buildado e pronto para distribuição interna (TestFlight / Firebase App Distribution) ou publicação nas lojas.

### Prompt sugerido para Claude Code
```
Fase 6: Polimento e deploy.
Escrever testes Jest para useAuthStore e o fluxo de criação de pedido.
Implementar ErrorBoundary global com tela de fallback amigável.
Adicionar tratamento para estado offline com NetInfo.
Configurar eas.json para builds de desenvolvimento e produção.
Gerar ícones e splash screen com expo-image-picker.
Atualizar README com instruções completas.
Commit: "chore: tests, polish and production build config"
```

---

## Resumo de Dependências para Instalar

```bash
npx expo install \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack \
  @react-navigation/drawer \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-reanimated \
  zustand \
  @tanstack/react-query \
  axios \
  react-hook-form \
  @hookform/resolvers \
  zod \
  react-native-paper \
  react-native-vector-icons \
  victory-native \
  react-native-mmkv \
  expo-secure-store \
  date-fns \
  @react-native-community/netinfo \
  expo-updates
```

---

## Ordem de Execução Recomendada

```
[FASE 0] Setup          → 1-2h
[FASE 1] Auth/Nav       → 3-4h
[FASE 2] Dashboard      → 4-6h
[FASE 3] Cadastros      → 6-8h
[FASE 4] Pedidos        → 8-10h
[FASE 5] Permissões     → 3-4h
[FASE 6] Deploy         → 2-4h
─────────────────────────────
Total estimado:          27-38h de desenvolvimento com Claude Code
```

---

## Como Usar Este Plano com o Claude Code

1. Coloque o `CLAUDE.md` na raiz do projeto
2. Coloque este arquivo em `/plans/plano-geral.md`
3. Inicie cada fase com: `claude` → `/plan` → cole o prompt sugerido da fase
4. Aguarde o plano do Claude, revise, e diga `ok` para executar
5. Ao finalizar cada fase, verifique o resultado e faça o commit
6. Nunca pule fases — cada uma é fundação para a próxima
