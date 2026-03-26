# Shore-side HWR Prototype

An interactive prototype for a **shore-side Hours of Work and Rest (HWR) compliance dashboard** used in the maritime industry. Built to demonstrate how fleet operators and shore-based management can monitor crew rest-hour compliance across multiple vessels in real time.

## What it does

The prototype provides a three-level drill-down view:

1. **Fleet Overview** — All vessels ranked by compliance urgency, showing active non-conformities, NC days in the last 30 days, crew timesheet completeness, and OCIMF/SIRE 2.0 threshold alerts.

2. **Vessel Detail** — Per-vessel crew roster grouped by department (Top Four, Deck, Engine, Catering), with each seafarer's 24h and 7d compliance status, rest/work hours, and NC severity indicators.

3. **Seafarer Detail** — Individual crew member view with a 24-hour interactive timeline (Gantt chart), 10-day timesheet history, and computed compliance summaries. Clicking different days in the timesheet updates the timeline in real time.

## Compliance rules implemented

All compliance statuses are **computed from actual work/rest hours**, not hardcoded:

| Rule | Threshold | Source |
|------|-----------|--------|
| **Daily (24h)** | Minimum 10h rest in any 24h period | STCW |
| **Intervals** | Rest in max 2 periods, one of which must be at least 6 consecutive hours | STCW |
| **Weekly (7d)** | Minimum 77h rest in any rolling 7-day period | STCW |
| **Manila Amendment** | Allows reduced daily rest to 6h under exceptional circumstances | STCW Manila |
| **OCIMF/SIRE 2.0** | Any individual with 3+ NC days in 30 days triggers shore-side acknowledgement | OCIMF |

Regulatory overlays for **OPA-90** (US waters tanker requirements) and **MLC-A/B** (Maritime Labour Convention) are indicated per vessel.

## Data generation

The prototype uses a **seeded pseudo-random number generator** to produce deterministic, realistic mock data:

- **8 vessels** with unique crew rosters (18-27 crew each)
- **~190 crew members** with unique names drawn from diverse maritime nationalities
- **30 days of work/rest data** per crew member, with 10 days of detailed Gantt timelines
- **Crew behavior profiles** (clean, borderline, problem) that drive realistic compliance patterns
- **Vessel story configs** that control how many problem/borderline crew each vessel has

All vessel-level statistics (active NCs, NC days, completeness) are aggregated from the underlying crew data.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the prototype.

## Tech stack

- [React](https://react.dev/) 18
- [Vite](https://vitejs.dev/) 5
- Single-file architecture — all components and data generation in `shore-side-hwr-prototype.jsx`
- No external UI libraries — all styling is inline

## Build

```bash
npm run build    # Production build to dist/
npm run preview  # Preview the production build locally
```
