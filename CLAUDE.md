# CLAUDE.md

This file guides Claude Code (and any contributor) on the architectural rules
for this project. The entire point of this assignment is strict 3-tier layer
separation, so these rules override general instincts about "simpler" code
that would blur the boundaries.

## Stack

Node + Express + TypeScript. Storage is in-memory only — no database, no ORM,
no Docker.

## Layers

```
src/
  controllers/   HTTP layer
  services/      business logic layer
  repositories/  storage layer
  models/        shared types/entities
  routes/        Express route wiring
```

## Dependency direction

Dependencies point ONE direction only:

```
Controller -> Service -> Repository
```

A layer never imports the layer above it. Repositories never import
services or controllers. Services never import controllers.

## Controllers

- Parse the HTTP request (params, query, body).
- Call exactly one service method.
- Map the result or thrown error to an HTTP status code and response body.
- Zero business logic.
- Zero validation rules.
- Zero storage access (no importing or calling a repository directly).

## Services

- Contain all business rules and validation.
- Must contain NO reference to `req`, `res`, HTTP status codes, or Express
  types/imports of any kind.
- Throw domain errors (plain Error subclasses meaningful to the business
  domain, e.g. `TaskNotFoundError`), never HTTP errors and never status
  codes.
- Depend only on repository interfaces, not concrete implementations.

## Repositories

- Store and retrieve only.
- No validation, no business rules.
- Defined as an interface (the contract) with a separate implementation
  (e.g. an in-memory store).
- Implementations are injected into services via the constructor — never
  instantiated inside a service.

## Summary rule of thumb

If you're unsure which layer code belongs in, ask:

- Does it touch `req`/`res`/status codes? -> Controller.
- Does it decide whether something is allowed, valid, or what happens next? -> Service.
- Does it just read/write data in memory? -> Repository.
