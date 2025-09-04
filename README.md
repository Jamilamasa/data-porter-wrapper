# Data Porter Wrapper

A thin Node.js (NestJS + TypeScript) wrapper around the [Data Porter](https://github.com/noibilism/data-export-service) API.  
This service provides a simplified interface for requesting exports, tracking job status, and streaming CSV files without buffering large data in memory.  

It exists to give product teams and frontends a clean, production-ready API layer over Data Porter.

---

## 🚀 Setup

### 1. Clone & install
```bash
git https://github.com/Jamilamasa/data-porter-wrapper.git
cd data-porter-wrapper
npm install
```

### 2. Environment variables

Copy `.env.example` → `.env` and adjust values:

| Variable               | Description                               | Example                          |
|-------------------------|-------------------------------------------|----------------------------------|
| `DATA_PORTER_BASE_URL` | Base URL of Data Porter API               | `http://host.docker.internal:5001` |
| `DATA_PORTER_JWT`      | Data Porter API key (JWT)                 | `sk_test_123456`                 |
| `HTTP_TIMEOUT_MS`      | HTTP timeout for axios calls              | `15000`                          |

### 3. Run locally with Docker
```bash
docker-compose up --build
```

The wrapper will be available at:  
👉 `http://localhost:3000`

---

## 📡 API Endpoints

### 1. Create report
```bash
curl -X POST http://localhost:3000/report   -H "Content-Type: application/json"   -d '{
    "table_name": "transactions",
    "date_from": "2025-01-01",
    "date_to": "2025-01-31",
    "force_refresh": false
  }'
```

✅ Response
```json
{
  "reference_id": "abc-123",
  "status": "PENDING"
}
```

---

### 2. Get report status
```bash
curl http://localhost:3000/report/abc-123
```

✅ Example response
```json
{
  "reference_id": "abc-123",
  "status": "COMPLETED",
  "file_url": "https://presigned-s3-url.com/file.csv"
}
```

---

### 3. Download CSV
```bash
curl -L http://localhost:3000/report/abc-123/download -o jan.csv
```

- If **COMPLETED** → streams CSV directly to `jan.csv`.  
- If **PENDING** or **SUPERSEDED** → returns `409 { "status": "PENDING" }`.  
- If **FAILED** → returns `409 { "status": "FAILED", "error_message": "..." }`.

---

## ⚠️ Error Handling

- **400** → invalid/missing input (e.g., malformed date).  
- **401** → missing/invalid Data Porter credentials.  
- **409** → download attempted while export is not `COMPLETED`.  
- **502/504** → upstream Data Porter errors or timeouts.  

All errors return JSON of the form:
```json
{ "code": 409, "message": "PENDING" }
```

---

## 🧪 Tests

Unit and E2E tests are written in Jest.  
Run locally:

```bash
npm run test
```