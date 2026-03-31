# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build locally
```

No test suite or CI pipeline is configured.

## Architecture

This is a single-file React prototype — all application code lives in `shore-side-hwr-prototype.jsx`. The entry point `src/main.jsx` imports and mounts it inside a `<BrowserRouter>`.

**Routing** uses `react-router-dom` v7. The URL structure is:
- `/table` — fleet table view
- `/dashboard` — fleet dashboard/analytics view
- `/table/vessel/:vesselId` and `/dashboard/vessel/:vesselId` — vessel detail
- `/table/vessel/:vesselId/crew/:crewId` and `/dashboard/vessel/:vesselId/crew/:crewId` — seafarer detail
- `/` redirects to `/table`

Drill-down pages are nested under `/table` or `/dashboard` so the breadcrumb and back-navigation know which fleet view the user came from. Helper hooks `useRouteData()` and `useFleetBase()` resolve URL params to data objects and determine the active base path. Routed wrapper components (`RoutedFleetOverview`, `VesselDetailRoute`, `SeafarerDetailRoute`) bridge between the router and the existing screen components.

**Screens:**
- `FleetOverview` — sortable table of all vessels with a toggle to switch between table and dashboard views; clicking a row drills into `VesselDetail`
- `FleetDashboard` — fleet-level analytics with KPI cards, insight cards (auto-generated plain-English observations), charts (by vessel, reason, location, type, trend, department), a repeat-offender heatmap, and a crew watch list with 10-day dot timelines and trend indicators
- `VesselDetail` — per-vessel summary cards and crew roster grouped by department; clicking a crew row drills into `SeafarerDetail`
- `SeafarerDetail` — individual seafarer timesheets, 24h Gantt bar, NC history, and OCIMF acknowledgement panel

**Data** is generated deterministically using a seeded PRNG at the top of the file. `VESSEL_PROFILES` defines 8 vessels with crew behavior configs. `generateCrew()`, `generateDailyHours()`, and `computeCompliance()` produce enriched crew objects with 30 days of work/rest data. `CREW_TIMESHEETS` (a Map keyed by `"vesselId-crewId"`) stores 10-day `displayDays` arrays with per-day compliance status, reasons, and Gantt periods. `computeDashboardMetrics()` aggregates everything into `DASHBOARD_METRICS` including `watchListCrew` (with timelines, trends, concern scores) and `fleetInsights` (auto-generated insight cards).

**Styling** is done entirely with inline styles. A `colors` object at the top of the file is the single source of truth for the color palette. Two shared style constants (`thStyle`, `tdStyle`) are defined just above the `App` component and used across all table components.

**Domain context:** HWR = Hours of Work and Rest. The app tracks maritime crew compliance with STCW (rest hour) regulations. Key compliance concepts used throughout: 24h daily limit, 7d weekly limit, NC days (non-compliance days), OCIMF/SIRE 2.0 threshold (≥3 NC days in 30 days triggers shore-side acknowledgement), and optional regulatory overlays (Manila amendment, OPA-90).
