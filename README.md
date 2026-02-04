# Backend Project

API robusta e escalável com NestJS, PostgreSQL (Master-Slave), Redis Cache, Load Balancer e Monitoramento.

## 🚀 Funcionalidades

- ✅ **Camada de Infraestrutura** - Cache Redis centralizado no módulo `infra`
- ✅ **Cache Inteligente** - Redis armazena dados específicos (queries paginadas) com TTL de 5 minutos
- ✅ **Paginação Completa** - API com `page`, `limit`, `total` e `last_page`
- ✅ **Alta Disponibilidade** - 2 instâncias da aplicação + Load Balancer Nginx (least_conn)
- ✅ **Redundância de Dados** - PostgreSQL com replicação Master-Slave (streaming WAL)
- ✅ **Monitoramento** - Prometheus + Grafana com métricas customizadas
- ✅ **CI/CD** - Pipeline completo com GitHub Actions

## 📋 Requisitos

- **Docker** e **Docker Compose** (recomendado)
- **Node.js 20+** e **npm** (apenas para desenvolvimento local sem Docker)
- **Git** para clonar o repositório

## 🐳 Como Rodar com Docker (Recomendado)

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd backend-project
```

### 2. Inicie todos os serviços
```bash
docker-compose up -d
```

Aguarde ~15-20 segundos para todos os serviços iniciarem. O comando `-d` roda em background.

### 3. Acesse os serviços

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API** | http://localhost:8080 | Endpoint principal (via Nginx) |
| **Prometheus** | http://localhost:9090 | Métricas do sistema |
| **Grafana** | http://localhost:3001 | Dashboards (login: `admin` / senha: `admin`) |

### 4. Teste a API
```bash
# Health check
curl http://localhost:8080/health

# Listar usuários (paginado e com cache)
curl http://localhost:8080/users?page=1&limit=5

# Ver métricas Prometheus
curl http://localhost:8080/metrics
```

### 5. Parar os serviços
```bash
# Parar mantendo dados
docker-compose down

# Parar e remover volumes (dados serão perdidos)
docker-compose down -v
```

## 🛠️ Como Rodar Manualmente (Desenvolvimento)

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure PostgreSQL e Redis

Instale localmente ou use Docker:
```bash
# PostgreSQL
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15

# Redis
docker run -d --name redis -p 6379:6379 redis:7
```

### 3. Configure variáveis de ambiente

Crie um arquivo `.env`:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=backend_project
REDIS_HOST=localhost
```

### 4. Inicie a aplicação
```bash
# Modo desenvolvimento (hot reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

Acesse: http://localhost:3000

## 📦 Arquitetura do Sistema

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  NGINX Load Balancer :8080  │  ← Distribui requisições
│    (algoritmo: least_conn)  │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐    ┌────────┐
│  app1  │    │  app2  │          ← 2 instâncias NestJS
└───┬────┘    └───┬────┘
    │             │
    └──────┬──────┘
           │
    ┌──────┴──────────┐
    ▼                 ▼
┌─────────┐     ┌──────────────┐
│  Redis  │     │  PostgreSQL  │
│ :6379   │     │              │
└─────────┘     │  Master      │  ← Escritas (INSERT/UPDATE/DELETE)
                │  :5432       │
                └──────┬───────┘
                       │
                       │ WAL Streaming Replication
                       ▼
                ┌──────────────┐
                │  PostgreSQL  │
                │  Replica     │  ← Leituras (SELECT)
                │  :5432       │
                └──────────────┘
```

### 🔄 Fluxo de uma Requisição

1. **Cliente** faz `GET /users?page=1&limit=5`
2. **Nginx** escolhe entre app1 ou app2 (menor carga)
3. **App** verifica cache no **Redis**
   - ✅ **Cache HIT**: retorna imediatamente (~5ms)
   - ❌ **Cache MISS**: consulta banco ⬇️
