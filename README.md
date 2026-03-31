# Judicial Service Delivery System Monorepo

This repository contains a cloud-neutral scaffold for a judicial delivery system.

## Repository layout

- `apps/web-portal`: Next.js frontend with modern UI and i18n (`zh-CN`, `en-US`)
- `apps/server`: Spring Boot backend scaffold (Java 21)
- `packages/contracts`: Shared domain contracts and enums draft
- `infra/docker`: Local dependency stack using Docker Compose
- `docs`: Architecture and delivery notes

## Quick start

### 1) Prerequisites

- Node.js 20+
- pnpm 9+
- JDK 21
- Maven 3.9+
- Docker + Docker Compose

### 2) Install frontend dependencies

From repository root:

```powershell
pnpm install
```

### 3) Start local infrastructure

```powershell
docker compose -f infra/docker/docker-compose.yml up -d
```

### 4) Run backend

```powershell
cd apps/server
mvn spring-boot:run
```

### 5) Run frontend

```powershell
cd apps/web-portal
pnpm dev
```

Open `http://localhost:3000`.

## Language support

- Chinese (Simplified): `zh-CN`
- English (US): `en-US`

## Notes

- This scaffold avoids vendor-specific cloud services.
- All infrastructure components can run on any public cloud or private Kubernetes cluster.
