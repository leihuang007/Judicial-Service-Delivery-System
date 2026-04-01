# Performance Baseline

## Scope

- Core API latency and throughput baseline for development environment.
- Focus endpoints: case/task create, channel dispatch, evidence create, orchestration evaluate.

## Environment

- CPU: local developer machine
- DB: PostgreSQL via Docker Compose
- Cache: Redis via Docker Compose
- Runtime: Java 21, Spring Boot 3.3.x

## Baseline Method

1. Start environment with `pnpm dev:up`.
2. Seed data via `pnpm e2e:smoke`.
3. Run repeated request loop against key endpoints.
4. Capture p50/p95 latency and success rate.

## Suggested Target (Dev)

- p95 latency under 500ms for read endpoints.
- p95 latency under 800ms for write endpoints.
- Error rate under 1% for smoke load.

## Next Optimization Checklist

- Add DB index review for heavy query paths.
- Add async channel dispatch queue.
- Add connection pool tuning in production profiles.
- Add distributed tracing with OpenTelemetry.
