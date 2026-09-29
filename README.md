# T2T Architecture — Task Management API

## 1. Overview

A REST API for managing tasks, built to demonstrate strict three-tier
layer separation (controller, service, repository) in a Node/Express/
TypeScript backend. Tasks are held in memory for the lifetime of the
process; there is no database or persistence layer. The focus of this
project is architectural structure, not feature breadth.

## 2. Tech stack

- Node.js
- Express 5
- TypeScript (strict mode)
- tsx (dev-time TypeScript execution and watch mode)
- In-memory storage (`Map`), no database, no ORM, no Docker

## 3. Setup and run

Install dependencies:

```
npm install
```

Run in development (auto-restarts on file changes):

```
npm run dev
```

Build to `dist/`:

```
npm run build
```

Run the compiled build:

```
npm start
```

The server listens on `PORT` if set, otherwise on port `3000`.

## 4. API endpoints

| Method | Path              | Description         | Success status |
|--------|-------------------|----------------------|-----------------|
| GET    | /api/tasks        | List all tasks       | 200             |
| GET    | /api/tasks/:id    | Get one task by id   | 200             |
| POST   | /api/tasks        | Create a task        | 201             |
| PUT    | /api/tasks/:id    | Update a task        | 200             |
| DELETE | /api/tasks/:id    | Delete a task        | 204             |

Error responses: `400` for invalid input (missing/oversized title,
invalid status), `404` for a task id that doesn't exist, `500` for
anything unexpected.

### Create a task

```
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write report","description":"Q3 summary"}'
```

Response (`201`):

```json
{
  "id": "7787fc87-c6c8-4187-b2ac-448a8dda122c",
  "title": "Write report",
  "description": "Q3 summary",
  "status": "pending",
  "createdAt": "2026-09-29T14:33:33.830Z",
  "updatedAt": "2026-09-29T14:33:33.830Z"
}
```

### Update a task

```
curl -X PUT http://localhost:3000/api/tasks/7787fc87-c6c8-4187-b2ac-448a8dda122c \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'
```

Response (`200`):

```json
{
  "id": "7787fc87-c6c8-4187-b2ac-448a8dda122c",
  "title": "Write report",
  "description": "Q3 summary",
  "status": "in-progress",
  "createdAt": "2026-09-29T14:33:33.830Z",
  "updatedAt": "2026-09-29T14:33:40.273Z"
}
```

## 5. Architecture

```
src/
  app.ts            composition root: builds the dependency graph, mounts routes
  server.ts         starts the HTTP server on PORT
  controllers/
    TaskController.ts
  services/
    TaskService.ts
  repositories/
    TaskRepository.ts          (interface)
    InMemoryTaskRepository.ts  (implementation)
  models/
    Task.ts           shared Task / TaskStatus types
    errors.ts          domain error classes
  routes/
    taskRoutes.ts     Express router wiring
```

**Controllers** parse the HTTP request, call exactly one service
method, and map the result or thrown error to an HTTP status code and
response body. They contain no business logic, no validation rules,
and never access a repository directly.

**Services** hold all business rules and validation — required
fields, allowed values, id/timestamp generation. They depend only on
the `TaskRepository` interface, never on a concrete implementation,
and never reference `req`, `res`, Express, or HTTP status codes. On
failure they throw domain errors (`ValidationError`,
`TaskNotFoundError`), not HTTP errors.

**Repositories** store and retrieve data only. They contain no
validation and no business rules, and never throw domain errors —
a missing task is reported as `undefined` or `false`, and the caller
(the service) decides what that means.

**Models** are shared data contracts (the `Task` shape, `TaskStatus`,
and the domain error classes) with no logic, importable by any layer.

**Routes** wire HTTP methods and paths to controller handlers. They
contain no logic of their own beyond that wiring.

### How layer separation is maintained

Dependencies point one direction only: controller → service →
repository. A layer never imports from the layer above it — a
repository cannot import a service, and a service cannot import a
controller. This is enforced by convention and checked by review, not
by a build tool, but the codebase has been audited against it.

The repository is defined as an interface (`TaskRepository`) with a
separate implementation (`InMemoryTaskRepository`) injected into the
service through its constructor. The service is written against the
interface, so it has no knowledge of how or where data is actually
stored.

The service throws domain errors instead of HTTP errors because the
service layer has no concept of HTTP — it is business logic that
could in principle run behind a CLI, a message queue, or a different
web framework. Translating a domain error into a status code is the
controller's job, and only the controller's job; that translation is
centralized in one place (`TaskController`'s error mapping) rather
than scattered across the codebase.

Swapping the in-memory store for PostgreSQL would mean writing a new
class that implements `TaskRepository` (e.g. `PostgresTaskRepository`)
and changing the single line in `app.ts` that constructs the
repository. No other file names `InMemoryTaskRepository`, so no
controller, service, or route would need to change.
