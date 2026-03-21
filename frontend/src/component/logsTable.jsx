import { AlertTriangle, CheckCircle, ChevronDown, ChevronsUpDown, ChevronUp, Info, Terminal, XCircle, Zap } from "lucide-react";
import { useState } from "react";

const SEVERITY_CONFIG = {
  critical: { bg: "#fff0f0", color: "#c0392b", border: "#fad4d4", icon: XCircle, label: "Critical" },
  error:    { bg: "#fff4ed", color: "#c0511a", border: "#fad9c0", icon: AlertTriangle, label: "Error" },
  warning:  { bg: "#fffbea", color: "#92660a", border: "#f5e4a0", icon: AlertTriangle, label: "Warning" },
  info:     { bg: "#eef4ff", color: "#2c5cc5", border: "#c5d8f8", icon: Info, label: "Info" },
  success:  { bg: "#eefaf3", color: "#1a7f45", border: "#b8ecd1", icon: CheckCircle, label: "Success" },
  debug:    { bg: "#f4f4f8", color: "#6060a0", border: "#d0d0e8", icon: Terminal, label: "Debug" },
};

const SEVERITY_INT_MAP = { 5: "critical", 4: "error", 3: "warning", 2: "info", 1: "debug", 0: "success" };

const getSeverityConfig = (sev) => {
  const key = typeof sev === "number"
    ? (SEVERITY_INT_MAP[sev] ?? "debug")
    : String(sev ?? "").toLowerCase();
  return SEVERITY_CONFIG[key] || {
    bg: "#f4f4f7", color: "#555570", border: "#d8d8e8", icon: Zap, label: key || "—",
  };
};

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown size={12} style={{ opacity: 0.35 }} />;
  return sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

