import { useState } from "react";

const VESSELS = [
  { id: 1, name: "MV Pacific Voyager", imo: "9876543", type: "Bulk Carrier", regime: "STCW Core", manila: false, opa90: false, crewCount: 22, lastSync: "2h ago", ncDays30: 5, activeNCs: 2, completeness: "22/22", location: "At Sea — South China Sea" },
  { id: 2, name: "MT Coral Stream", imo: "9812345", type: "Oil Tanker", regime: "STCW Core", manila: true, opa90: true, crewCount: 28, lastSync: "45m ago", ncDays30: 3, activeNCs: 1, completeness: "28/28", location: "Houston, TX — US Waters" },
  { id: 3, name: "MV Northern Spirit", imo: "9823456", type: "Container", regime: "MLC-A", manila: false, opa90: false, crewCount: 24, lastSync: "1h ago", ncDays30: 0, activeNCs: 0, completeness: "24/24", location: "Rotterdam" },
  { id: 4, name: "MV Atlas Pioneer", imo: "9834567", type: "Bulk Carrier", regime: "STCW Core", manila: true, opa90: false, crewCount: 21, lastSync: "3h ago", ncDays30: 1, activeNCs: 0, completeness: "20/21", location: "Singapore Strait" },
  { id: 5, name: "MT Sea Falcon", imo: "9845678", type: "Chemical Tanker", regime: "MLC-B", manila: false, opa90: false, crewCount: 25, lastSync: "30m ago", ncDays30: 0, activeNCs: 0, completeness: "25/25", location: "At Sea — Mediterranean" },
  { id: 6, name: "MV Cape Hector", imo: "9856789", type: "Container", regime: "STCW Core", manila: false, opa90: false, crewCount: 23, lastSync: "6h ago", ncDays30: 2, activeNCs: 1, completeness: "21/23", location: "Piraeus" },
  { id: 7, name: "MV Ocean Grace", imo: "9867890", type: "General Cargo", regime: "STCW Core", manila: false, opa90: false, crewCount: 18, lastSync: "12h ago", ncDays30: 0, activeNCs: 0, completeness: "16/18", location: "At Sea — Indian Ocean" },
  { id: 8, name: "MT Dawn Carrier", imo: "9878901", type: "Oil Tanker", regime: "STCW Core", manila: true, opa90: false, crewCount: 27, lastSync: "2h ago", ncDays30: 0, activeNCs: 0, completeness: "27/27", location: "Fujairah" },
];

const CREW_PACIFIC = [
  { id: 1, name: "Bessie Cooper", rank: "Master", dept: "Top Four", daily24h: "fail", weekly7d: "pass", ncDays30: 3, lastEntry: "Today", restToday: "8.0h", workToday: "14.0h" },
  { id: 2, name: "Savannah Nguyen", rank: "Chief Officer", dept: "Top Four", daily24h: "pass", weekly7d: "fail", ncDays30: 4, lastEntry: "Today", restToday: "10.5h", workToday: "11.5h" },
  { id: 3, name: "Guy Hawkins", rank: "Chief Engineer", dept: "Top Four", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "12.0h", workToday: "10.0h" },
  { id: 4, name: "Darrell Steward", rank: "2nd Engineer", dept: "Top Four", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "11.0h", workToday: "11.0h" },
  { id: 5, name: "Cody Fisher", rank: "2nd Officer", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 1, lastEntry: "Today", restToday: "10.0h", workToday: "12.0h" },
  { id: 6, name: "Albert Flores", rank: "3rd Officer", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Yesterday", restToday: "11.5h", workToday: "10.5h" },
  { id: 7, name: "Jane Cooper", rank: "Bosun", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "13.0h", workToday: "9.0h" },
  { id: 8, name: "Kristin Watson", rank: "AB", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "14.0h", workToday: "8.0h" },
  { id: 9, name: "Devon Lane", rank: "AB", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "14.0h", workToday: "8.0h" },
  { id: 10, name: "Robert Fox", rank: "3rd Engineer", dept: "Engine", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "12.0h", workToday: "10.0h" },
  { id: 11, name: "Floyd Miles", rank: "Electrician", dept: "Engine", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "14.0h", workToday: "8.0h" },
  { id: 12, name: "Cameron Smith", rank: "Oiler", dept: "Engine", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Yesterday", restToday: "14.0h", workToday: "8.0h" },
];

const CREW_CORAL = [
  { id: 20, name: "Marcus Chen", rank: "Master", dept: "Top Four", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "11.0h", workToday: "11.0h" },
  { id: 21, name: "Elena Vasquez", rank: "Chief Officer", dept: "Top Four", daily24h: "pass", weekly7d: "pass", ncDays30: 1, lastEntry: "Today", restToday: "10.5h", workToday: "11.5h" },
  { id: 22, name: "Raj Patel", rank: "Chief Engineer", dept: "Top Four", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "12.0h", workToday: "10.0h" },
  { id: 23, name: "Viktor Nowak", rank: "2nd Engineer", dept: "Top Four", daily24h: "fail", weekly7d: "manila", ncDays30: 3, lastEntry: "Today", restToday: "8.5h", workToday: "13.5h" },
  { id: 24, name: "James O'Brien", rank: "2nd Officer", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "10.0h", workToday: "12.0h" },
  { id: 25, name: "Yuki Tanaka", rank: "3rd Officer", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "14.0h", workToday: "8.0h" },
  { id: 26, name: "Dmitri Volkov", rank: "Bosun", dept: "Deck", daily24h: "pass", weekly7d: "pass", ncDays30: 0, lastEntry: "Today", restToday: "13.0h", workToday: "9.0h" },
];

const TIMESHEET_DATA = [
  { date: "25 Mar 2026", status: "submitted", work: "14.0h", rest: "8.0h", daily: "fail", weekly: "pass", intervals: "pass", reason: "Mooring operations" },
  { date: "24 Mar 2026", status: "approved", work: "12.0h", rest: "10.0h", daily: "pass", weekly: "fail", intervals: "pass", reason: null },
  { date: "23 Mar 2026", status: "approved", work: "13.5h", rest: "8.5h", daily: "fail", weekly: "fail", intervals: "pass", reason: "Cargo operations" },
  { date: "22 Mar 2026", status: "approved", work: "10.0h", rest: "12.0h", daily: "pass", weekly: "pass", intervals: "pass", reason: null },
  { date: "21 Mar 2026", status: "approved", work: "8.0h", rest: "14.0h", daily: "pass", weekly: "pass", intervals: "pass", reason: null },
  { date: "20 Mar 2026", status: "approved", work: "13.0h", rest: "9.0h", daily: "fail", weekly: "pass", intervals: "fail", reason: "Port entry — Rotterdam" },
  { date: "19 Mar 2026", status: "approved", work: "8.0h", rest: "14.0h", daily: "pass", weekly: "pass", intervals: "pass", reason: null },
  { date: "18 Mar 2026", status: "approved", work: "8.0h", rest: "14.0h", daily: "pass", weekly: "pass", intervals: "pass", reason: null },
  { date: "17 Mar 2026", status: "approved", work: "10.0h", rest: "12.0h", daily: "pass", weekly: "pass", intervals: "pass", reason: null },
  { date: "16 Mar 2026", status: "approved", work: "8.0h", rest: "14.0h", daily: "pass", weekly: "pass", intervals: "pass", reason: null },
];

const GANTT_PERIODS = [
  { start: 0, end: 5, type: "rest" },
  { start: 5, end: 9, type: "work" },
  { start: 9, end: 10, type: "rest" },
  { start: 10, end: 13, type: "drill" },
  { start: 13, end: 14, type: "rest" },
  { start: 14, end: 22, type: "work" },
  { start: 22, end: 24, type: "rest" },
];

/* ─── styles ─── */
const colors = {
  bg: "#f5f7fa",
  white: "#ffffff",
  sidebar: "#1a2332",
  sidebarActive: "#0d8a8a",
  text: "#1e293b",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  teal: "#0d9488",
  tealLight: "#ccfbf1",
  red: "#dc2626",
  redLight: "#fef2f2",
  redBg: "#fee2e2",
  amber: "#d97706",
  amberLight: "#fffbeb",
  amberBg: "#fef3c7",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  greenBg: "#dcfce7",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  manilaAmber: "#b45309",
};

function Chip({ type, label }) {
  const styles = {
    pass: { bg: colors.greenBg, color: colors.green, dot: colors.green },
    fail: { bg: colors.redBg, color: colors.red, dot: colors.red },
    manila: { bg: colors.amberBg, color: colors.manilaAmber, dot: colors.manilaAmber },
    cooldown: { bg: "#dbeafe", color: colors.blue, dot: colors.blue },
  };
  const s = styles[type] || styles.pass;
  const labels = { pass: "Pass", fail: "Fail", manila: "Manila", cooldown: "Cooldown" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
      {label || labels[type]}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    submitted: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Submitted" },
    approved: { bg: colors.greenLight, color: colors.green, border: "#bbf7d0", label: "Approved" },
    waiting: { bg: "#fffbeb", color: colors.amber, border: "#fde68a", label: "Waiting" },
    rejected: { bg: colors.redLight, color: colors.red, border: "#fecaca", label: "Rejected" },
  };
  const s = map[status] || map.submitted;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

function SeverityIndicator({ ncDays30 }) {
  if (ncDays30 >= 3) return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: colors.red, fontWeight: 700, fontSize: 13 }}>⚠ {ncDays30}</span>;
  if (ncDays30 > 0) return <span style={{ color: colors.amber, fontWeight: 600, fontSize: 13 }}>{ncDays30}</span>;
  return <span style={{ color: colors.green, fontWeight: 500, fontSize: 13 }}>0</span>;
}

/* ─── SCREEN 1: Fleet Overview ─── */
function FleetOverview({ onSelectVessel }) {
  const [sortBy, setSortBy] = useState("severity");
  const sorted = [...VESSELS].sort((a, b) => {
    if (sortBy === "severity") return b.ncDays30 - a.ncDays30 || b.activeNCs - a.activeNCs;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>Fleet compliance overview</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textSecondary }}>
            {VESSELS.length} vessels &middot; Showing last 30 days &middot; Data as of 25 Mar 2026
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 13, color: colors.text, background: colors.white, cursor: "pointer" }}>
            <option value="severity">Sort: Most urgent first</option>
            <option value="name">Sort: Vessel name</option>
          </select>
        </div>
      </div>

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
                  style={{ borderTop: `1px solid ${colors.border}`, cursor: "pointer", background: isOcimf ? "#fffbeb" : i % 2 === 0 ? colors.white : "#fafbfc", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdfa"}
                  onMouseLeave={e => e.currentTarget.style.background = isOcimf ? "#fffbeb" : i % 2 === 0 ? colors.white : "#fafbfc"}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: colors.teal }}>{v.name}</div>
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
    </div>
  );
}

/* ─── SCREEN 2: Vessel Detail ─── */
function VesselDetail({ vessel, onBack, onSelectCrew }) {
  const crew = vessel.id === 1 ? CREW_PACIFIC : vessel.id === 2 ? CREW_CORAL : CREW_PACIFIC.slice(0, 6);
  const departments = [...new Set(crew.map(c => c.dept))];
  const ncCrew = crew.filter(c => c.ncDays30 >= 3);

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: colors.teal, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
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
          { label: "Crew onboard", value: vessel.crewCount, sub: `${crew.filter(c => c.lastEntry === "Today").length} logged today`, color: colors.text },
          { label: "Active NCs (now)", value: vessel.activeNCs, sub: vessel.activeNCs > 0 ? "Rolling 24h or 7d" : "All compliant", color: vessel.activeNCs > 0 ? colors.red : colors.green },
          { label: "NC days (30d)", value: vessel.ncDays30, sub: vessel.ncDays30 >= 3 ? "OCIMF threshold met" : "Below OCIMF threshold", color: vessel.ncDays30 >= 3 ? colors.red : vessel.ncDays30 > 0 ? colors.amber : colors.green },
          { label: "Last data sync", value: vessel.lastSync, sub: "25 Mar 2026", color: colors.text },
        ].map((c, i) => (
          <div key={i} style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* OCIMF alert */}
      {ncCrew.length > 0 && (
        <div style={{ background: colors.redLight, border: `1px solid #fecaca`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: colors.red, marginBottom: 4 }}>⚠ Shore-side acknowledgement required</div>
          <div style={{ color: "#991b1b" }}>
            {ncCrew.map(c => c.name).join(", ")} {ncCrew.length === 1 ? "has" : "have"} ≥3 NC days in the last 30 days. Per OCIMF SIRE 2.0 guidance, this must be acknowledged by shore management.
          </div>
        </div>
      )}

      {/* Crew roster by department */}
      {departments.map(dept => (
        <div key={dept} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{dept}</div>
          <div style={{ background: colors.white, borderRadius: 10, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Seafarer</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>24h compliance</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>7d compliance</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>NC days (30d)</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Rest today</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Work today</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Last entry</th>
                </tr>
              </thead>
              <tbody>
                {crew.filter(c => c.dept === dept).map((c, i) => (
                  <tr key={c.id}
                    onClick={() => onSelectCrew(c)}
                    style={{ borderTop: `1px solid ${colors.border}`, cursor: "pointer", background: c.ncDays30 >= 3 ? "#fffbeb" : "transparent", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0fdfa"}
                    onMouseLeave={e => e.currentTarget.style.background = c.ncDays30 >= 3 ? "#fffbeb" : "transparent"}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: colors.text }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary }}>{c.rank}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={c.daily24h} /></td>
                    <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={c.weekly7d} /></td>
                    <td style={{ ...tdStyle, textAlign: "center" }}><SeverityIndicator ncDays30={c.ncDays30} /></td>
                    <td style={{ ...tdStyle, textAlign: "center", color: colors.textSecondary }}>{c.restToday}</td>
                    <td style={{ ...tdStyle, textAlign: "center", color: parseFloat(c.workToday) >= 14 ? colors.red : colors.textSecondary, fontWeight: parseFloat(c.workToday) >= 14 ? 600 : 400 }}>{c.workToday}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: c.lastEntry === "Today" ? colors.textSecondary : colors.amber }}>{c.lastEntry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SCREEN 3: Seafarer Detail ─── */
function SeafarerDetail({ crew, vessel, onBack }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const ts = TIMESHEET_DATA[selectedDay];

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: colors.teal, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
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
          <Chip type={crew.daily24h} />
        </div>
        <div style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>7d compliance</div>
          <Chip type={crew.weekly7d} />
        </div>
        <div style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>NC days (30d)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: crew.ncDays30 >= 3 ? colors.red : crew.ncDays30 > 0 ? colors.amber : colors.green }}>{crew.ncDays30}</div>
        </div>
        <div style={{ background: colors.white, borderRadius: 8, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>7d rest total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.text }}>74.5h</div>
          <div style={{ fontSize: 11, color: colors.textSecondary }}>Required: ≥77h</div>
        </div>
      </div>

      {/* 24h Gantt for selected day */}
      <div style={{ background: colors.white, borderRadius: 10, border: `1px solid ${colors.border}`, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
          {TIMESHEET_DATA[selectedDay].date} — 24-hour timeline
        </div>
        <div style={{ position: "relative", height: 44, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
          {GANTT_PERIODS.map((p, i) => {
            const left = `${(p.start / 24) * 100}%`;
            const width = `${((p.end - p.start) / 24) * 100}%`;
            const bg = p.type === "work" ? "#0d9488" : p.type === "drill" ? "#f59e0b" : "#e2e8f0";
            const fg = p.type === "rest" ? "#94a3b8" : "#fff";
            return (
              <div key={i} style={{ position: "absolute", left, width, top: 4, bottom: 4, background: bg, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: fg, textTransform: "uppercase" }}>
                {p.end - p.start >= 2 && (p.type === "work" ? `Work ${p.end - p.start}h` : p.type === "drill" ? `Drill ${p.end - p.start}h` : `Rest ${p.end - p.start}h`)}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: colors.textSecondary }}>
          {Array.from({ length: 13 }, (_, i) => <span key={i}>{String(i * 2).padStart(2, "0")}:00</span>)}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: colors.textSecondary }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#0d9488" }} />Work</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#e2e8f0" }} />Rest</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b" }} />Drill</span>
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
            {TIMESHEET_DATA.map((t, i) => (
              <tr key={i}
                onClick={() => setSelectedDay(i)}
                style={{ borderTop: `1px solid ${colors.border}`, cursor: "pointer", background: selectedDay === i ? "#f0fdfa" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => { if (selectedDay !== i) e.currentTarget.style.background = "#fafbfc" }}
                onMouseLeave={e => { if (selectedDay !== i) e.currentTarget.style.background = "transparent" }}
              >
                <td style={{ ...tdStyle, fontWeight: selectedDay === i ? 700 : 400 }}>{t.date}</td>
                <td style={tdStyle}><StatusBadge status={t.status} /></td>
                <td style={{ ...tdStyle, textAlign: "center", color: parseFloat(t.work) >= 14 ? colors.red : colors.textSecondary, fontWeight: parseFloat(t.work) >= 14 ? 600 : 400 }}>{t.work}</td>
                <td style={{ ...tdStyle, textAlign: "center", color: parseFloat(t.rest) < 10 ? colors.red : colors.textSecondary, fontWeight: parseFloat(t.rest) < 10 ? 600 : 400 }}>{t.rest}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={t.daily} /></td>
                <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={t.weekly} /></td>
                <td style={{ ...tdStyle, textAlign: "center" }}><Chip type={t.intervals} /></td>
                <td style={{ ...tdStyle, color: t.reason ? colors.text : colors.textSecondary, fontStyle: t.reason ? "normal" : "italic" }}>{t.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── shared table styles ─── */
const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" };
const tdStyle = { padding: "10px 14px" };

/* ─── MAIN APP ─── */
export default function App() {
  const [screen, setScreen] = useState("fleet");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedCrew, setSelectedCrew] = useState(null);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: colors.text }}>
      {/* Sidebar */}
      <div style={{ width: 52, background: colors.sidebar, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: colors.sidebarActive, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>O</span>
        </div>
        {["📊", "🚢", "📋", "👥", "⚙"].map((icon, i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, background: i === 0 ? "rgba(13,148,136,0.2)" : "transparent", cursor: "pointer", fontSize: 16 }}>
            {icon}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, background: colors.bg, overflow: "auto" }}>
        {/* Top bar */}
        <div style={{ background: colors.white, borderBottom: `1px solid ${colors.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>Hours of work and rest</span>
            <span style={{ fontSize: 12, color: colors.textSecondary, background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>Shore-side</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: colors.textSecondary }}>Help & support</span>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: colors.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>KM</div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div style={{ padding: "10px 24px", fontSize: 12, color: colors.textSecondary, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ cursor: "pointer", color: colors.teal, fontWeight: 500 }} onClick={() => { setScreen("fleet"); setSelectedVessel(null); setSelectedCrew(null); }}>Fleet</span>
          {selectedVessel && (
            <>
              <span>/</span>
              <span style={{ cursor: selectedCrew ? "pointer" : "default", color: selectedCrew ? colors.teal : colors.textSecondary, fontWeight: 500 }}
                onClick={() => { if (selectedCrew) { setScreen("vessel"); setSelectedCrew(null); } }}>
                {selectedVessel.name}
              </span>
            </>
          )}
          {selectedCrew && (
            <>
              <span>/</span>
              <span style={{ color: colors.textSecondary }}>{selectedCrew.name}</span>
            </>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "0 24px 40px" }}>
          {screen === "fleet" && (
            <FleetOverview onSelectVessel={v => { setSelectedVessel(v); setScreen("vessel"); }} />
          )}
          {screen === "vessel" && selectedVessel && (
            <VesselDetail
              vessel={selectedVessel}
              onBack={() => { setScreen("fleet"); setSelectedVessel(null); }}
              onSelectCrew={c => { setSelectedCrew(c); setScreen("seafarer"); }}
            />
          )}
          {screen === "seafarer" && selectedCrew && selectedVessel && (
            <SeafarerDetail
              crew={selectedCrew}
              vessel={selectedVessel}
              onBack={() => { setScreen("vessel"); setSelectedCrew(null); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