4. **App** cria QueryRunner para o **Slave (Réplica)**
5. **Réplica PostgreSQL** executa SELECT e retorna dados
6. **App** salva no **Redis** (TTL 300s) e retorna resposta
7. Próxima requisição idêntica usa o cache!

### 📂 Estrutura do Código

```
src/
├── infra/
│   └── cache.module.ts          # Configuração centralizada do Redis
├── users/
│   ├── users.controller.ts      # Endpoints HTTP
│   ├── users.service.ts         # Lógica de negócio + cache + réplica
│   ├── users.service.spec.ts    # Testes unitários
│   ├── user.entity.ts           # Modelo TypeORM
│   └── dto/
│       └── pagination-query.dto.ts
├── health/
│   ├── health.controller.ts     # Health check endpoint
│   └── health.module.ts
├── metrics/
│   ├── metrics.controller.ts    # Endpoint /metrics
│   ├── prometheus.ts            # Métricas customizadas
│   └── metrics.module.ts
├── app.module.ts                # Módulo raiz
├── main.ts                      # Bootstrap da aplicação
└── ormconfig.ts                 # Configuração TypeORM com replicação
```

## 🔌 Endpoints da API

### Usuários
```http
GET /users?page=1&limit=10
```
**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com"
    }
  ],
  "total": 1,
  "page": 1,
  "last_page": 1
}
```

**Query Parameters:**
- `page` (opcional, default: 1) - Número da página
- `limit` (opcional, default: 10) - Itens por página

### Health Check
```http
GET /health
```
**Resposta:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  },
  "error": {},
  "details": { ... }
}
```

### Métricas
```http
GET /metrics
```
Retorna métricas no formato Prometheus, incluindo:
- `http_requests_total` - Total de requisições HTTP
- `cache_hits_total` - Cache hits do Redis
- `cache_misses_total` - Cache misses do Redis

## 📊 Monitoramento

### Prometheus (http://localhost:9090)
- Coleta métricas de ambas instâncias (app1 + app2)
- Queries úteis:
  - `rate(http_requests_total[1m])` - Taxa de requisições/segundo
  - `cache_hits_total / (cache_hits_total + cache_misses_total)` - Taxa de cache hit

### Grafana (http://localhost:3001)
- **Login:** `admin` / **Senha:** `admin`
- Datasource Prometheus já configurado
- Crie dashboards customizados

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes com coverage
npm run test:cov

# Testes em modo watch
npm run test:watch
```

## 🔧 Scripts Disponíveis

```bash
npm run start          # Inicia em produção
npm run start:dev      # Inicia com hot reload
npm run start:prod     # Inicia otimizado para produção
npm run build          # Compila TypeScript
npm run test           # Executa testes
npm run test:cov       # Testes com cobertura
npm run lint           # Verifica código com ESLint
```

## 🚢 CI/CD

Pipeline GitHub Actions configurado (`.github/workflows/ci-cd.yml`):

- ✅ **Build** - Compila o código TypeScript
- ✅ **Lint** - Verifica padrões de código
- ✅ **Test** - Executa testes unitários
- ✅ **Docker Build** - Constrói imagem Docker
- ✅ **Deploy Simulado** - Valida que a build funciona

Executado automaticamente a cada push ou pull request na branch `main`.

## 📝 Notas Técnicas

### Replicação PostgreSQL
- Utiliza **streaming replication** via WAL (Write-Ahead Log)
- Réplica em modo **hot standby** (read-only)
- Queries de leitura usam `createQueryRunner('slave')` para rotear para a réplica
- Sincronização automática e contínua

### Cache Redis
- TTL padrão: **300 segundos** (5 minutos)
- Cache por página: chave formato `users_page_1_limit_10`
- Métricas de hits/misses expostas no `/metrics`

### Load Balancer Nginx
- Algoritmo: **least_conn** (envia para instância com menos conexões)
- Health check automático das instâncias
- Timeout configurado para 60s

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

**Desenvolvido com NestJS e TypeScript**
