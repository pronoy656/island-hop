# AGENTS.md - Island Hop System Architecture & AI Guidelines

> **CRITICAL DIRECTIVE FOR ALL AI AGENTS**:
> Never guess or assume whether backend APIs, database models, or integration points exist.
> This repository uses a **Deterministic Script + AI Audit Engine** that provides 100% accurate, zero-assumption verification in **< 10 seconds**.

---

## 1. Quick Verification: The 8-Second System Audit Engine

Before investigating files one-by-one or answering whether an API or feature is ready, **run the automated audit engine** or read its generated report:

```bash
# From Backend/cpbryn:
npm run audit

# Or from Frontend/island-hop:
powershell -Command "cd '..\..\Backend\cpbryn'; npm run audit"
```

### What `npm run audit` Does Deterministically (Zero Assumptions):
1. **Route & Endpoint Introspection**: Scans all 19 Express route modules in `src/app/modules/`, extracts all 121 HTTP endpoints (Customer, Operator, Admin, Shared), and documents methods and source files.
2. **PostgreSQL / Prisma Invariant Check**: Connects directly to the database via Prisma and confirms master entities: Ports (14), Operators (6), Ferries (12), Routes (37), Bookable Trips (680+), and active Bookings/Tickets.
3. **Automated Vitest Suite**: Runs all 23 test suites (**284 tests**) in silent test mode and ensures 100% pass rate.
4. **Live E2E Verification**: Executes `scripts/verify-e2e-flow.js` on port 5003 verifying:
   `Search -> Booking -> Seat Decrement -> Digital QR Pass -> Self-Service Portal -> Cancellation -> Seat Restoration`.
5. **Machine-Readable Report**: Automatically updates `Backend/cpbryn/docs/LATEST-AUDIT-REPORT.json`.

---

## 2. Instant Ground Truth: `docs/LATEST-AUDIT-REPORT.json`

AI agents should check [`Backend/cpbryn/docs/LATEST-AUDIT-REPORT.json`](file:///c:/Users/Khaled/Khaled%20Dask/Backend/cpbryn/docs/LATEST-AUDIT-REPORT.json) for instantaneous facts:
- **`summary.routesCount`**: Total endpoints registered in the Express app.
- **`summary.testSuitePassed`**: `true` if all unit/integration tests pass.
- **`summary.databaseReady`**: `true` if master ports, ferries, routes, and schedules are seeded.
- **`summary.e2eFlowVerified`**: `true` if real HTTP transactions succeed end-to-end.
- **`endpoints`**: Categorized arrays (`customer`, `operator`, `admin`, `shared`) containing `{ method, path, file }`.

---

## 3. Key Architectural Rules & Route Mounting

1. **Base URL**:
   - Backend runs on `http://localhost:5003/api/v1`
   - Frontend runs on `http://localhost:3000`
2. **Canonical Route Mounting**:
   - Ferry Routes are mounted at `/api/v1/routes` (Public / Operator / Admin).
   - **Do NOT mount routes at `/api/v1/operator/routes`**: In `src/app/modules/operator/__tests__/operator.e2e.spec.ts`, there is an explicit regression test asserting that `/api/v1/operator/routes` is **NOT** mounted, because canonical `/api/v1/routes` is used across all roles.
3. **Operator Sub-routes**:
   - Operator Overview: `GET /api/v1/operator/overview`
   - Operator Ferries: `GET|POST|PATCH|DELETE /api/v1/operator/ferries` (forwards to Ferry module)
   - Operator Schedules: `GET|POST|PATCH|DELETE /api/v1/operator/schedules`
   - Operator Bookings: `GET /api/v1/operator/bookings`
   - Passenger Manifest: `GET /api/v1/operator/manifest/:scheduleId`
   - Operator Settings: `GET|PATCH /api/v1/operator/settings`
4. **Public / Customer Endpoints**:
   - Live Trip Search: `GET /api/v1/trips/search?from=...&to=...&departureDate=YYYY-MM-DD&adults=N`
   - Trip Details: `GET /api/v1/trips/:id`
   - Connected Ports: `GET /api/v1/routes/ports`
   - Create Booking: `POST /api/v1/bookings`
   - Manage Booking / Lookup: `GET /api/v1/bookings/manage-booking/:ref`
   - Cancel Booking: `PATCH /api/v1/bookings/:id/cancel`
   - Digital Boarding Pass: `GET /api/v1/tickets/:ticketNumber/boarding-pass`

---

## 4. Workflow for Future AI Tasks

When asked to check, build, or debug any API or integration:
1. **Never guess**: Do not say "I assume this route exists" or "It might be implemented".
2. **Run `npm run audit`** or inspect `docs/LATEST-AUDIT-REPORT.json`.
3. **Quote exact facts**: Name the exact method, path, file location, test status, and database invariant.
4. If a test or flow fails, the audit script will output the exact failure line in seconds.