function LogsTable({ logs = [], pagination = null, onPageChange = () => {} }) {
  const [sortCol, setSortCol] = useState("at_timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [expanded, setExpanded] = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sorted = [...logs].sort((a, b) => {
    let av = a[sortCol] ?? "", bv = b[sortCol] ?? "";
    if (sortCol === "at_timestamp") { av = new Date(av); bv = new Date(bv); }
    else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const columns = [
    { key: "at_timestamp", label: "Timestamp", width: "160px" },
    { key: "tenant",    label: "Tenant",    width: "120px" },
    { key: "source",    label: "Source",    width: "120px" },
    { key: "event_type", label: "Event",     width: "130px" },
    { key: "severity",  label: "Severity",  width: "110px" },
    { key: "raw",   label: "Raw",   width: "auto"  },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        :root {
          --lt-bg: #ffffff;
          --lt-bg2: #f7f7fa;
          --lt-border: #e8e8ed;
          --lt-text: #111118;
          --lt-muted: #7878a0;
          --lt-head-bg: #f4f4f8;
          --lt-row-hover: #f8f8fc;
          --lt-row-expanded: #f2f2fa;
          --lt-sort-active: #5b5bd6;
          --lt-mono: 'DM Mono', monospace;
          --lt-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --lt-bg: #16161e;
            --lt-bg2: #1c1c28;
            --lt-border: #2a2a3a;
            --lt-text: #ededf5;
            --lt-muted: #7070a0;
            --lt-head-bg: #1e1e2c;
            --lt-row-hover: #1e1e2c;
            --lt-row-expanded: #22223a;
            --lt-sort-active: #8080e0;
            --lt-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);
          }
        }
        .lt-wrap {
          background: var(--lt-bg);
          border-radius: 14px;
          box-shadow: var(--lt-shadow);
          overflow: hidden;
        }
        .lt-scroll { overflow-x: auto; }
        .lt-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }
        .lt-th {
          background: var(--lt-head-bg);
          border-bottom: 1px solid var(--lt-border);
          padding: 11px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lt-muted);
          white-space: nowrap;
          user-select: none;
          cursor: pointer;
          transition: color 0.12s;
        }
        .lt-th:hover { color: var(--lt-text); }
        .lt-th.sorted { color: var(--lt-sort-active); }
        .lt-th-inner { display: flex; align-items: center; gap: 5px; }
        .lt-tr {
          border-bottom: 1px solid var(--lt-border);
          transition: background 0.1s;
          cursor: pointer;
        }
        .lt-tr:last-child { border-bottom: none; }
        .lt-tr:hover { background: var(--lt-row-hover); }
        .lt-tr.expanded { background: var(--lt-row-expanded); }
        .lt-td {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--lt-text);
          vertical-align: middle;
          max-width: 280px;
        }
        .lt-ts {
          font-family: var(--lt-mono);
          font-size: 12px;
          color: var(--lt-muted);
          white-space: nowrap;
        }
        .lt-tenant {
          font-size: 12px;
          font-weight: 500;
          background: var(--lt-bg2);
          border: 1px solid var(--lt-border);
          border-radius: 6px;
          padding: 3px 8px;
          white-space: nowrap;
          display: inline-block;
          color: var(--lt-text);
        }
        .lt-source {
          font-family: var(--lt-mono);
          font-size: 12px;
          color: var(--lt-muted);
        }
        .lt-event {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--lt-text);
          white-space: nowrap;
        }
        .lt-severity {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
        }
        .lt-msg {
          font-size: 13px;
          color: var(--lt-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
        }
        .lt-expand-row td {
          padding: 0;
          border-bottom: 1px solid var(--lt-border);
        }
        .lt-expand-inner {
          padding: 14px 20px 16px 48px;
          background: var(--lt-row-expanded);
          font-size: 13px;
          color: var(--lt-text);
          font-family: var(--lt-mono);
          line-height: 1.7;
          border-top: 1px solid var(--lt-border);
          word-break: break-word;
        }
        .lt-empty {
          text-align: center;
          padding: 48px;
          color: var(--lt-muted);
          font-size: 14px;
        }
        .lt-footer {
          padding: 10px 16px;
          border-top: 1px solid var(--lt-border);
          background: var(--lt-head-bg);
          font-size: 12px;
          color: var(--lt-muted);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .lt-page-btn {
          min-width: 30px;
          height: 28px;
          padding: 0 6px;
          font-size: 13px;
          font-family: inherit;
          font-weight: 500;
          border-radius: 6px;
          border: 1px solid var(--lt-border);
          background: var(--lt-bg);
          color: var(--lt-muted);
          cursor: pointer;
          transition: background 0.12s, color 0.12s, border-color 0.12s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .lt-page-btn:hover:not(:disabled) {
          background: var(--lt-row-hover);
          color: var(--lt-text);
          border-color: var(--lt-sort-active);
        }
        .lt-page-btn.active {
          background: var(--lt-sort-active);
          color: #fff;
          border-color: transparent;
        }
        .lt-page-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }
      `}</style>

      <div className="lt-wrap">
        <div className="lt-scroll">
          <table className="lt-table">
            <thead>
              <tr>
                {columns.map(({ key, label, width }) => (
                  <th
                    key={key}
                    className={`lt-th${sortCol === key ? " sorted" : ""}`}
                    style={{ width }}
                    onClick={() => handleSort(key)}
                  >
                    <div className="lt-th-inner">
                      {label}
                      <SortIcon col={key} sortCol={sortCol} sortDir={sortDir} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="lt-empty">No logs to display</td>
                </tr>
              ) : (
                sorted.map((log) => {
                  const cfg = getSeverityConfig(log.severity);
                  const Icon = cfg.icon;
                  const isExpanded = expanded === log.id;
                  const ts = log.at_timestamp ? new Date(log.at_timestamp) : null;
                  return (
                    <>
                      <tr
                        key={log.id}
                        className={`lt-tr${isExpanded ? " expanded" : ""}`}
                        onClick={() => setExpanded(isExpanded ? null : log.id)}
                      >
                        <td className="lt-td">
                          <span className="lt-ts">
                            {ts
                              ? <>
                                  <span style={{ display: "block" }}>{ts.toLocaleDateString()}</span>
                                  <span style={{ opacity: 0.7 }}>{ts.toLocaleTimeString()}</span>
                                </>
                              : "—"}
                          </span>
                        </td>
                        <td className="lt-td">
                          <span className="lt-tenant">{log.tenant || "—"}</span>
                        </td>
                        <td className="lt-td">
                          <span className="lt-source">{log.source || "—"}</span>
                        </td>
                        <td className="lt-td">
                          <span className="lt-event">{log.event_type || "—"}</span>
                        </td>
                        <td className="lt-td">
                          <span
                            className="lt-severity"
                            style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                          >
                            <Icon size={11} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="lt-td">
                          <span className="lt-msg">{log.raw || "—"}</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="lt-expand-row">
                          <td colSpan={6}>
                            <div className="lt-expand-inner">
                              {log.raw || "No message content."}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="lt-footer">
          <span>
            {pagination
              ? `${((pagination.page - 1) * pagination.limit) + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} logs`
              : `${sorted.length} log${sorted.length !== 1 ? "s" : ""}`
            }
          </span>

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                className="lt-page-btn"
                disabled={!pagination.hasPrev}
                onClick={() => onPageChange(1)}
                title="First page"
              >«</button>
              <button
                className="lt-page-btn"
                disabled={!pagination.hasPrev}
                onClick={() => onPageChange(pagination.page - 1)}
                title="Previous page"
              >‹</button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - pagination.page) <= 2)
                .map(p => (
                  <button
                    key={p}
                    className={`lt-page-btn${p === pagination.page ? " active" : ""}`}
                    onClick={() => onPageChange(p)}
                  >{p}</button>
                ))
              }

              <button
                className="lt-page-btn"
                disabled={!pagination.hasNext}
                onClick={() => onPageChange(pagination.page + 1)}
                title="Next page"
              >›</button>
              <button
                className="lt-page-btn"
                disabled={!pagination.hasNext}
                onClick={() => onPageChange(pagination.totalPages)}
                title="Last page"
              >»</button>
            </div>
          )}

          <span style={{ opacity: 0.5 }}>Click row to expand</span>
        </div>
      </div>
    </div>
  );
}

export default LogsTable;