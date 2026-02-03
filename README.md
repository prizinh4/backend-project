# Backend Project

API robusta e escalável com NestJS, PostgreSQL, Redis, Docker, NGINX, Prometheus e Grafana.

## Sumário
- [Descrição](#descrição)
- [Requisitos](#requisitos)
- [Como rodar (Docker)](#como-rodar-docker)
- [Como rodar (manual)](#como-rodar-manual)
- [Endpoints principais](#endpoints-principais)
- [Monitoramento](#monitoramento)
- [CI/CD](#cicd)
- [Contribuição](#contribuição)

---

## Descrição
Projeto backend com arquitetura moderna:
- NestJS (TypeScript)
- PostgreSQL 15
- Redis 7 (cache)
- NGINX (load balancer)
- Prometheus + Grafana (monitoramento)
- Docker Compose (orquestração)
- CI/CD com GitHub Actions

## Requisitos
- Docker e Docker Compose
- Node.js 20+ (apenas para rodar manualmente)

## Como rodar (Docker)
1. Clone o repositório
2. Execute:
   ```sh
   docker-compose up --build
   ```
3. Acesse:
   - API: http://localhost:8080
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (login: admin / senha: admin)

## Como rodar (manual)
1. Instale PostgreSQL e Redis localmente
2. Configure variáveis de ambiente conforme o docker-compose.yml
3. Instale dependências:
   ```sh
   npm install
   ```
4. Rode a aplicação:
   ```sh
   npm run start:dev
   ```

## Endpoints principais
- `GET /health` — Health check (DB, memória)
- `GET /users` — Lista usuários (com paginação e cache)
- `GET /metrics` — Métricas Prometheus

## Monitoramento
- **Prometheus** coleta métricas em `/metrics` de cada instância
- **Grafana** já configurado para visualizar métricas
- Métricas customizadas: requisições HTTP, latência, cache hits/misses

## CI/CD
- Pipeline GitHub Actions: build, lint, Docker build, deploy simulado
- A cada push/pull request na branch main

## Contribuição
1. Crie uma branch
2. Faça suas alterações
3. Commit e push
4. Abra um Pull Request

---

Dúvidas? Abra uma issue ou consulte os comentários no código!
