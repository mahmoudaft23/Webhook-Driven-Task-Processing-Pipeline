
# 🚀 Webhook-Driven Task Processing Pipeline

![CI](https://github.com/mahmoudaft23/Webhook-Driven-Task-Processing-Pipeline/actions/workflows/ci.yml/badge.svg)

A webhook-driven background processing system built with **TypeScript**, **Express**, **PostgreSQL**, **Drizzle ORM**, **Docker Compose**, and **GitHub Actions**.

This project lets users create **processing pipelines** that receive incoming webhooks, transform the payload asynchronously, and deliver the processed result to one or more subscriber endpoints.

---

## ✨ Features

- 🔗 Create pipelines with unique webhook endpoints
- ⚙️ Process webhook payloads asynchronously in a worker service
- 📬 Deliver processed results to one or more subscriber URLs
- 🔁 Retry failed deliveries with retry logic
- 🗄️ Persist jobs, outputs, and delivery history in PostgreSQL
- 🧱 Structured architecture with API, worker, and database services, each running its own independent process
- 🧪 Test coverage with **Vitest** 
- 🤖 CI support with **GitHub Actions**
- 🐳 Easy local setup with **Docker Compose**

---

## 🧠 Overview

This project is a simplified **event-driven processing pipeline**.

Each pipeline connects three parts:

1. **Source** — a unique webhook path
2. **Processor** — logic that convert or process the incoming payload
3. **Subscribers** — one or more target URLs that receive the processed result

When a webhook is received, it is **not processed synchronously** during the request lifecycle.  
Instead, the payload is stored as a queued job in PostgreSQL, and a separate worker service processes dealing with it in background.

---



## 🧰 Tech Stack

- **Language:** TypeScript
- **Backend Framework:** Express
- **Database:** PostgreSQL
- **ORM / Schema Management:** Drizzle ORM
- **Containerization:** Docker + Docker Compose
- **Testing:** Vitest 
- **CI:** GitHub Actions

---

## 📁 Project Structure

```text
src/
  api/
    controllers/
    routes/
    app.ts
    server.ts

  shared/
    db/
    processors/
    repositories/
    services/
    types/
    validation/

  worker/
    worker.ts

  test/
    helper/
    integration/
    unit/

drizzle/
Dockerfile.api
Dockerfile.worker
docker-compose.yml
drizzle.config.ts

```
## 🚀 Getting Started

## Prerequisites
- Docker
- Docker Compose
- Node.js 20+

## 🐳 Run with Docker Compose
```bash
docker compose up --build
```

This starts:
- `api`
- `worker`
- `db`

## 🗃️ Database Migrations

Generate migrations:
```bash
npm run db:generate
```

Apply migrations:
```bash
npm run db:migrate
```

## 💻 Local Development

Run API:
```bash
npm run dev:api
```

Run Worker:
```bash
npm run dev:worker
```

Run type checking:
```bash
npm run typecheck
```

Run tests:
```bash
npm run test
```

Build project:
```bash
npm run build
```

## 🧩 Processor Types

The system currently supports the following processors:

- **`templateNarrator`** – Generates a text summary from structured input data.
- **`jsonTransform`** – Selects only configured fields from the incoming payload.
- **`bmiCalculator`** – Calculates BMI and returns the BMI category.
- **`healthyWeightRangeCalculator`** – Calculates the healthy minimum and maximum weight range based on height.
- **`stepsCaloriesEstimator`** – Estimates walking distance and calories burned from steps and optional weight.

## 📚 Documentation

Detailed documentation, design decisions, API examples, and deeper explanations are available in Notion:

> Notion Link: `https://www.notion.so/Webhook-Driven-Task-Processing-Pipeline-32598394c5588060bb48eb1b0ba8b723?source=copy_link`


## 🔍 Why This Project?

This project demonstrates practical backend engineering patterns such as:

- Asynchronous job processing
- Webhook ingestion
- Worker-based architecture
- Retryable delivery workflows
- PostgreSQL-backed queue persistence
- Modular TypeScript service design
- Containerized local development
- CI-ready project setup

It is a solid foundation for learning or extending into a more production-ready event processing platform.

## 🛣️ Future Improvements

Potential next steps for the project:

- Add authentication and authorization
- Support delayed jobs and scheduling
- Add rate limiting for subscriber delivery
- Support custom user-defined processors
- Add observability with logs, metrics, and tracing
- Improve worker concurrency and job locking strategy
- Webhook signature verification
- Pipeline chaining
- Dashboard UI
- Metrics
- Concurrency control
