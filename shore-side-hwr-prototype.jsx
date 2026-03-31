import { useState } from "react";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation, Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA LAYER — seeded PRNG, pools, generators, compliance computation
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Seeded PRNG (Mulberry32) ─── */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seededPick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function seededRange(rng, min, max) { return min + rng() * (max - min); }
function seededRangeInt(rng, min, max) { return Math.floor(seededRange(rng, min, max + 1)); }

/* ─── Name pools ─── */
const FIRST_NAMES = [
  "Aleksei","Andrei","Antonio","Arjun","Boris","Carlos","Chen Wei","Cody","Darrell","Dmitri",
  "Elena","Emilio","Esteban","Fernando","Giovanni","Hiro","Irina","Ivan","James","Jane",
  "Jorge","Juan","Katya","Kenji","Lars","Liam","Marco","Maria","Mikhail","Nikos",
  "Olga","Paolo","Pedro","Raj","Ramon","Ravi","Roberto","Sergei","Soren","Takeshi",
  "Viktor","Vladislav","Yuki","Zhao Min","Albert","Bessie","Cameron","Devon","Floyd","Guy",
  "Kristin","Marcus","Savannah","Robert","Cody","Erik","Nikolai","Stefan","Tomasz","Andrzej",
];
const LAST_NAMES = [
  "Alvarez","Bautista","Chen","Cooper","Cruz","Da Silva","De Leon","Fernandez","Fisher",
  "Flores","Garcia","Gonzalez","Hansen","Hawkins","Hernandez","Ivanov","Jensen","Kim",
  "Kumar","Lane","Lopez","Martinez","Mendoza","Miles","Morales","Nakamura","Nguyen",
  "Novak","O'Brien","Patel","Petrov","Reyes","Rodriguez","Santos","Smith","Steward",
  "Suzuki","Tanaka","Torres","Vasquez","Volkov","Watson","Weber","Yamamoto","Zhao",
];

/* ─── Rank template (standard merchant vessel crew) ─── */
const RANK_TEMPLATE = [
  { rank: "Master", dept: "Top Four" },
  { rank: "Chief Officer", dept: "Top Four" },
  { rank: "Chief Engineer", dept: "Top Four" },
  { rank: "2nd Engineer", dept: "Top Four" },
  { rank: "2nd Officer", dept: "Deck" },
  { rank: "3rd Officer", dept: "Deck" },
  { rank: "Bosun", dept: "Deck" },
  { rank: "AB", dept: "Deck" },
  { rank: "AB", dept: "Deck" },
  { rank: "AB", dept: "Deck" },
  { rank: "OS", dept: "Deck" },
  { rank: "3rd Engineer", dept: "Engine" },
  { rank: "Electrician", dept: "Engine" },
  { rank: "Oiler", dept: "Engine" },
  { rank: "Wiper", dept: "Engine" },
  { rank: "Chief Cook", dept: "Catering" },
  { rank: "Steward", dept: "Catering" },
  // Extra slots for larger crews
  { rank: "AB", dept: "Deck" },
  { rank: "Oiler", dept: "Engine" },
  { rank: "OS", dept: "Deck" },
  { rank: "Steward", dept: "Catering" },
  { rank: "Fitter", dept: "Engine" },
  { rank: "AB", dept: "Deck" },
  { rank: "Wiper", dept: "Engine" },
  { rank: "Pumpman", dept: "Engine" },
  { rank: "AB", dept: "Deck" },
  { rank: "Steward", dept: "Catering" },
  { rank: "OS", dept: "Deck" },
];

const NC_REASONS = [
  "Mooring operations", "Cargo operations", "Port entry", "Emergency drill",
  "Heavy weather", "Bunkering operations", "Tank cleaning", "Port departure",
  "Safety inspection", "Anchor watch", "Pilot boarding", "Cargo discharge",
];

/* ─── Vessel profiles (static identity + story config) ─── */
const VESSEL_PROFILES = [
  { id: 1, name: "MV Pacific Voyager", imo: "9876543", type: "Bulk Carrier", regime: "STCW Core", manila: false, opa90: false, crewSize: 22, lastSync: "2h ago", location: "At Sea — South China Sea", problemCrew: 2, borderlineCrew: 4, missingEntries: 1 },
  { id: 2, name: "MT Coral Stream", imo: "9812345", type: "Oil Tanker", regime: "STCW Core", manila: true, opa90: true, crewSize: 27, lastSync: "45m ago", location: "Houston, TX — US Waters", problemCrew: 1, borderlineCrew: 3, missingEntries: 0 },
  { id: 3, name: "MV Northern Spirit", imo: "9823456", type: "Container", regime: "MLC-A", manila: false, opa90: false, crewSize: 24, lastSync: "1h ago", location: "Rotterdam", problemCrew: 0, borderlineCrew: 2, missingEntries: 2 },
  { id: 4, name: "MV Atlas Pioneer", imo: "9834567", type: "Bulk Carrier", regime: "STCW Core", manila: true, opa90: false, crewSize: 21, lastSync: "3h ago", location: "Singapore Strait", problemCrew: 0, borderlineCrew: 3, missingEntries: 1 },
  { id: 5, name: "MT Sea Falcon", imo: "9845678", type: "Chemical Tanker", regime: "MLC-B", manila: false, opa90: false, crewSize: 25, lastSync: "30m ago", location: "At Sea — Mediterranean", problemCrew: 0, borderlineCrew: 1, missingEntries: 0 },
  { id: 6, name: "MV Cape Hector", imo: "9856789", type: "Container", regime: "STCW Core", manila: false, opa90: false, crewSize: 23, lastSync: "6h ago", location: "Piraeus", problemCrew: 1, borderlineCrew: 3, missingEntries: 3 },
  { id: 7, name: "MV Ocean Grace", imo: "9867890", type: "General Cargo", regime: "STCW Core", manila: false, opa90: false, crewSize: 18, lastSync: "12h ago", location: "At Sea — Indian Ocean", problemCrew: 0, borderlineCrew: 1, missingEntries: 3 },
  { id: 8, name: "MT Dawn Carrier", imo: "9878901", type: "Oil Tanker", regime: "STCW Core", manila: true, opa90: false, crewSize: 27, lastSync: "2h ago", location: "Fujairah", problemCrew: 0, borderlineCrew: 2, missingEntries: 1 },
];

