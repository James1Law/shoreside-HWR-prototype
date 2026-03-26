# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build locally
```

No test suite is configured.

## Architecture

This is a single-file React prototype — all application code lives in `shore-side-hwr-prototype.jsx`. The entry point `src/main.jsx` imports and mounts it.

**Navigation** is managed with plain `useState` in the root `App` component — no router. The `screen` state cycles through three views: `"fleet"` → `"vessel"` → `"crew"`. `selectedVessel` and `selectedCrew` hold the current drill-down context.

**Screens:**
- `FleetOverview` — sortable table of all vessels; clicking a row drills into `VesselDetail`
- `VesselDetail` — per-vessel summary cards and crew roster grouped by department; clicking a crew row drills into `SeafarerDetail`
- `SeafarerDetail` — individual seafarer timesheets, 24h Gantt bar, and NC history

**Data** is entirely hardcoded mock data at the top of the file (`VESSELS`, `CREW_PACIFIC`, `CREW_CORAL`, `TIMESHEET_DATA`, `GANTT_PERIODS`). `VesselDetail` picks crew data based on `vessel.id` (1 → `CREW_PACIFIC`, 2 → `CREW_CORAL`, others → a slice of `CREW_PACIFIC`).

**Styling** is done entirely with inline styles. A `colors` object at the top of the file is the single source of truth for the color palette. Two shared style constants (`thStyle`, `tdStyle`) are defined just above the `App` component and used across all table components.

**Domain context:** HWR = Hours of Work and Rest. The app tracks maritime crew compliance with STCW (rest hour) regulations. Key compliance concepts used throughout: 24h daily limit, 7d weekly limit, NC days (non-compliance days), OCIMF/SIRE 2.0 threshold (≥3 NC days in 30 days triggers shore-side acknowledgement), and optional regulatory overlays (Manila amendment, OPA-90).
