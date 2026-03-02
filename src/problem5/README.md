# Problem 5: A Crude Server 🔔

A production-grade **CRUD REST API** built with **Express.js + TypeScript**, using **Prisma ORM** with **SQLite** for data persistence.

## Tech Stack

| Concern    | Technology                       |
| ---------- | -------------------------------- |
| Runtime    | Node.js 18+                      |
| Language   | TypeScript 5 (strict mode)       |
| Framework  | Express.js 4                     |
| Database   | SQLite (via Prisma ORM)          |
| Validation | Zod                              |
| Logging    | Pino                             |
| Security   | Helmet, CORS, express-rate-limit |

## Architecture

```
src/
├── types/            # Shared DTO contracts (no any)
├── errors/           # AppError custom class
├── utils/            # Logger (pino), Response helpers
├── database/         # Prisma schema, client singleton, seed
├── validators/       # Zod schemas for all endpoints
├── middlewares/      # requestId, validate, error handler
├── repositories/     # Data Access Layer (Prisma only)
├── services/         # Business Logic (HTTP-context free)
├── controllers/      # HTTP I/O only (req/res)
├── routes/           # Route definitions + middleware binding
├── app.ts            # Express app factory
└── server.ts         # HTTP server + graceful shutdown
```

**Request lifecycle:**

```
HTTP Request
  → Helmet / CORS / Rate Limiter
  → requestId middleware
  → Route matched
  → Zod validate() middleware
  → Controller (reads req, calls Service, writes res)
  → Service (business rules, calls Repository)
  → Repository (Prisma queries)
  → Global Error Middleware (catches all errors)
```

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

## Setup & Run

### 1. Install dependencies

```bash
cd src/problem5
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env as needed (default values work for local dev with SQLite)
```

### 3. Create database & run migrations

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Create SQLite DB + run migrations
```

### 4. (Optional) Seed sample data

```bash
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

Server starts at: **http://localhost:3000**

### 6. Build for production

```bash
npm run build
npm start
```

---

## API Reference

**Base URL:** `http://localhost:3000/api`

**Standard Response Envelope:**

```json
{
  "status": "success" | "error",
  "data": { ... },
  "message": "Human-readable message"
}
```

---

### Health Check

```
GET /health
```

**Response:**

```json
{ "status": "ok", "timestamp": "2026-03-01T07:48:00.000Z" }
```

---

### Create a Resource

```
POST /api/resources
Content-Type: application/json
```

**Body:**

```json
{
  "name": "My Resource",
  "description": "Optional description",
  "status": "active"
}
```

| Field         | Type   | Required               | Values                               |
| ------------- | ------ | ---------------------- | ------------------------------------ |
| `name`        | string | ✅                     | 1–255 chars                          |
| `description` | string | ❌                     | up to 2000 chars                     |
| `status`      | string | ❌ (default: `active`) | `active` \| `inactive` \| `archived` |

**Response `201`:**

```json
{
  "status": "success",
  "data": {
    "id": "cm7abc123",
    "name": "My Resource",
    "description": "Optional description",
    "status": "active",
    "createdAt": "2026-03-01T07:48:00.000Z",
    "updatedAt": "2026-03-01T07:48:00.000Z"
  },
  "message": "Resource created successfully"
}
```

---

### List Resources

```
GET /api/resources
```

**Query Parameters:**

| Param    | Type   | Default         | Description                                    |
| -------- | ------ | --------------- | ---------------------------------------------- |
| `page`   | number | `1`             | Page number                                    |
| `limit`  | number | `20` (max: 100) | Items per page                                 |
| `status` | string | —               | Filter by `active` \| `inactive` \| `archived` |
| `name`   | string | —               | Case-sensitive partial match                   |

**Example:**

```
GET /api/resources?status=active&name=auth&page=1&limit=10
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "data": [...],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "message": "Resources retrieved successfully"
}
```

