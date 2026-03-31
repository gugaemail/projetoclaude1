# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run tests
npx jest

# Run a single test file
npx jest src/path/to/file.test.ts

# Run tests in watch mode
npx jest --watch

# Lint
npx eslint src --ext .ts,.tsx

# Type check
npx tsc --noEmit

# Build for production (EAS)
eas build --platform all --profile production

# OTA update
eas update --branch production
```

## Visão do Projeto — ProtheusApp
Aplicativo mobile comercial para integração com o sistema de gestão **Protheus (TOTVS)**, voltado para equipes de vendas. Permite que vendedores acompanhem seu desempenho em tempo real e realizem pedidos de venda diretamente pelo celular, com todos os dados sincronizados via API REST do Protheus.

## Stack Tecnológica

```
Framework:     React Native 0.76+ com Expo SDK 52+
Linguagem:     TypeScript (strict mode obrigatório)
Navegação:     React Navigation v7 (stack + bottom tabs + drawer)
Estado Global: Zustand (client state) + TanStack Query v5 (server state / cache)
HTTP Client:   Axios com interceptors para auth e refresh token
Formulários:   React Hook Form + Zod (validação)
UI Components: React Native Paper (Material Design 3)
Ícones:        react-native-vector-icons (MaterialCommunityIcons)
Gráficos:      Victory Native XL
Armazenamento: MMKV (dados locais rápidos) + SecureStore (tokens)
Datas:         date-fns
Testes:        Jest + React Native Testing Library
```

## Integração com Protheus

- **Base URL:** configurável via variável de ambiente (`EXPO_PUBLIC_API_URL`)
- **Autenticação:** Bearer Token (login via endpoint REST do Protheus)
- **Padrão de endpoints:** seguir convenção TOTVS REST API v2
- **Timeout:** 30 segundos por requisição
- **Retry:** 3 tentativas automáticas em erros 5xx
- **Offline:** cachear últimos dados consultados com TanStack Query (staleTime: 5min)

### Endpoints principais esperados
```
POST   /api/oauth2/v1/token           → Login / refresh token
GET    /api/faturamento/v1/clientes   → Listagem de clientes
GET    /api/faturamento/v1/produtos   → Produtos com saldo de estoque
GET    /api/faturamento/v1/tabelas    → Tabelas de preço
GET    /api/faturamento/v1/transportadoras → Transportadoras
GET    /api/faturamento/v1/pedidos    → Consulta pedidos de venda
POST   /api/faturamento/v1/pedidos    → Inclusão de pedido de venda
GET    /api/faturamento/v1/vendedores/{id}/dashboard → KPIs do vendedor
```

## Perfis de Acesso

| Perfil      | Permissões                                                      |
|-------------|------------------------------------------------------------------|
| Vendedor    | Ver próprio dashboard, incluir pedidos, consultar cadastros      |
| Supervisor  | Ver dashboard da equipe, aprovar pedidos, relatórios por vendedor|
| Gerente     | Visão completa, todos os dashboards, configurações               |

- Controle de acesso via roles retornadas no token JWT do Protheus
- Menus e rotas condicionais por perfil
- Nunca expor rotas não autorizadas no frontend

## Arquitetura de Pastas

```
src/
├── api/                    # Configuração Axios, interceptors, endpoints
│   ├── client.ts
│   └── endpoints/
│       ├── auth.ts
│       ├── clientes.ts
│       ├── produtos.ts
│       ├── pedidos.ts
│       └── dashboard.ts
├── components/             # Componentes reutilizáveis
│   ├── common/             # Botões, inputs, cards, loaders
│   └── domain/             # Componentes específicos do negócio
├── screens/                # Telas organizadas por módulo
│   ├── auth/
│   ├── dashboard/
│   ├── pedidos/
│   ├── clientes/
│   ├── produtos/
│   └── configuracoes/
├── navigation/             # Stack, Tab e Drawer navigators
├── store/                  # Zustand stores (auth, preferências)
├── hooks/                  # Custom hooks (useClientes, usePedidos, etc.)
├── types/                  # Interfaces TypeScript (DTOs do Protheus)
├── utils/                  # Formatadores, validadores, helpers
├── constants/              # Cores, tamanhos, strings
└── theme/                  # Tema global (Material Design 3)
```

## Padrões de Código

- **Apenas componentes funcionais** — zero class components
- **TypeScript strict** — sem `any` explícito, sem `ts-ignore`
- **Nomes em inglês** no código, comentários e commits podem ser em português
- **Estilização:** `StyleSheet.create()` — sem inline styles, sem Tailwind
- **Sem lógica nos componentes de tela** — extrair para custom hooks
- **Erros de API:** sempre tratar e exibir mensagem amigável ao usuário
- **Loading states:** toda requisição deve ter estado de carregamento visível
- **Commits:** usar Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)

## Variáveis de Ambiente

```env
EXPO_PUBLIC_API_URL=https://seu-servidor-protheus.com
EXPO_PUBLIC_API_VERSION=v2
EXPO_PUBLIC_COMPANY=01        # Empresa Protheus
EXPO_PUBLIC_BRANCH=01         # Filial Protheus
```

## Regras Importantes

1. **NUNCA** salvar token de acesso em AsyncStorage — usar SecureStore
2. **SEMPRE** validar dados do formulário antes de enviar para a API
3. **SEMPRE** criar plano de implementação em `/plans` antes de codar uma feature
4. **SEMPRE** commitar ao final de cada fase com mensagem descritiva
5. **NUNCA** hardcodar URLs, credenciais ou configurações de ambiente
6. Respeitar o **código da empresa e filial** do Protheus em todas as requisições
7. Campos obrigatórios do pedido de venda: cliente, tabela de preço, itens (produto + quantidade + preço), transportadora
8. **SEMPRE** fazer commit e push para o GitHub ao final de qualquer alteração no projeto, usando Conventional Commits