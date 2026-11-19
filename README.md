# IntelliDesk — Enterprise AI-Powered IT Support Platform

IntelliDesk is an enterprise-grade IT Service Management (ITSM) and intelligent troubleshooting platform combining Java 21, Spring Boot 3, React 18, PostgreSQL with pgvector, and Generative AI (Spring AI / FastAPI).

---

## Project Structure

```
IntelliDesk/
├── backend/                       # Spring Boot 3 Java 21 Application
│   ├── pom.xml
│   └── src/main/java/com/intellidesk/
├── frontend/                      # React 18 + Vite + Tailwind CSS Single Page App
│   ├── package.json
│   └── src/
├── ai-service/                    # Python 3.12 FastAPI microservice (Optional/Sidecar)
│   ├── requirements.txt
│   └── app/
├── database/                      # SQL scripts for PostgreSQL with pgvector
│   └── scripts/
│       ├── 01_init_schema.sql     # 15 relational tables & HNSW vector index
│       └── 02_seed_data.sql       # Default roles, categories & test users
├── documents/                     # Company SOPs & knowledge base documents
│   └── sample-knowledge-base/
├── docker-compose.yml             # PostgreSQL 16 (pgvector) & Redis
└── README.md
```

---

## Quick Start: Database Infrastructure

Run PostgreSQL with pgvector and Redis using Docker Compose:

```bash
docker compose up -d
```

- **PostgreSQL**: `localhost:5432` (Database: `intellidesk_db`, User: `postgres`, Password: `postgrespassword`)
- **Redis**: `localhost:6379`