/* ─── Date helper ─── */
const DISPLAY_DAYS = 10;
const LOOKBACK_DAYS = 30;
function formatDate(dayIndex) {
  // Day 0 = 25 Mar 2026, going backwards
  const base = new Date(2026, 2, 25); // March 25, 2026
  const d = new Date(base);
  d.setDate(d.getDate() - dayIndex);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ─── Generate crew for a vessel ─── */
function generateCrew(vessel) {
  const rng = mulberry32(vessel.id * 1000);
  const usedNames = new Set();
  const crew = [];

  // Assign behavior profiles: first N are problem, next M are borderline, rest are clean
  const behaviors = [];
  for (let i = 0; i < vessel.crewSize; i++) {
    if (i < vessel.problemCrew) behaviors.push("problem");
    else if (i < vessel.problemCrew + vessel.borderlineCrew) behaviors.push("borderline");
    else behaviors.push("clean");
  }
  // Shuffle behaviors so problem/borderline aren't always the top ranks
  for (let i = behaviors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [behaviors[i], behaviors[j]] = [behaviors[j], behaviors[i]];
  }

  for (let i = 0; i < vessel.crewSize; i++) {
    const template = RANK_TEMPLATE[i] || { rank: "AB", dept: "Deck" };
    let name;
    do {
      name = seededPick(rng, FIRST_NAMES) + " " + seededPick(rng, LAST_NAMES);
    } while (usedNames.has(name));
    usedNames.add(name);

    crew.push({
      id: vessel.id * 100 + i + 1,
      name,
      rank: template.rank,
      dept: template.dept,
      vesselId: vessel.id,
      behavior: behaviors[i],
    });
  }
  return crew;
}

/* ─── Generate daily work/rest hours for one crew member (30 days) ─── */
function generateDailyHours(crewMember, vessel) {
  const rng = mulberry32(crewMember.id * 77 + vessel.id * 13);
  const days = [];

  for (let d = 0; d < LOOKBACK_DAYS; d++) {
    let workH;
    const b = crewMember.behavior;
    if (b === "problem") {
      // 40% chance of an NC day (rest < 10h → work > 14h), otherwise 12-14h work
      if (rng() < 0.4) {
        workH = seededRange(rng, 14.0, 17.0);
      } else {
        workH = seededRange(rng, 11.5, 14.0);
      }
    } else if (b === "borderline") {
      // 15% chance of NC day, otherwise hovers near the line
      if (rng() < 0.15) {
        workH = seededRange(rng, 14.0, 15.5);
      } else {
        workH = seededRange(rng, 10.0, 13.5);
      }
    } else {
      // clean: 8-11h work
      workH = seededRange(rng, 7.5, 11.0);
    }
    workH = Math.round(workH * 2) / 2; // round to 0.5h
    workH = Math.max(6, Math.min(18, workH));
    const restH = 24 - workH;
    days.push({ workH, restH });
  }
  return days;
}

/* ─── Generate Gantt periods for one day ─── */
function generateGanttPeriods(workH, seed) {
  const rng = mulberry32(seed);
  const periods = [];
  const drillH = rng() < 0.2 ? (rng() < 0.5 ? 1 : 2) : 0;
  const actualWorkH = Math.max(0, workH - drillH);
  const restH = 24 - workH;

  // Choose a watch pattern
  const pattern = rng();

  if (pattern < 0.5) {
    // Two-block split watch: rest-work-rest-work(/drill)-rest
    const work1 = Math.round(actualWorkH * 0.4 * 2) / 2;
    const work2 = actualWorkH - work1;
    const rest1 = Math.max(1, Math.round(restH * 0.35 * 2) / 2);
    const mid = Math.max(0.5, Math.round(restH * 0.15 * 2) / 2);
    const rest3 = Math.max(0.5, restH - rest1 - mid);

    let t = 0;
    if (rest1 > 0) { periods.push({ start: t, end: t + rest1, type: "rest" }); t += rest1; }
    if (work1 > 0) { periods.push({ start: t, end: t + work1, type: "work" }); t += work1; }
    if (mid > 0) { periods.push({ start: t, end: t + mid, type: "rest" }); t += mid; }
    if (drillH > 0) { periods.push({ start: t, end: t + drillH, type: "drill" }); t += drillH; }
    if (work2 > 0) { periods.push({ start: t, end: t + work2, type: "work" }); t += work2; }
    if (t < 24) { periods.push({ start: t, end: 24, type: "rest" }); }
  } else if (pattern < 0.8) {
    // Single long work block (day worker): rest-work-rest
    const restBefore = Math.max(1, Math.round(restH * 0.4 * 2) / 2);
    const restAfter = Math.max(0.5, restH - restBefore);

    let t = 0;
    periods.push({ start: t, end: t + restBefore, type: "rest" }); t += restBefore;
    if (drillH > 0) { periods.push({ start: t, end: t + drillH, type: "drill" }); t += drillH; }
    periods.push({ start: t, end: t + actualWorkH, type: "work" }); t += actualWorkH;
    if (t < 24) { periods.push({ start: t, end: 24, type: "rest" }); }
  } else {
    // Three-block pattern (fragmented): rest-work-rest-drill/work-rest-work-rest
    const w1 = Math.max(1, Math.round(actualWorkH * 0.3 * 2) / 2);
    const w2 = Math.max(1, Math.round(actualWorkH * 0.3 * 2) / 2);
    const w3 = Math.max(0.5, actualWorkH - w1 - w2);
    const r1 = Math.max(1, Math.round(restH * 0.3 * 2) / 2);
    const r2 = Math.max(0.5, Math.round(restH * 0.2 * 2) / 2);
    const r3 = Math.max(0.5, Math.round(restH * 0.2 * 2) / 2);
    const r4 = Math.max(0.5, restH - r1 - r2 - r3);

    let t = 0;
    periods.push({ start: t, end: t + r1, type: "rest" }); t += r1;
    periods.push({ start: t, end: t + w1, type: "work" }); t += w1;
    periods.push({ start: t, end: t + r2, type: "rest" }); t += r2;
    if (drillH > 0) { periods.push({ start: t, end: t + drillH, type: "drill" }); t += drillH; }
    periods.push({ start: t, end: t + w2, type: "work" }); t += w2;
    periods.push({ start: t, end: t + r3, type: "rest" }); t += r3;
    periods.push({ start: t, end: t + w3, type: "work" }); t += w3;
    if (t < 24) { periods.push({ start: t, end: 24, type: "rest" }); }
  }

  // Clamp all periods to 24h and round
  return periods.map(p => ({
    start: Math.round(Math.max(0, p.start) * 2) / 2,
    end: Math.round(Math.min(24, p.end) * 2) / 2,
    type: p.type,
  })).filter(p => p.end > p.start);
}

/* ─── Compute STCW compliance from daily hours ─── */
function computeCompliance(allDays, ganttByDay, manila) {
  // allDays: array of { workH, restH } for 30 days (index 0 = most recent)
  // ganttByDay: array of gantt periods for the 10 display days
  const displayDays = [];

  for (let i = 0; i < DISPLAY_DAYS; i++) {
    const day = allDays[i];
    const gantt = ganttByDay[i];

    // Daily compliance: rest >= 10h
    let daily;
    if (day.restH >= 10) {
      daily = "pass";
    } else if (manila && day.restH >= 6) {
      daily = "manila";
    } else {
      daily = "fail";
    }

    // Interval compliance: rest in <= 2 periods AND longest rest period >= 6h
    const restPeriods = gantt.filter(p => p.type === "rest");
    const longestRest = restPeriods.reduce((max, p) => Math.max(max, p.end - p.start), 0);
    const intervals = (restPeriods.length <= 2 && longestRest >= 6) ? "pass" : (day.restH >= 10 ? "pass" : "fail");

    // Weekly compliance: rolling 7-day rest sum >= 77h
    let restSum7d = 0;
    for (let j = i; j < Math.min(i + 7, allDays.length); j++) {
      restSum7d += allDays[j].restH;
    }
    // If we don't have 7 full days, extrapolate
    const daysAvailable = Math.min(7, allDays.length - i);
    if (daysAvailable < 7) restSum7d = (restSum7d / daysAvailable) * 7;
    const weekly = restSum7d >= 77 ? "pass" : "fail";

    displayDays.push({
      date: formatDate(i),
      status: i === 0 ? "submitted" : "approved",
      work: day.workH.toFixed(1) + "h",
      rest: day.restH.toFixed(1) + "h",
      workH: day.workH,
      restH: day.restH,
      daily,
      weekly,
      intervals,
      reason: daily === "fail" ? null : null, // we'll assign reasons below
      ganttPeriods: gantt,
    });
  }

  // Assign NC reasons for non-compliant days
  const reasonRng = mulberry32(allDays.length * 31);
  displayDays.forEach(d => {
    if (d.daily === "fail" || d.intervals === "fail") {
      d.reason = seededPick(reasonRng, NC_REASONS);
    }
  });

  // Compute summary stats
  let ncDays30 = 0;
  for (let i = 0; i < LOOKBACK_DAYS; i++) {
    if (allDays[i].restH < 10) ncDays30++;
  }

  let restTotal7d = 0;
  for (let i = 0; i < Math.min(7, allDays.length); i++) {
    restTotal7d += allDays[i].restH;
  }
  restTotal7d = Math.round(restTotal7d * 2) / 2;

  const daily24hCurrent = displayDays[0].daily;
  const weekly7dCurrent = displayDays[0].weekly;

  return {
    displayDays,
    summary: { ncDays30, restTotal7d, daily24hCurrent, weekly7dCurrent },
  };
}

/* ─── Build all data at module scope ─── */
const VESSEL_DATA = [];
const CREW_TIMESHEETS = new Map();

VESSEL_PROFILES.forEach(vp => {
  const crew = generateCrew(vp);
  let activeNCs = 0;
  let maxNcDays30 = 0;
  let loggedToday = 0;

  const enrichedCrew = crew.map((c, idx) => {
    const allDays = generateDailyHours(c, vp);
    const ganttByDay = [];
    for (let d = 0; d < DISPLAY_DAYS; d++) {
      ganttByDay.push(generateGanttPeriods(allDays[d].workH, c.id * 1000 + d));
    }
    const { displayDays, summary } = computeCompliance(allDays, ganttByDay, vp.manila);

    CREW_TIMESHEETS.set(`${vp.id}-${c.id}`, { displayDays, summary });

    const missingIdx = vp.crewSize - vp.missingEntries;
    const isMissing = idx >= missingIdx;
    // Vary last entry labels for missing crew: "Yesterday", "2 days ago", "3 days ago"
    const missingOffset = idx - missingIdx; // 0, 1, 2, ...
    const lastEntryLabels = ["Yesterday", "2 days ago", "3 days ago"];
    const lastEntry = isMissing ? (lastEntryLabels[missingOffset] || lastEntryLabels[lastEntryLabels.length - 1]) : "Today";
    if (!isMissing) loggedToday++;

    if (summary.daily24hCurrent === "fail" || summary.weekly7dCurrent === "fail") activeNCs++;
    if (summary.ncDays30 > maxNcDays30) maxNcDays30 = summary.ncDays30;

    return {
      ...c,
      daily24h: summary.daily24hCurrent,
      weekly7d: summary.weekly7dCurrent,
      ncDays30: summary.ncDays30,
      lastEntry,
      rest24h: isMissing ? null : allDays[0].restH.toFixed(1) + "h",
      work24h: isMissing ? null : allDays[0].workH.toFixed(1) + "h",
    };
  });

  VESSEL_DATA.push({
    id: vp.id,
    name: vp.name,
    imo: vp.imo,
    type: vp.type,
    regime: vp.regime,
    manila: vp.manila,
    opa90: vp.opa90,
    location: vp.location,
    lastSync: vp.lastSync,
    crewCount: vp.crewSize,
    activeNCs,
    ncDays30: maxNcDays30,
    completeness: `${loggedToday}/${vp.crewSize}`,
    crew: enrichedCrew,
  });
});

/* ─── Dashboard metrics aggregation ─── */
function computeDashboardMetrics() {
  let totalCrew = 0, totalNcCrewToday = 0, totalNcDaysFleet30d = 0, restSum = 0;
  const reasonCounts = {};
  const locationCounts = {};
  const vesselTypeCounts = {};
  const deptCounts = {};
  const deptRecent = {};  // NC counts days 0-4 per department
  const deptPrior = {};   // NC counts days 5-9 per department
  const trendByDay = Array.from({ length: DISPLAY_DAYS }, () => 0);
  const allCrew = [];

  for (const v of VESSEL_DATA) {
    let vesselNcSum = 0;
    for (const c of v.crew) {
      totalCrew++;
      totalNcDaysFleet30d += c.ncDays30;
      vesselNcSum += c.ncDays30;
      if (c.rest24h) restSum += parseFloat(c.rest24h);
      if (c.daily24h === "fail" || c.weekly7d === "fail") totalNcCrewToday++;

      // Department
      deptCounts[c.dept] = (deptCounts[c.dept] || 0) + c.ncDays30;

      // Timesheet details
      const tsKey = `${v.id}-${c.id}`;
      const tsData = CREW_TIMESHEETS.get(tsKey);
      if (tsData) {
        tsData.displayDays.forEach((d, i) => {
          if (d.reason) reasonCounts[d.reason] = (reasonCounts[d.reason] || 0) + 1;
          if (d.daily === "fail" || d.intervals === "fail") {
            trendByDay[i]++;
            if (i < 5) deptRecent[c.dept] = (deptRecent[c.dept] || 0) + 1;
            else deptPrior[c.dept] = (deptPrior[c.dept] || 0) + 1;
          }
        });
      }

      allCrew.push({ ...c, vesselName: v.name, vesselId: v.id });
    }

    // Location
    locationCounts[v.location] = (locationCounts[v.location] || 0) + vesselNcSum;

    // Vessel type
    if (!vesselTypeCounts[v.type]) vesselTypeCounts[v.type] = { count: 0, vessels: 0 };
    vesselTypeCounts[v.type].count += vesselNcSum;
    vesselTypeCounts[v.type].vessels++;
  }

  const ocimfFlaggedVessels = VESSEL_DATA.filter(v => v.crew.some(c => c.ncDays30 >= 3)).length;

  // ─── Watch list: crew with NC history, enriched with timelines and trends ───
  const watchListCrew = allCrew
    .filter(c => c.ncDays30 > 0)
    .map(c => {
      const tsData = CREW_TIMESHEETS.get(`${c.vesselId}-${c.id}`);
      const days = tsData ? tsData.displayDays : [];
      const timeline = days.map(d => ({ date: d.date, status: d.daily, restH: d.restH, reason: d.reason }));

      const recentNcCount = days.slice(0, 5).filter(d => d.daily === "fail").length;
      const priorNcCount = days.slice(5, 10).filter(d => d.daily === "fail").length;
      const trend = recentNcCount > priorNcCount ? "worsening" : recentNcCount < priorNcCount ? "improving" : "stable";
      const concernScore = (c.ncDays30 * 2) + (recentNcCount * 3) + (trend === "worsening" ? 5 : 0);

      // Consecutive fail streak from most recent day
      let streak = 0;
      for (let i = 0; i < days.length; i++) {
        if (days[i].daily === "fail") streak++;
        else break;
      }
      const failsIn5 = recentNcCount;
      const streakDesc = streak >= 2
        ? `${streak} consecutive NC days`
        : failsIn5 >= 2 ? `${failsIn5} of last 5 days` : "1 NC in last 5 days";

      // Most frequent reason
      const reasonFreq = {};
      days.forEach(d => { if (d.reason) reasonFreq[d.reason] = (reasonFreq[d.reason] || 0) + 1; });
      const topReason = Object.entries(reasonFreq).sort((a, b) => b[1] - a[1])[0];

      return {
        ...c, timeline, trend, concernScore, recentNcCount, priorNcCount,
        streakDesc, topReason: topReason ? topReason[0] : null, streak,
      };
    })
    .sort((a, b) => b.concernScore - a.concernScore);

  // ─── Fleet insights: auto-generated plain-English observations ───
  const fleetInsights = [];

  // 1. Vessel cluster: multiple crew on same vessel with recent NCs
  const vesselRecentCounts = {};
  watchListCrew.forEach(c => {
    if (c.recentNcCount >= 3) vesselRecentCounts[c.vesselName] = (vesselRecentCounts[c.vesselName] || 0) + 1;
  });
  Object.entries(vesselRecentCounts).forEach(([vName, count]) => {
    if (count >= 2) fleetInsights.push({
      category: "VESSEL PATTERN", accent: "#ef4444",
      text: `${count} crew on ${vName} have had NCs on 3+ of the last 5 days — possible systemic scheduling issue`,
      severity: count * 3,
    });
  });

  // 2. Dominant reason
  const ncByReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  const totalReasons = Object.values(reasonCounts).reduce((s, v) => s + v, 0);
  if (ncByReason.length > 0 && totalReasons > 0) {
    const pct = Math.round((ncByReason[0][1] / totalReasons) * 100);
    if (pct >= 30) fleetInsights.push({
      category: "ROOT CAUSE", accent: "#f59e0b",
      text: `"${ncByReason[0][0]}" accounts for ${pct}% of all NCs in the last 10 days — consider reviewing related procedures`,
      severity: pct >= 40 ? 8 : 5,
    });
  }

  // 3. Department trend
  Object.keys(deptCounts).forEach(dept => {
    const recent = deptRecent[dept] || 0;
    const prior = deptPrior[dept] || 0;
    if (prior > 0 && recent > prior * 1.4) {
      const pct = Math.round(((recent - prior) / prior) * 100);
      fleetInsights.push({
        category: "TREND", accent: "#f59e0b",
        text: `${dept} department NCs are up ${pct}% in the last 5 days compared to the prior 5`,
        severity: 6,
      });
    }
  });

  // 4. Longest active streak
  if (watchListCrew.length > 0) {
    const worst = watchListCrew.reduce((a, b) => a.streak > b.streak ? a : b);
    if (worst.streak >= 3) fleetInsights.push({
      category: "PERSON", accent: "#ef4444",
      text: `${worst.name} (${worst.rank}, ${worst.vesselName}) has been non-compliant for ${worst.streak} consecutive days — the longest active streak in the fleet`,
      severity: worst.streak * 2,
    });
  }

  // 5. Improving crew (positive)
  const improvingCount = watchListCrew.filter(c => c.trend === "improving").length;
  if (improvingCount >= 2) fleetInsights.push({
    category: "GOOD NEWS", accent: "#16a34a",
    text: `${improvingCount} crew members are showing improvement — their NC frequency dropped in the last 5 days`,
    severity: 1,
  });

  fleetInsights.sort((a, b) => b.severity - a.severity);
  const topInsights = fleetInsights.slice(0, 4);

  return {
    totalCrew,
    totalNcCrewToday,
    totalNcDaysFleet30d,
    ocimfFlaggedVessels,
    avgRestHours: totalCrew > 0 ? Math.round((restSum / totalCrew) * 10) / 10 : 0,
    ncByReason: Object.entries(reasonCounts).map(([reason, count]) => ({ label: reason, value: count })).sort((a, b) => b.value - a.value),
    ncByLocation: Object.entries(locationCounts).map(([loc, count]) => ({ label: loc, value: count })).sort((a, b) => b.value - a.value),
    ncByVessel: VESSEL_DATA.map(v => ({ label: v.name, value: v.crew.reduce((s, c) => s + c.ncDays30, 0) })).sort((a, b) => b.value - a.value),
    ncByVesselType: Object.entries(vesselTypeCounts).map(([type, d]) => ({ label: type, value: d.count, vessels: d.vessels })).sort((a, b) => b.value - a.value),
    ncByDepartment: Object.entries(deptCounts).map(([dept, count]) => ({ label: dept, value: count })).sort((a, b) => b.value - a.value),
    ncByRank: allCrew.reduce((acc, c) => { const key = `${c.dept}|||${c.rank}`; acc[key] = (acc[key] || 0) + c.ncDays30; return acc; }, {}),
    ncTrend: Array.from({ length: DISPLAY_DAYS }, (_, i) => ({ label: formatDate(i), value: trendByDay[i] })).reverse(),
    worstCrew: [...allCrew].sort((a, b) => b.ncDays30 - a.ncDays30).slice(0, 10),
    watchListCrew,
    fleetInsights: topInsights,
  };
}
const DASHBOARD_METRICS = computeDashboardMetrics();

/* ═══════════════════════════════════════════════════════════════════════════
   UI LAYER — styles, components, screens
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── styles ─── */
const colors = {
  bg: "#f5f7fa",
  white: "#ffffff",
  sidebar: "#1e2d3d",
  sidebarActive: "#0ea5e9",
  text: "#1e293b",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  teal: "#0891b2",
  tealLight: "#cffafe",
  red: "#ef4444",
  redLight: "#fef2f2",
  redBg: "#fee2e2",
  amber: "#f59e0b",
  amberLight: "#fffbeb",
  amberBg: "#fef3c7",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  greenBg: "#dcfce7",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  manilaAmber: "#b45309",
  primaryBtn: "#1d6fb8",
  linkBlue: "#1a7fc4",
  navBg: "#1e2d3d",
};

function Chip({ type, label }) {
  const styles = {
    pass: { bg: colors.greenBg, color: colors.green, dot: colors.green },
    fail: { bg: colors.amberBg, color: colors.manilaAmber, dot: colors.manilaAmber },
    manila: { bg: colors.amberBg, color: colors.manilaAmber, dot: colors.manilaAmber },
    cooldown: { bg: "#dbeafe", color: colors.blue, dot: colors.blue },
  };
  const s = styles[type] || styles.pass;
  const labels = { pass: "Compliant", fail: "Non-compliant", manila: "Manila", cooldown: "Cooldown" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
      {label || labels[type]}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    submitted: { bg: "#3b82f6", color: "#ffffff", label: "Submitted" },
    approved:  { bg: "#22c55e", color: "#ffffff", label: "Approved" },
    waiting:   { bg: "#f59e0b", color: "#ffffff", label: "Waiting" },
    rejected:  { bg: "#ef4444", color: "#ffffff", label: "Rejected" },
  };
  const s = map[status] || map.submitted;
  return (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function SeverityIndicator({ ncDays30 }) {
  if (ncDays30 >= 3) return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: colors.red, fontWeight: 700, fontSize: 13 }}>⚠ {ncDays30}</span>;
  if (ncDays30 > 0) return <span style={{ color: colors.amber, fontWeight: 600, fontSize: 13 }}>{ncDays30}</span>;
  return <span style={{ color: colors.green, fontWeight: 500, fontSize: 13 }}>0</span>;
}

/* ─── Chart components ─── */
function ChartPanel({ title, children }) {
  return (
    <div style={{ background: colors.white, borderRadius: 10, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, fontSize: 14, fontWeight: 700, color: colors.text }}>{title}</div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function HorizontalBarChart({ data, barColor, colorFn, onClickItem }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: onClickItem ? "pointer" : "default" }} onClick={() => onClickItem && onClickItem(d, i)}>
          <div style={{ width: "35%", fontSize: 12, color: onClickItem ? colors.linkBlue : colors.text, fontWeight: onClickItem ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={d.label}>{d.label}</div>
          <div style={{ flex: 1, height: 22, background: colors.bg, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: "100%", background: colorFn ? colorFn(d, i) : (barColor || colors.teal), borderRadius: 4, transition: "width 0.3s", minWidth: d.value > 0 ? 4 : 0 }} />
          </div>
          <div style={{ width: 36, textAlign: "right", fontSize: 12, fontWeight: 600, color: colors.text }}>{d.value}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumDeg = 0;
  const segments = data.filter(d => d.value > 0).map(d => {
    const start = cumDeg;
    cumDeg += (d.value / total) * 360;
    return `${d.color} ${start}deg ${cumDeg}deg`;
  });
  const gradient = segments.length > 0 ? `conic-gradient(${segments.join(", ")})` : colors.bg;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
        <div style={{ width: 140, height: 140, borderRadius: "50%", background: gradient }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 80, height: 80, borderRadius: "50%", background: colors.white, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>{total}</div>
          <div style={{ fontSize: 10, color: colors.textSecondary }}>total</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: colors.text }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: colors.text }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            {d.value > 0 && <div style={{ fontSize: 10, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{d.value}</div>}
            <div style={{
              width: "100%", maxWidth: 40,
              height: `${Math.max((d.value / max) * 110, d.value > 0 ? 6 : 2)}px`,
              background: d.value > 0 ? colors.red : colors.greenBg,
              borderRadius: "3px 3px 0 0",
              opacity: d.value > 0 ? 0.85 : 0.5,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: colors.textSecondary, lineHeight: 1.2 }}>
            {d.label.replace(/ \d{4}$/, "")}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard view ─── */
const VESSEL_TYPE_COLORS = { "Bulk Carrier": "#3b82f6", "Oil Tanker": "#ef4444", "Container": "#f59e0b", "Chemical Tanker": "#8b5cf6", "General Cargo": "#0891b2" };
const DEPT_COLORS = { "Top Four": "#ef4444", "Deck": "#3b82f6", "Engine": "#f59e0b", "Catering": "#8b5cf6" };

function FleetDashboard({ onSelectVessel, onSelectCrew }) {
  const m = DASHBOARD_METRICS;
  const [expandedDept, setExpandedDept] = useState(null);

  const handleVesselClick = (d) => {
    const vessel = VESSEL_DATA.find(v => v.name === d.label);
    if (vessel) onSelectVessel(vessel);
  };

  const getRanksForDept = (dept) => {
    return Object.entries(m.ncByRank)
      .filter(([key]) => key.startsWith(`${dept}|||`))
      .map(([key, count]) => ({ label: key.split("|||")[1], value: count }))
      .sort((a, b) => b.value - a.value);
  };

  const handleCrewClick = (c) => {
    const vessel = VESSEL_DATA.find(v => v.id === c.vesselId);
    if (vessel && onSelectCrew) onSelectCrew(vessel, c);
  };

  const trendIndicator = (trend) => {
    if (trend === "worsening") return <span style={{ color: colors.red, fontWeight: 600, fontSize: 12 }}>&#9650; Worsening</span>;
    if (trend === "improving") return <span style={{ color: colors.green, fontWeight: 600, fontSize: 12 }}>&#9660; Improving</span>;
    return <span style={{ color: colors.textSecondary, fontWeight: 500, fontSize: 12 }}>&#8212; Stable</span>;
  };

  const dotTimeline = (timeline) => (
    <div style={{ display: "flex", gap: 3, alignItems: "center", justifyContent: "center" }}>
      {[...timeline].reverse().map((d, i) => (
        <div key={i} title={`${d.date}: ${d.restH.toFixed(1)}h rest${d.reason ? ` — ${d.reason}` : ""}`}
          style={{
            width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
            background: d.status === "fail" ? colors.red : d.status === "manila" ? "#f59e0b" : colors.green,
            opacity: d.status === "pass" ? 0.5 : 0.9,
          }} />
      ))}
    </div>
  );

  const heatmapCrew = m.watchListCrew.slice(0, 8);

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total crew", value: m.totalCrew, sub: `Across ${VESSEL_DATA.length} vessels`, color: colors.text },
          { label: "Active NCs today", value: m.totalNcCrewToday, sub: "Crew with 24h or 7d violations", color: m.totalNcCrewToday > 0 ? colors.red : colors.green },
          { label: "Fleet NC days (30d)", value: m.totalNcDaysFleet30d, sub: "Sum across all crew", color: m.totalNcDaysFleet30d > 0 ? colors.amber : colors.green },
          { label: "OCIMF flagged vessels", value: m.ocimfFlaggedVessels, sub: "Crew with ≥3 NC days", color: m.ocimfFlaggedVessels > 0 ? colors.red : colors.green },
          { label: "Avg rest hours (today)", value: `${m.avgRestHours}h`, sub: "Fleet average, target ≥10h", color: m.avgRestHours < 10 ? colors.red : colors.green },
        ].map((c, i) => (
          <div key={i} style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2: Fleet Insight Cards */}
      {m.fleetInsights.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: m.fleetInsights.length >= 2 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 20 }}>
          {m.fleetInsights.map((ins, i) => (
            <div key={i} style={{
              background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`,
              borderLeft: `3px solid ${ins.accent}`, padding: "12px 16px",
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: colors.textSecondary, marginBottom: 6 }}>
                {ins.category}
              </div>
              <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.5 }}>{ins.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Row 3: By Vessel + By Reason */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartPanel title="NC days by vessel (30d)">
          <HorizontalBarChart data={m.ncByVessel} colorFn={d => d.value >= 10 ? colors.red : d.value >= 3 ? colors.amber : colors.green} onClickItem={handleVesselClick} />
        </ChartPanel>
        <ChartPanel title="NC days by reason (10d visible)">
          <HorizontalBarChart data={m.ncByReason} barColor={colors.teal} />
        </ChartPanel>
      </div>

      {/* Row 4: By Location + By Vessel Type */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartPanel title="NC days by location (30d)">
          <HorizontalBarChart data={m.ncByLocation} barColor={colors.blue} />
        </ChartPanel>
        <ChartPanel title="NC days by vessel type (30d)">
          <DonutChart data={m.ncByVesselType.map(d => ({ ...d, color: VESSEL_TYPE_COLORS[d.label] || colors.textSecondary }))} />
        </ChartPanel>
      </div>

      {/* Row 5: Trend + By Department */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartPanel title="Daily NC occurrences (10-day trend)">
          <TrendChart data={m.ncTrend} />
        </ChartPanel>
        <ChartPanel title="NC days by department (30d)">
          <HorizontalBarChart data={m.ncByDepartment} colorFn={d => DEPT_COLORS[d.label] || colors.teal} onClickItem={(d) => setExpandedDept(expandedDept === d.label ? null : d.label)} />
          {expandedDept && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: DEPT_COLORS[expandedDept], display: "inline-block" }} />
                {expandedDept} — by rank
                <span style={{ marginLeft: "auto", cursor: "pointer", color: colors.linkBlue, fontWeight: 500, fontSize: 11 }} onClick={() => setExpandedDept(null)}>Close</span>
              </div>
              <HorizontalBarChart data={getRanksForDept(expandedDept)} barColor={DEPT_COLORS[expandedDept] || colors.teal} />
            </div>
          )}
        </ChartPanel>
      </div>

      {/* Row 6: Repeat Offender Heatmap */}
      {heatmapCrew.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <ChartPanel title="Non-compliance patterns — top crew (10 days)">
            <div>
              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: "140px repeat(10, 1fr) 70px", gap: 2, marginBottom: 4, paddingLeft: 0 }}>
                <div />
                {heatmapCrew[0].timeline.length > 0 && [...heatmapCrew[0].timeline].reverse().map((d, i) => (
                  <div key={i} style={{ textAlign: "center", fontSize: 9, color: colors.textSecondary, fontWeight: i === 9 ? 600 : 400 }}>
                    {d.date.replace(/ \d{4}$/, "")}
                  </div>
                ))}
                <div style={{ textAlign: "center", fontSize: 9, color: colors.textSecondary, fontWeight: 600 }}>NCs</div>
              </div>
              {/* Crew rows */}
              {heatmapCrew.map(c => {
                const ncCount = c.timeline.filter(d => d.status === "fail").length;
                return (
                  <div key={c.id}
                    style={{ display: "grid", gridTemplateColumns: "140px repeat(10, 1fr) 70px", gap: 2, alignItems: "center", padding: "4px 0", cursor: "pointer", borderRadius: 4, transition: "background 0.15s" }}
                    onClick={() => handleCrewClick(c)}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: colors.linkBlue, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: colors.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.vesselName}</div>
                    </div>
                    {[...c.timeline].reverse().map((d, i) => (
                      <div key={i} title={`${d.date}: ${d.restH.toFixed(1)}h rest${d.reason ? ` — ${d.reason}` : ""}`}
                        style={{
                          height: 24, borderRadius: 3, margin: "0 1px",
                          background: d.status === "fail" ? "rgba(239,68,68,0.75)" : d.status === "manila" ? "rgba(245,158,11,0.5)" : "rgba(22,163,106,0.2)",
                        }} />
                    ))}
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: ncCount >= 5 ? colors.red : ncCount >= 3 ? colors.amber : colors.textSecondary }}>
                        {ncCount}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartPanel>
        </div>
      )}

      {/* Row 7: Crew Watch List */}
      <ChartPanel title="Crew watch list — persistent non-compliances">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={thStyle}>Seafarer</th>
              <th style={thStyle}>Vessel</th>
              <th style={{ ...thStyle, textAlign: "center" }}>NC days (30d)</th>
              <th style={{ ...thStyle, textAlign: "center" }}>10-day pattern</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Trend</th>
              <th style={thStyle}>Summary</th>
            </tr>
          </thead>
          <tbody>
            {m.watchListCrew.slice(0, 15).map(c => (
              <tr key={c.id}
                style={{ borderTop: `1px solid ${colors.border}`, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                onMouseLeave={e => e.currentTarget.style.background = colors.white}
                onClick={() => handleCrewClick(c)}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: colors.linkBlue }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: colors.textSecondary }}>{c.rank} — {c.dept}</div>
                </td>
                <td style={{ ...tdStyle, fontSize: 12, color: colors.textSecondary }}>{c.vesselName}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}><SeverityIndicator ncDays30={c.ncDays30} /></td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{dotTimeline(c.timeline)}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{trendIndicator(c.trend)}</td>
                <td style={tdStyle}>
                  <div style={{ fontSize: 12, color: colors.text }}>{c.streakDesc}</div>
                  {c.topReason && <div style={{ fontSize: 11, color: colors.textSecondary, fontStyle: "italic", marginTop: 2 }}>{c.topReason}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartPanel>
    </div>
  );
}

/* ─── SCREEN 1: Fleet Overview ─── */
function FleetOverview({ onSelectVessel, onSelectCrew, fleetView, setFleetView }) {
  const [sortBy, setSortBy] = useState("severity");
  const sorted = [...VESSEL_DATA].sort((a, b) => {
    if (sortBy === "severity") return b.ncDays30 - a.ncDays30 || b.activeNCs - a.activeNCs;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const toggleBtnStyle = (active) => ({
    padding: "6px 14px", fontSize: 12, fontWeight: 600, border: `1px solid ${active ? colors.primaryBtn : colors.border}`,
    background: active ? colors.primaryBtn : colors.white, color: active ? "#fff" : colors.text,
    cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>Fleet compliance overview</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textSecondary }}>
            {VESSEL_DATA.length} vessels &middot; Showing last 30 days &middot; Data as of {formatDate(0)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {fleetView === "table" && (
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 13, color: colors.text, background: colors.white, cursor: "pointer" }}>
              <option value="severity">Sort: Most urgent first</option>
              <option value="name">Sort: Vessel name</option>
            </select>
          )}
          {/* View toggle */}
          <div style={{ display: "flex", borderRadius: 6, overflow: "hidden" }}>
            <button onClick={() => setFleetView("table")} style={{ ...toggleBtnStyle(fleetView === "table"), borderRadius: "6px 0 0 6px", borderRight: "none" }}>Table</button>
            <button onClick={() => setFleetView("dashboard")} style={{ ...toggleBtnStyle(fleetView === "dashboard"), borderRadius: "0 6px 6px 0" }}>Dashboard</button>
          </div>
        </div>
      </div>

      {fleetView === "dashboard" ? (
        <FleetDashboard onSelectVessel={onSelectVessel} onSelectCrew={onSelectCrew} />
      ) : (
        <>
          {/* OCIMF threshold legend */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <span><strong>OCIMF/SIRE 2.0:</strong> Vessels with ≥3 NC days by any individual in any 30-day period are flagged for shore-side acknowledgement.</span>
          </div>

          <div style={{ background: colors.white, borderRadius: 10, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Vessel</th>
                  <th style={thStyle}>Regime</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Active NCs</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>NC days (30d)</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Crew timesheets</th>
                  <th style={thStyle}>Location</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Last synced</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((v, i) => {
                  const isOcimf = v.ncDays30 >= 3;
                  return (
                    <tr key={v.id}
                      onClick={() => onSelectVessel(v)}
                      style={{ borderTop: `1px solid ${colors.border}`, cursor: "pointer", background: isOcimf ? "#fffbeb" : colors.white, transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                      onMouseLeave={e => e.currentTarget.style.background = isOcimf ? "#fffbeb" : colors.white}
                    >
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: colors.linkBlue }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>IMO {v.imo} &middot; {v.type}</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 12 }}>{v.regime}</span>
                        {v.manila && <span style={{ display: "inline-block", marginLeft: 4, padding: "1px 5px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: colors.amberBg, color: colors.manilaAmber }}>+Manila</span>}
                        {v.opa90 && <span style={{ display: "inline-block", marginLeft: 4, padding: "1px 5px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: "#dbeafe", color: colors.blue }}>+OPA-90</span>}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {v.activeNCs > 0 ? (
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: colors.redBg, color: colors.red, fontWeight: 700, fontSize: 13 }}>{v.activeNCs}</span>
                        ) : (
                          <span style={{ color: colors.green }}>—</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <SeverityIndicator ncDays30={v.ncDays30} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{ color: v.completeness.split("/")[0] === v.completeness.split("/")[1] ? colors.textSecondary : colors.amber, fontWeight: v.completeness.split("/")[0] === v.completeness.split("/")[1] ? 400 : 600 }}>
                          {v.completeness}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 12, color: colors.textSecondary }}>{v.location}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <span style={{ fontSize: 12, color: v.lastSync.includes("12h") ? colors.amber : colors.textSecondary }}>{v.lastSync}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── SCREEN 2: Vessel Detail ─── */
function VesselDetail({ vessel, onBack, onSelectCrew, acknowledgements, onAcknowledge }) {
  const vesselData = VESSEL_DATA.find(v => v.id === vessel.id);
  const crew = vesselData.crew;
  const departments = ["Top Four", "Deck", "Engine", "Catering"].filter(d => crew.some(c => c.dept === d));
  const ncCrew = crew.filter(c => c.ncDays30 >= 3);

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: colors.linkBlue, cursor: "pointer", fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to fleet
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>{vessel.name}</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textSecondary }}>
            IMO {vessel.imo} &middot; {vessel.type} &middot; {vessel.regime}{vessel.manila ? " + Manila" : ""}{vessel.opa90 ? " + OPA-90" : ""} &middot; {vessel.location}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Crew onboard", value: vesselData.crewCount, sub: `${crew.filter(c => c.lastEntry === "Today").length} logged today`, color: colors.text },
          { label: "Active NCs (now)", value: vesselData.activeNCs, sub: vesselData.activeNCs > 0 ? "Rolling 24h or 7d" : "All compliant", color: vesselData.activeNCs > 0 ? colors.red : colors.green },
          { label: "NC days (30d)", value: vesselData.ncDays30, sub: vesselData.ncDays30 >= 3 ? "OCIMF threshold met" : "Below OCIMF threshold", color: vesselData.ncDays30 >= 3 ? colors.red : vesselData.ncDays30 > 0 ? colors.amber : colors.green },
          { label: "Last data sync", value: vessel.lastSync, sub: formatDate(0), color: colors.text },
        ].map((c, i) => (
          <div key={i} style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* OCIMF alert */}
      {ncCrew.length > 0 && (() => {
        const ncCrewStatuses = ncCrew.map(c => {
          const tsKey = `${vessel.id}-${c.id}`;
          const tsData = CREW_TIMESHEETS.get(tsKey);
          const status = getAckStatus(c.id, tsData ? tsData.displayDays : [], acknowledgements);
          return { ...c, ackStatus: status };
        });
        const pendingCrew = ncCrewStatuses.filter(c => c.ackStatus.needsAcknowledgement);
        const ackedCrew = ncCrewStatuses.filter(c => !c.ackStatus.needsAcknowledgement && c.ackStatus.latestAck);
        const allAcked = pendingCrew.length === 0 && ackedCrew.length > 0;

        const formatAckDate = (iso) => {
          const d = new Date(iso);
          const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        };

        return (
          <div style={{ background: allAcked ? colors.greenLight : colors.redLight, border: `1px solid ${allAcked ? colors.greenBg : "#fecaca"}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
            {allAcked ? (
              <>
                <div style={{ fontWeight: 700, color: colors.green, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>✓</span> All non-compliance acknowledged
                </div>
                {ackedCrew.map(c => (
                  <div key={c.id} style={{ color: "#166534", fontSize: 12, padding: "2px 0" }}>
                    {c.name} — {c.ackStatus.latestAck.acknowledgedBy}, {formatAckDate(c.ackStatus.latestAck.acknowledgedAt)}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, color: colors.red, marginBottom: 4 }}>⚠ Shore-side acknowledgement required</div>
                <div style={{ color: "#991b1b", marginBottom: ackedCrew.length > 0 ? 8 : 0 }}>
                  {pendingCrew.map(c => c.name).join(", ")} {pendingCrew.length === 1 ? "has" : "have"} ≥3 NC days in the last 30 days. Per OCIMF SIRE 2.0 guidance, select each crew member to review and acknowledge.
                </div>
                {ackedCrew.length > 0 && (
                  <div style={{ borderTop: "1px solid #fecaca", paddingTop: 8 }}>
                    {ackedCrew.map(c => (
                      <div key={c.id} style={{ color: colors.green, fontSize: 12, padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}>
                        <span>✓</span> {c.name} — Acknowledged by {c.ackStatus.latestAck.acknowledgedBy}, {formatAckDate(c.ackStatus.latestAck.acknowledgedAt)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* Crew roster by department */}
      {departments.map(dept => (
        <div key={dept} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{dept}</div>
          <div style={{ background: colors.white, borderRadius: 10, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Seafarer</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>24h compliance</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>7d compliance</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>NC days (30d)</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Rest (24h)</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Work (24h)</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Last entry</th>
                </tr>
              </thead>
              <tbody>
                {crew.filter(c => c.dept === dept).map((c, i) => {
                  const rowBg = (() => {
                    if (c.ncDays30 < 3) return colors.white;
                    const tsKey = `${vessel.id}-${c.id}`;
                    const tsData = CREW_TIMESHEETS.get(tsKey);
                    const status = getAckStatus(c.id, tsData ? tsData.displayDays : [], acknowledgements);
                    return status.needsAcknowledgement ? "#fffbeb" : colors.greenLight;
                  })();
                  return (
                  <tr key={c.id}
                    onClick={() => onSelectCrew(c)}
                    style={{ borderTop: `1px solid ${colors.border}`, cursor: "pointer", background: rowBg, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={e => e.currentTarget.style.background = rowBg}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: colors.linkBlue }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary }}>{c.rank}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={c.daily24h} /></td>
                    <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={c.weekly7d} /></td>
                    <td style={{ ...tdStyle, textAlign: "center" }}><SeverityIndicator ncDays30={c.ncDays30} /></td>
                    <td style={{ ...tdStyle, textAlign: "center", color: c.rest24h && parseFloat(c.rest24h) < 10 ? colors.red : colors.textSecondary, fontWeight: c.rest24h && parseFloat(c.rest24h) < 10 ? 600 : 400 }}>{c.rest24h || "—"}</td>
                    <td style={{ ...tdStyle, textAlign: "center", color: c.work24h && parseFloat(c.work24h) >= 14 ? colors.red : colors.textSecondary, fontWeight: c.work24h && parseFloat(c.work24h) >= 14 ? 600 : 400 }}>{c.work24h || "—"}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: c.lastEntry === "Today" ? colors.textSecondary : colors.amber }}>{c.lastEntry}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SCREEN 3: Seafarer Detail ─── */
function SeafarerDetail({ crew, vessel, onBack, acknowledgements, onAcknowledge }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const tsKey = `${vessel.id}-${crew.id}`;
  const tsData = CREW_TIMESHEETS.get(tsKey);
  const timesheetDays = tsData.displayDays;
  const summary = tsData.summary;
  const ganttPeriods = timesheetDays[selectedDay].ganttPeriods;
  const ackStatus = getAckStatus(crew.id, timesheetDays, acknowledgements);

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: colors.linkBlue, cursor: "pointer", fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to {vessel.name}
      </button>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>{crew.name}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textSecondary }}>
          {crew.rank} &middot; {vessel.name} &middot; {vessel.regime}{vessel.manila ? " + Manila" : ""}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>24h compliance</div>
          <Chip type={summary.daily24hCurrent} />
        </div>
        <div style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>7d compliance</div>
          <Chip type={summary.weekly7dCurrent} />
        </div>
        <div style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>NC days (30d)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: summary.ncDays30 >= 3 ? colors.red : summary.ncDays30 > 0 ? colors.amber : colors.green }}>{summary.ncDays30}</div>
        </div>
        <div style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>7d rest total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: summary.restTotal7d < 77 ? colors.red : colors.text }}>{summary.restTotal7d}h</div>
          <div style={{ fontSize: 11, color: colors.textSecondary }}>Required: ≥77h</div>
        </div>
      </div>

      {/* Acknowledgement panel */}
      {summary.ncDays30 >= 3 && (
        <AcknowledgementPanel
          vesselId={vessel.id}
          crew={crew}
          displayDays={timesheetDays}
          acknowledgements={acknowledgements}
          onAcknowledge={onAcknowledge}
        />
      )}

      {/* 24h hour-grid timeline */}
      <div style={{ background: colors.white, borderRadius: 10, border: `1px solid ${colors.border}`, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, fontSize: 14, fontWeight: 700, color: colors.text }}>
          {timesheetDays[selectedDay].date} — 24-hour timeline
        </div>
        <div style={{ overflowX: "auto" }}>
          {/* Single CSS Grid so header and data columns are inherently aligned */}
          <div style={{ display: "grid", gridTemplateColumns: "140px repeat(24, minmax(40px, 1fr))", minWidth: 900 }}>
            {/* ── Header row ── */}
            <div style={{ borderBottom: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}`, background: "#f8fafc" }} />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={`h${h}`} style={{ borderBottom: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}`, background: "#f8fafc", textAlign: "center", fontSize: 11, color: colors.textSecondary, padding: "5px 0" }}>
                {String(h).padStart(2, "0")}
              </div>
            ))}
            {/* ── Data row ── */}
            <div style={{ borderRight: `1px solid ${colors.border}`, padding: "10px 12px", background: "#fafbfc", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 64 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>{crew.name}</div>
              <div style={{ fontSize: 11, color: colors.textSecondary }}>{crew.rank}</div>
            </div>
            {/* 24 grid cells + absolutely-positioned blocks overlaid */}
            <div style={{ gridColumn: "2 / -1", position: "relative", minHeight: 64, display: "grid", gridTemplateColumns: "repeat(24, minmax(40px, 1fr))" }}>
              {Array.from({ length: 24 }, (_, h) => (
                <div key={`c${h}`} style={{ borderRight: `1px solid ${colors.border}`, background: h % 2 === 0 ? "#fafbfc" : colors.white }} />
              ))}
              {/* Work / Drill blocks positioned over the sub-grid */}
              {ganttPeriods.filter(p => p.type !== "rest").map((p, i) => {
                const isWork = p.type === "work";
                const isDrill = p.type === "drill";
                const cols = 24;
                return (
                  <div key={i} style={{
                    position: "absolute",
                    left: `calc(${(p.start / cols) * 100}% + 1px)`,
                    width: `calc(${((p.end - p.start) / cols) * 100}% - 3px)`,
                    top: 8, bottom: 8,
                    background: isDrill ? "#ede9fe" : "#dbeafe",
                    borderLeft: `3px solid ${isDrill ? "#8b5cf6" : "#3b82f6"}`,
                    borderRadius: "0 4px 4px 0",
                    padding: "4px 8px",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    zIndex: 1,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isDrill ? "#6d28d9" : "#1d4ed8", whiteSpace: "nowrap" }}>
                      {isDrill ? "Drill" : "Work"}
                    </div>
                    <div style={{ fontSize: 10, color: colors.textSecondary, whiteSpace: "nowrap" }}>
                      {String(Math.floor(p.start)).padStart(2, "0")}:{String(Math.round((p.start % 1) * 60)).padStart(2, "0")} – {String(Math.floor(p.end)).padStart(2, "0")}:{String(Math.round((p.end % 1) * 60)).padStart(2, "0")} · {p.end - p.start}h
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 16, padding: "8px 16px", borderTop: `1px solid ${colors.border}`, fontSize: 11, color: colors.textSecondary, background: "#f8fafc" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: "#dbeafe", border: "1px solid #93c5fd", display: "inline-block" }} />Work</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: "#ede9fe", border: "1px solid #c4b5fd", display: "inline-block" }} />Drill</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: "#f1f5f9", border: "1px solid #e2e8f0", display: "inline-block" }} />Rest</span>
        </div>
      </div>

      {/* Timesheet history table */}
      <div style={{ background: colors.white, borderRadius: 10, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, fontSize: 14, fontWeight: 700, color: colors.text }}>
          Recent timesheets
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Work</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Rest</th>
              <th style={{ ...thStyle, textAlign: "center" }}>24h</th>
              <th style={{ ...thStyle, textAlign: "center" }}>7d</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Intervals</th>
              <th style={thStyle}>NC reason</th>
            </tr>
          </thead>
          <tbody>
            {timesheetDays.map((t, i) => (
              <tr key={i}
                onClick={() => setSelectedDay(i)}
                style={{ borderTop: `1px solid ${colors.border}`, cursor: "pointer", background: selectedDay === i ? "#eff6ff" : colors.white, transition: "background 0.15s" }}
                onMouseEnter={e => { if (selectedDay !== i) e.currentTarget.style.background = "#f8fafc" }}
                onMouseLeave={e => { if (selectedDay !== i) e.currentTarget.style.background = colors.white }}
              >
                <td style={{ ...tdStyle, fontWeight: selectedDay === i ? 700 : 400 }}>{t.date}</td>
                <td style={tdStyle}><StatusBadge status={t.status} /></td>
                <td style={{ ...tdStyle, textAlign: "center", color: t.workH >= 14 ? colors.red : colors.textSecondary, fontWeight: t.workH >= 14 ? 600 : 400 }}>{t.work}</td>
                <td style={{ ...tdStyle, textAlign: "center", color: t.restH < 10 ? colors.red : colors.textSecondary, fontWeight: t.restH < 10 ? 600 : 400 }}>{t.rest}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={t.daily} /></td>
                <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={t.weekly} /></td>
                <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={t.intervals} /></td>
                <td style={{ ...tdStyle, color: t.reason ? colors.text : colors.textSecondary, fontStyle: t.reason ? "normal" : "italic" }}>
                  {t.reason || "—"}
                  {t.reason && ackStatus.ackedDateSet.has(t.date) && (
                    <span style={{ display: "inline-block", marginLeft: 6, padding: "1px 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: colors.greenBg, color: colors.green, fontStyle: "normal" }}>Ack'd</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Acknowledgement helper ─── */
function getAckStatus(crewId, displayDays, acknowledgements) {
  const crewAcks = acknowledgements.filter(a => a.crewId === crewId);
  const ackedDateSet = new Set(crewAcks.flatMap(a => a.ncDates));
  const ncDays = displayDays.filter(d => d.daily === "fail" || d.intervals === "fail");
  const unacked = ncDays.filter(d => !ackedDateSet.has(d.date));
  const acked = ncDays.filter(d => ackedDateSet.has(d.date));
  const latestAck = crewAcks.length > 0 ? crewAcks[crewAcks.length - 1] : null;
  return { crewAcks, ackedDateSet, unacked, acked, latestAck, needsAcknowledgement: unacked.length > 0 };
}

/* ─── Acknowledgement Panel ─── */
function AcknowledgementPanel({ vesselId, crew, displayDays, acknowledgements, onAcknowledge }) {
  const ncDays = displayDays.filter(d => d.daily === "fail" || d.intervals === "fail");
  const { ackedDateSet, unacked, latestAck, needsAcknowledgement } = getAckStatus(crew.id, displayDays, acknowledgements);
  const [selectedDates, setSelectedDates] = useState(() => new Set(unacked.map(d => d.date)));
  const [comment, setComment] = useState("");

  const toggleDate = (date) => {
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  };

  const handleAcknowledge = () => {
    if (selectedDates.size === 0) return;
    onAcknowledge({
      id: Date.now(),
      vesselId,
      crewId: crew.id,
      acknowledgedBy: "Kate Morrison",
      acknowledgedAt: new Date().toISOString(),
      ncDates: [...selectedDates],
      comment: comment.trim(),
    });
    setSelectedDates(new Set());
    setComment("");
  };

  const formatAckTime = (iso) => {
    const d = new Date(iso);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  // All NC days acknowledged
  if (!needsAcknowledgement && latestAck) {
    return (
      <div style={{ background: colors.greenLight, border: `1px solid ${colors.greenBg}`, borderRadius: 8, padding: "14px 16px", marginBottom: 20, fontSize: 13 }}>
        <div style={{ fontWeight: 700, color: colors.green, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 15 }}>✓</span> Acknowledged
        </div>
        <div style={{ color: "#166534", marginBottom: 4 }}>
          {ncDays.length} NC day{ncDays.length !== 1 ? "s" : ""} acknowledged by {latestAck.acknowledgedBy}
        </div>
        <div style={{ color: "#166534", fontSize: 12, marginBottom: latestAck.comment ? 8 : 0 }}>
          {formatAckTime(latestAck.acknowledgedAt)}
        </div>
        {latestAck.comment && (
          <div style={{ color: "#166534", fontSize: 12, fontStyle: "italic", borderTop: `1px solid ${colors.greenBg}`, paddingTop: 8, marginTop: 4 }}>
            "{latestAck.comment}"
          </div>
        )}
        <div style={{ color: "#166534", fontSize: 11, marginTop: 8 }}>
          Covers: {ncDays.map(d => d.date).join(", ")}
        </div>
      </div>
    );
  }

  // Needs acknowledgement
  return (
    <div style={{ background: colors.redLight, border: `1px solid #fecaca`, borderRadius: 8, padding: "14px 16px", marginBottom: 20, fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: colors.red, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 15 }}>⚠</span> Shore-side acknowledgement required
      </div>
      <div style={{ color: "#991b1b", marginBottom: 12 }}>
        {unacked.length} NC day{unacked.length !== 1 ? "s" : ""} in the last 30 days require acknowledgement.
      </div>

      {/* Unacknowledged NC days */}
      <div style={{ marginBottom: 12 }}>
        {unacked.map(d => (
          <label key={d.date} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer", color: "#991b1b" }}>
            <input
              type="checkbox"
              checked={selectedDates.has(d.date)}
              onChange={() => toggleDate(d.date)}
              style={{ accentColor: colors.red }}
            />
            <span style={{ fontWeight: 500 }}>{d.date}</span>
            <span style={{ color: "#b91c1c" }}>— Rest {d.rest}</span>
            {d.reason && <span style={{ color: "#b91c1c" }}>— {d.reason}</span>}
          </label>
        ))}
      </div>

      {/* Previously acknowledged NC days */}
      {ackedDateSet.size > 0 && (
        <div style={{ marginBottom: 12, paddingTop: 8, borderTop: "1px solid #fecaca" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>Previously acknowledged:</div>
          {ncDays.filter(d => ackedDateSet.has(d.date)).map(d => (
            <div key={d.date} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", color: colors.green, fontSize: 12 }}>
              <span>✓</span> {d.date} — Rest {d.rest}
            </div>
          ))}
        </div>
      )}

      {/* Comment */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#991b1b", marginBottom: 4 }}>Comment (optional):</div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add corrective actions or notes..."
          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #fecaca", fontSize: 12, fontFamily: "inherit", resize: "vertical", minHeight: 48, boxSizing: "border-box", background: "#fff" }}
        />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#991b1b" }}>Acknowledging as: <strong>Kate Morrison</strong></span>
        <button
          onClick={handleAcknowledge}
          disabled={selectedDates.size === 0}
          style={{
            background: selectedDates.size === 0 ? "#d1d5db" : colors.primaryBtn,
            color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            cursor: selectedDates.size === 0 ? "not-allowed" : "pointer",
          }}
        >
          Acknowledge ({selectedDates.size})
        </button>
      </div>
    </div>
  );
}

/* ─── shared table styles ─── */
const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#64748b" };
const tdStyle = { padding: "10px 14px" };

/* ─── Route helpers ─── */
function useRouteData() {
  const { vesselId, crewId } = useParams();
  const vessel = vesselId ? VESSEL_DATA.find(v => v.id === parseInt(vesselId, 10)) : null;
  const crew = vessel && crewId ? vessel.crew.find(c => c.id === parseInt(crewId, 10)) : null;
  return { vessel, crew };
}

function useFleetBase() {
  const location = useLocation();
  return location.pathname.startsWith("/dashboard") ? "dashboard" : "table";
}

/* ─── Breadcrumb ─── */
function Breadcrumb() {
  const { vessel, crew } = useRouteData();
  const base = useFleetBase();
  const basePath = `/${base}`;
  const baseLabel = base === "dashboard" ? "Fleet (Dashboard)" : "Fleet (Table)";

  return (
    <div style={{ padding: "10px 24px", fontSize: 12, color: colors.textSecondary, display: "flex", gap: 6, alignItems: "center" }}>
      <Link to={basePath} style={{ color: colors.linkBlue, fontWeight: 500, textDecoration: "none", cursor: "pointer" }}>
        {baseLabel}
      </Link>
      {vessel && (
        <>
          <span>/</span>
          {crew ? (
            <Link to={`${basePath}/vessel/${vessel.id}`} style={{ color: colors.linkBlue, fontWeight: 500, textDecoration: "none", cursor: "pointer" }}>
              {vessel.name}
            </Link>
          ) : (
            <span style={{ color: colors.textSecondary, fontWeight: 500 }}>{vessel.name}</span>
          )}
        </>
      )}
      {crew && (
        <>
          <span>/</span>
          <span style={{ color: colors.textSecondary }}>{crew.name}</span>
        </>
      )}
    </div>
  );
}

/* ─── Routed wrappers ─── */
function RoutedFleetOverview() {
  const navigate = useNavigate();
  const base = useFleetBase();

  return (
    <FleetOverview
      onSelectVessel={v => navigate(`/${base}/vessel/${v.id}`)}
      onSelectCrew={(v, c) => navigate(`/${base}/vessel/${v.id}/crew/${c.id}`)}
      fleetView={base}
      setFleetView={view => navigate(`/${view}`)}
    />
  );
}

function VesselDetailRoute({ acknowledgements, onAcknowledge }) {
  const navigate = useNavigate();
  const base = useFleetBase();
  const { vessel } = useRouteData();

  if (!vessel) return <Navigate to="/table" replace />;

  return (
    <VesselDetail
      vessel={vessel}
      onBack={() => navigate(`/${base}`)}
      onSelectCrew={c => navigate(`/${base}/vessel/${vessel.id}/crew/${c.id}`)}
      acknowledgements={acknowledgements}
      onAcknowledge={onAcknowledge}
    />
  );
}

function SeafarerDetailRoute({ acknowledgements, onAcknowledge }) {
  const navigate = useNavigate();
  const base = useFleetBase();
  const { vessel, crew } = useRouteData();

  if (!vessel || !crew) return <Navigate to="/table" replace />;

  return (
    <SeafarerDetail
      crew={crew}
      vessel={vessel}
      onBack={() => navigate(`/${base}/vessel/${vessel.id}`)}
      acknowledgements={acknowledgements}
      onAcknowledge={onAcknowledge}
    />
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [acknowledgements, setAcknowledgements] = useState([]);
  const handleAcknowledge = (ack) => setAcknowledgements(prev => [...prev, ack]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: colors.text }}>
      {/* Sidebar */}
      <div style={{ width: 52, background: colors.sidebar, borderRight: "1px solid #2d3f52", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>O</span>
        </div>
        {["📊", "🚢", "📋", "👥", "⚙"].map((icon, i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, background: i === 0 ? "rgba(14,165,233,0.18)" : "transparent", cursor: "pointer", fontSize: 16 }}>
            {icon}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, background: colors.bg, overflow: "auto" }}>
        {/* Top bar */}
        <div style={{ background: colors.navBg, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>Hours of work and rest</span>
            <span style={{ fontSize: 12, color: "#94a3b8", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>Shore-side</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Help & support</span>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>KM</div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumb />

        {/* Content */}
        <div style={{ padding: "0 24px 40px" }}>
          <Routes>
            <Route path="/table" element={<RoutedFleetOverview />} />
            <Route path="/dashboard" element={<RoutedFleetOverview />} />
            <Route path="/table/vessel/:vesselId" element={<VesselDetailRoute acknowledgements={acknowledgements} onAcknowledge={handleAcknowledge} />} />
            <Route path="/dashboard/vessel/:vesselId" element={<VesselDetailRoute acknowledgements={acknowledgements} onAcknowledge={handleAcknowledge} />} />
            <Route path="/table/vessel/:vesselId/crew/:crewId" element={<SeafarerDetailRoute acknowledgements={acknowledgements} onAcknowledge={handleAcknowledge} />} />
            <Route path="/dashboard/vessel/:vesselId/crew/:crewId" element={<SeafarerDetailRoute acknowledgements={acknowledgements} onAcknowledge={handleAcknowledge} />} />
            <Route path="*" element={<Navigate to="/table" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