---

### Get Resource by ID

```
GET /api/resources/:id
```

**Response `200`:** Single resource object (same shape as Create response).

**Response `404`:**

```json
{
  "status": "error",
  "message": "Resource with id 'xyz' was not found."
}
```

---

### Update a Resource

```
PUT /api/resources/:id
Content-Type: application/json
```

**Body** (all fields optional, at least one required):

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "inactive"
}
```

**Response `200`:** Updated resource object.

---

### Delete a Resource

```
DELETE /api/resources/:id
```

**Response `204`:** No content.

**Response `404`:** Resource not found.

---

## Error Responses

| Status | Scenario                                             |
| ------ | ---------------------------------------------------- |
| `400`  | Validation failed (check `errors` field for details) |
| `404`  | Resource not found                                   |
| `429`  | Too many requests (rate limit exceeded)              |
| `500`  | Internal server error                                |

**Validation Error `400`:**

```json
{
  "status": "error",
  "message": "Validation failed. Please check your input.",
  "errors": {
    "name": ["name must not be empty"],
    "status": [
      "Invalid enum value. Expected 'active' | 'inactive' | 'archived'"
    ]
  }
}
```

---

## curl Examples

```bash
# Create
curl -s -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Auth Service","description":"JWT auth","status":"active"}' | jq

# List with filters
curl -s "http://localhost:3000/api/resources?status=active&page=1&limit=5" | jq

# Get by ID
curl -s http://localhost:3000/api/resources/REPLACE_WITH_ID | jq

# Update
curl -s -X PUT http://localhost:3000/api/resources/REPLACE_WITH_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}' | jq

# Delete
curl -s -X DELETE http://localhost:3000/api/resources/REPLACE_WITH_ID -v
```

---

## Security Measures

- **Helmet** — Sets secure HTTP headers
- **CORS** — Allow-list origin validation
- **Rate Limiting** — 100 req / 15 min per IP
- **Zod Validation** — All inputs validated at middleware layer
- **Error Masking** — Stack traces never exposed in production
- **Parameterized Queries** — Prisma ORM prevents SQL injection

## Available Scripts

| Script                    | Description                      |
| ------------------------- | -------------------------------- |
| `npm run dev`             | Start dev server with hot-reload |
| `npm run build`           | Compile TypeScript to `dist/`    |
| `npm start`               | Run compiled production server   |
| `npm run db:generate`     | Generate Prisma client           |
| `npm run db:migrate`      | Run DB migrations                |
| `npm run db:migrate:prod` | Deploy migrations (production)   |
| `npm run db:studio`       | Open Prisma Studio (DB GUI)      |
| `npm run db:seed`         | Seed sample data                 |

---

## Testing

The project includes a full test suite built with **Jest + ts-jest + Supertest**. No database connection is required — all tests use in-memory mocks.

### Run tests

```bash
npm test              # Run all tests + coverage report
npm run test:coverage # Run tests with detailed coverage
npm run test:watch    # Watch mode (re-runs on file save)
```

### Test structure

Unit tests are **co-located** next to the source files they test. Integration tests live in a dedicated `tests/` folder at project root.

```
src/
├── errors/
│   ├── AppError.ts
│   └── AppError.test.ts            ← unit test, import: ./AppError
├── utils/
│   ├── response.helper.ts
│   └── response.helper.test.ts     ← unit test
├── validators/
│   ├── resource.validator.ts
│   └── resource.validator.test.ts  ← unit test
└── services/
    ├── resource.service.ts
    └── resource.service.test.ts    ← unit test (mocked repo)

tests/
└── integration/
    └── resource.routes.test.ts     ← supertest, Prisma mocked
```

### Coverage

| Area       | Coverage |
| ---------- | -------- |
| Statements | ~96%     |
| Validators | 100%     |
| Services   | 100%     |
| Routes     | 100%     |
| Errors     | 100%     |
