# SmartEV Navigator — Implementation Plan

## Product objective

Deliver a guide-ready postgraduate full-stack application that plans an EV journey, proves the battery calculation, recommends a compatible and reachable charging station using deterministic scoring, explains the choice, and persists the trip.

The reference demonstration region is **Delhi NCR → Jaipur, India**. Demo coordinates, tariffs, and station availability are explicitly labelled as seeded demonstration data; OSRM and Open Charge Map remain replaceable providers.

## Architecture decisions

- pnpm workspace with `apps/web`, `apps/api`, and `packages/shared`.
- Next.js App Router is the presentation layer; NestJS owns authentication, persistence, external-provider calls, and domain orchestration.
- PostgreSQL/Prisma stores users, vehicles, station inventory, trips, stops, and recommendation audit data.
- Pure TypeScript domain functions in `packages/shared` are the single source of truth for energy, SOC, charging, geospatial, normalization, and scoring calculations.
- Provider ports (`RouteProvider`, `GeocodingProvider`, `ChargingStationProvider`) isolate third-party APIs. Resilient adapters fall back to deterministic demo data on timeout or failure.
- Recommendation weights and journey assumptions live in typed configuration, never in controllers.
- Lower recommendation score is better. Impossible/incompatible candidates are removed before normalization.
- One charging stop is optimized in the first production slice. Multi-stop planning is documented as future scope.

## Milestones

### M1 — Foundation, data, and authentication

- Workspace/tooling, Docker PostgreSQL, environment contract, shared package.
- Prisma schema for all required entities, indexes, and enums.
- NestJS bootstrap, validation, CORS, throttling, consistent errors.
- Register/login with bcrypt, JWT, guards, and role authorization.
- Seed users, 10+ EVs, 30+ stations, chargers/tariffs, and demo journeys.
- Gate: install, generate Prisma client, lint/typecheck, authentication tests.

### M2 — EV and battery domain

- Available energy, effective efficiency, range, SOC-at-distance, target SOC, charge energy/time/cost, and connector compatibility.
- Boundary/invalid-input handling and unit tests.
- Gate: shared package typecheck and unit tests.

### M3 — Routing and geospatial providers

- Haversine, point-to-segment/route distance, corridor filtering, progress along route.
- OSRM + Nominatim-compatible provider adapters with demo fallbacks.
- Unit tests for geometry and fallback behaviour.

### M4 — Stations and recommendation engine

- Open Charge Map adapter, database/demo station provider, compatibility/reachability filtering.
- FASTEST, CHEAPEST, BALANCED configuration-driven normalized scoring.
- Nearest-reachable baseline and deterministic explanation.
- Unit and trip-planning integration tests.

### M5 — End-to-end trip-planning experience

- Responsive application shell, authentication screens, dashboard, planner, results, vehicles, station explorer, history, analytics, evaluation, and admin views.
- Leaflet route/station map loaded client-side.
- Real API path plus clearly labelled demonstration fallback.
- Loading, empty, error, and success states.
- Gate: web typecheck/build and Playwright critical-flow test.

### M6 — Quality and academic handoff

- API examples, architecture diagram, algorithm explanation, setup/troubleshooting, limitations, and viva/demo script.
- Full lint/typecheck/test/build run and Docker smoke-check.
- Capture-ready screenshot placeholders and predictable demo credentials/journeys.

## Acceptance scenarios

1. **Direct:** India Gate → Gurugram Cyber Hub at 80% SOC; no charge required.
2. **Alternatives:** Delhi → Jaipur at 42% SOC; several compatible reachable stations are ranked.
3. **Strategy contrast:** Delhi → Jaipur at 34% SOC; FASTEST selects higher-power DC charging while CHEAPEST selects a lower-tariff reachable alternative.

## Calculation assumptions

- Consumption is linear with distance for the academic baseline; weather, elevation, payload, traffic, and battery degradation are not modeled.
- Route distance is multiplied by `ROUTE_ENERGY_BUFFER` (default 1.05) for conservative energy estimates.
- Charging time uses constant effective power divided by charging efficiency (default 0.90). It is labelled an estimate because real charging curves taper.
- Arrival at a station/destination must retain `MIN_RESERVE_SOC` (default 10%).
- Preferred target is 80%; it rises only enough to reach the remaining route with reserve and never exceeds 100%.
- Candidate corridor distance defaults to 10 km and represents geometric route proximity, not exact road detour. Provider route legs supply the travel estimate when available.

## Risk controls

- Provider calls use abort timeouts and degrade to demo providers.
- Secrets exist only in API environment variables.
- Passwords are bcrypt hashes; JWT and admin guards protect private operations.
- Trip planning persists only after a valid result has been produced.
- Calculation inputs are validated both at DTO and pure-domain boundaries.

