import { Calendar, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

function FilterBar({
  search,
  setSearch,
  tenant,
  setTenant,
  dateRange,
  setDateRange,
  tenants = [],
  resetPage = () => {},
}) {
  const [activeQuick, setActiveQuick] = useState(null);

  const setQuickDate = (days, label) => {
    setActiveQuick(label);
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    setDateRange({
      from: past.toISOString().split("T")[0],
      to: today.toISOString().split("T")[0],
    });
    resetPage();
  };

  const hasFilter = search || tenant || dateRange.from || dateRange.to;

  const handleReset = () => {
    setSearch("");
    setTenant("");
    setDateRange({ from: "", to: "" });
    setActiveQuick(null);
    resetPage();
  };

  const quickFilters = [
    { label: "Today", days: 0 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "var(--fb-bg)",
      border: "1px solid var(--fb-border)",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --fb-bg: #ffffff;
          --fb-border: #e8e8ec;
          --fb-surface: #f4f4f7;
          --fb-surface-hover: #eaeaef;
          --fb-text: #111118;
          --fb-muted: #7c7c8e;
          --fb-accent: #5b5bd6;
          --fb-accent-light: #ededfb;
          --fb-danger: #e5484d;
          --fb-danger-light: #fff0f0;
          --fb-input-border: #e0e0e8;
          --fb-focus: rgba(91, 91, 214, 0.2);
          --fb-quick-active-bg: #5b5bd6;
          --fb-quick-active-text: #ffffff;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --fb-bg: #18181f;
            --fb-border: #2e2e3a;
            --fb-surface: #222230;
            --fb-surface-hover: #2a2a3a;
            --fb-text: #f0f0f5;
            --fb-muted: #8888a0;
            --fb-accent: #7c7ce0;
            --fb-accent-light: #1e1e3a;
            --fb-danger: #f2555a;
            --fb-danger-light: #2a1515;
            --fb-input-border: #333345;
            --fb-focus: rgba(124, 124, 224, 0.25);
            --fb-quick-active-bg: #7c7ce0;
            --fb-quick-active-text: #ffffff;
          }
        }
        .fb-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--fb-surface);
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 8px 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
          cursor: text;
        }
        .fb-input-wrap:focus-within {
          border-color: var(--fb-accent);
          box-shadow: 0 0 0 3px var(--fb-focus);
          background: var(--fb-bg);
        }
        .fb-input-wrap:hover:not(:focus-within) {
          border-color: var(--fb-input-border);
          background: var(--fb-surface-hover);
        }
        .fb-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--fb-text);
          width: 100%;
          min-width: 0;
        }
        .fb-input::placeholder { color: var(--fb-muted); }
        .fb-select {
          background: transparent;
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--fb-text);
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          min-width: 100px;
          max-width: 160px;
        }
        .fb-icon { color: var(--fb-muted); flex-shrink: 0; }
        .fb-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--fb-muted);
          margin-bottom: 6px;
        }
        .fb-quick-btn {
          padding: 6px 14px;
          font-size: 13px;
          font-family: inherit;
          font-weight: 500;
          border-radius: 8px;
          border: 1px solid var(--fb-border);
          background: var(--fb-surface);
          color: var(--fb-muted);
          cursor: pointer;
          transition: background 0.12s, color 0.12s, border-color 0.12s, transform 0.1s;
          white-space: nowrap;
        }
        .fb-quick-btn:hover {
          background: var(--fb-surface-hover);
          color: var(--fb-text);
          border-color: var(--fb-input-border);
        }
        .fb-quick-btn:active { transform: scale(0.97); }
        .fb-quick-btn.active {
          background: var(--fb-quick-active-bg);
          color: var(--fb-quick-active-text);
          border-color: transparent;
        }
        .fb-reset-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 13px;
          font-size: 13px;
          font-family: inherit;
          font-weight: 500;
          border-radius: 8px;
          border: 1px solid transparent;
          background: var(--fb-danger-light);
          color: var(--fb-danger);
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .fb-reset-btn:hover { background: #fce4e5; }
        .fb-reset-btn:active { transform: scale(0.97); }
        .fb-divider {
          height: 1px;
          background: var(--fb-border);
          margin: 0 -20px;
        }
        .fb-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .fb-grid { grid-template-columns: 1fr 1fr 1fr; }
          .fb-search-col { grid-column: 1 / -1; }
        }
        @media (min-width: 900px) {
          .fb-grid { grid-template-columns: 2fr 1.2fr 1fr 1fr; }
          .fb-search-col { grid-column: unset; }
        }
      `}</style>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SlidersHorizontal size={15} style={{ color: "var(--fb-accent)" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--fb-text)", letterSpacing: "-0.01em" }}>
            Filters
          </span>
          {hasFilter && (
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              background: "var(--fb-accent-light)",
              color: "var(--fb-accent)",
              borderRadius: "20px",
              padding: "2px 8px",
              letterSpacing: "0.02em",
            }}>
              Active
            </span>
          )}
        </div>
        {hasFilter && (
          <button className="fb-reset-btn" onClick={handleReset}>
            <X size={13} />
            Clear all
          </button>
        )}
      </div>

      {/* Main filter grid */}
      <div className="fb-grid">

        {/* Search */}
        <div className="fb-search-col">
          <div className="fb-label">Search</div>
          <div className="fb-input-wrap">
            <Search size={14} className="fb-icon" />
            <input
              type="text"
              placeholder="Search logs, events, actions..."
              className="fb-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "var(--fb-muted)" }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Tenant */}
        <div>
          <div className="fb-label">Tenant</div>
          <div className="fb-input-wrap">
            <Filter size={14} className="fb-icon" />
            <select
              className="fb-select"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
            >
              <option value="">All Tenants</option>
              {tenants.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date From */}
        <div>
          <div className="fb-label">From</div>
          <div className="fb-input-wrap">
            <Calendar size={14} className="fb-icon" />
            <input
              type="date"
              className="fb-input"
              value={dateRange.from || ""}
              onChange={(e) => {
                setDateRange({ ...dateRange, from: e.target.value });
                setActiveQuick(null);
              }}
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <div className="fb-label">To</div>
          <div className="fb-input-wrap">
            <Calendar size={14} className="fb-icon" />
            <input
              type="date"
              className="fb-input"
              value={dateRange.to || ""}
              onChange={(e) => {
                setDateRange({ ...dateRange, to: e.target.value });
                setActiveQuick(null);
              }}
            />
          </div>
        </div>

      </div>

      <div className="fb-divider" />

      {/* Quick date filters */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--fb-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Quick:
        </span>
        {quickFilters.map(({ label, days }) => (
          <button
            key={label}
            className={`fb-quick-btn${activeQuick === label ? " active" : ""}`}
            onClick={() => setQuickDate(days, label)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterBar;