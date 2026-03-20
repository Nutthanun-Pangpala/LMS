import { AlertTriangle, FileText, Info, XCircle } from "lucide-react";

// ESLint-safe: lookup by string key แทน destructure เป็น component โดยตรง
const CARD_ICONS = { FileText, XCircle, AlertTriangle, Info };

function StatsCards({ logs = [], pagination = null }) {
  const safeList = Array.isArray(logs) ? logs : [];

  const bySeverity = (sev) =>
    safeList.filter((l) => String(l.severity ?? "").toLowerCase() === sev).length;

  const total    = pagination?.total ?? safeList.length;
  const errors   = bySeverity("error");
  const warnings = bySeverity("warning");
  const infos    = bySeverity("info");

  const cards = [
    { label: "Total Logs", value: total,    icon: "FileText",      color: "#5b5bd6", bg: "#ededfb", border: "#c8c8f4" },
    { label: "Errors",     value: errors,   icon: "XCircle",       color: "#c0392b", bg: "#fff0f0", border: "#fad4d4" },
    { label: "Warnings",   value: warnings, icon: "AlertTriangle", color: "#92660a", bg: "#fffbea", border: "#f5e4a0" },
    { label: "Info",       value: infos,    icon: "Info",          color: "#2c5cc5", bg: "#eef4ff", border: "#c5d8f8" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "12px",
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
    }}>
      <style>{`
        @media (prefers-color-scheme: dark) {
          .sc-card { background: #1e1e2c !important; border-color: #2e2e3e !important; }
          .sc-label { color: #8888a8 !important; }
          .sc-value { color: #ededf5 !important; }
        }
      `}</style>

      {cards.map(({ label, value, icon, color, bg, border }) => {
        const Icon = CARD_ICONS[icon];
        return (
          <div
            key={label}
            className="sc-card"
            style={{
              background: "#ffffff",
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: bg, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="sc-label" style={{ fontSize: "12px", color: "#7878a0", margin: 0, fontWeight: 500 }}>
                {label}
              </p>
              <p className="sc-value" style={{ fontSize: "22px", fontWeight: 600, color: "#111118", margin: "2px 0 0", lineHeight: 1.2 }}>
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;