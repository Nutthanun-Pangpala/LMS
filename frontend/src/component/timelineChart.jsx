import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from "recharts";

const SEVERITY_COLORS = {
  error:   { stroke: "#c0392b", fill: "#c0392b" },
  warning: { stroke: "#d4860a", fill: "#d4860a" },
  info:    { stroke: "#2c5cc5", fill: "#2c5cc5" },
  debug:   { stroke: "#6060a0", fill: "#6060a0" },
};

const SEVERITIES = ["error", "warning", "info", "debug"];

// Group logs by date bucket (hour if ≤2 days, else day)
function bucketLogs(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return [];

  const timestamps = logs
    .map((l) => new Date(l.at_timestamp || l.timestamp))
    .filter((d) => !isNaN(d));

  if (timestamps.length === 0) return [];

  const minT = Math.min(...timestamps);
  const maxT = Math.max(...timestamps);
  const spanHours = (maxT - minT) / 3_600_000;
  const byHour = spanHours <= 48;

  const buckets = {};
  logs.forEach((log) => {
    const d = new Date(log.at_timestamp || log.timestamp);
    if (isNaN(d)) return;
    const key = byHour
      ? `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { time: key, error: 0, warning: 0, info: 0, debug: 0 };
    const sev = String(log.severity ?? "").toLowerCase();
    if (sev in buckets[key]) buckets[key][sev]++;
    else buckets[key].debug++;
  });

  return Object.values(buckets).sort((a, b) => a.time.localeCompare(b.time));
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div style={{
      background: "var(--tc-bg)",
      border: "1px solid var(--tc-border)",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "12.5px",
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      minWidth: "140px",
    }}>
      <p style={{ margin: "0 0 8px", fontWeight: 600, color: "var(--tc-text)", fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </p>
      {payload.map((p) => p.value > 0 && (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: "16px", color: "var(--tc-muted)", margin: "3px 0" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
            {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
          </span>
          <span style={{ fontWeight: 600, color: p.color }}>{p.value}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid var(--tc-border)", marginTop: "8px", paddingTop: "6px", display: "flex", justifyContent: "space-between", color: "var(--tc-text)", fontWeight: 600 }}>
        <span>Total</span><span>{total}</span>
      </div>
    </div>
  );
}

function TimelineChart({ logs = [] }) {
  const data = useMemo(() => bucketLogs(logs), [logs]);
  const activeSeverities = useMemo(() =>
    SEVERITIES.filter((s) => data.some((d) => d[s] > 0)),
    [data]
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --tc-bg: #ffffff;
          --tc-bg2: #f7f7fa;
          --tc-border: #e8e8ed;
          --tc-text: #111118;
          --tc-muted: #7878a0;
          --tc-head: #f4f4f8;
          --tc-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --tc-bg: #16161e;
            --tc-bg2: #1c1c28;
            --tc-border: #2a2a3a;
            --tc-text: #ededf5;
            --tc-muted: #7070a0;
            --tc-head: #1e1e2c;
            --tc-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);
          }
        }
        .tc-wrap {
          background: var(--tc-bg);
          border-radius: 14px;
          box-shadow: var(--tc-shadow);
          overflow: hidden;
        }
        .tc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 0;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tc-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--tc-text);
          letter-spacing: -0.01em;
          margin: 0;
        }
        .tc-legend {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .tc-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--tc-muted);
          font-weight: 500;
        }
        .tc-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--tc-muted);
          font-size: 14px;
        }
      `}</style>

      <div className="tc-wrap">
        <div className="tc-header">
          <p className="tc-title">Log activity over time</p>
          <div className="tc-legend">
            {activeSeverities.map((s) => (
              <span key={s} className="tc-legend-item">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_COLORS[s].stroke, display: "inline-block" }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: "12px 8px 16px" }}>
          {data.length === 0 ? (
            <div className="tc-empty">No data to display</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <defs>
                  {activeSeverities.map((s) => (
                    <linearGradient key={s} id={`grad-${s}`} x1="0" y1="0" x2="0" y2="1">
                      <stop key="top"    offset="5%"  stopColor={SEVERITY_COLORS[s].fill} stopOpacity={0.15} />
                      <stop key="bottom" offset="95%" stopColor={SEVERITY_COLORS[s].fill} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--tc-border)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "var(--tc-muted)", fontFamily: "DM Sans" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--tc-muted)", fontFamily: "DM Sans" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--tc-border)", strokeWidth: 1 }} />
                {activeSeverities.map((s) => (
                  <Area
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={SEVERITY_COLORS[s].stroke}
                    strokeWidth={2}
                    fill={`url(#grad-${s})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineChart;