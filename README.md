# DevOpsLab

DevOpsLab is a small order API that we will evolve through a complete DevOps pipeline:

`Application -> Git -> CI -> Docker -> Registry -> Cloud -> Terraform -> Kubernetes -> Observability -> Incident response`

## Current milestone: Module 0 / application foundation

The API currently provides:

- `GET /health` for service health checks
- `GET /api/orders` for listing orders
- `POST /api/orders` for creating an order

The `DATABASE_AVAILABLE=false` environment variable simulates a database outage. This gives us a controlled incident scenario for learning systematic troubleshooting.

## Run locally

Requires Node.js 20 or newer.

```sh
npm test
npm start
```

In another terminal:

```sh
./scripts/check-health.sh
curl http://localhost:3000/api/orders
curl -X POST http://localhost:3000/api/orders \\
  -H 'Content-Type: application/json' \\
  -d '{"product":"keyboard","quantity":2}'
```

## Run with Docker Compose

```sh
docker compose up --build
```

The first CI workflow runs the tests and verifies that the container image can be built.

## Learning path

Each stage will be added only after the current stage is understood and tested:

1. Linux, Bash and Git foundations
2. Application tests and CI quality gates
3. Docker image design and Compose dependencies
4. Cloud deployment and Terraform-managed infrastructure
5. Kubernetes deployment, scaling and rollback
6. Metrics, logs, alerts and incident response
7. Security checks and final production-like exercise
