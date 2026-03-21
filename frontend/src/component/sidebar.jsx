import { Activity, ChevronRight, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import { useState } from "react";


const ICONS = { LayoutDashboard, FileText, Users, Settings };

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
  { key: "logs",      label: "Logs",      icon: "FileText",        path: "/logs" },
  { key: "tenants",   label: "Tenants",   icon: "Users",           path: "/tenants" },
];

const BOTTOM_ITEMS = [
  { key: "settings",  label: "Settings",  icon: "Settings",        path: "/settings" },
];

function Sidebar({ activePage = "dashboard", onNavigate = () => {} }) {
  const [hovered, setHovered] = useState(null);

  const renderItem = ({ key, label, icon, path }) => {
    const Icon = ICONS[icon];
    const isActive = activePage === key;
    return (
      <button
        key={key}
        className={`sb-item${isActive ? " active" : ""}${hovered === key ? " hovered" : ""}`}
        onClick={() => onNavigate(path, key)}
        onMouseEnter={() => setHovered(key)}
        onMouseLeave={() => setHovered(null)}
      >
        <span className="sb-item-icon">
          <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
        </span>
        <span className="sb-item-label">{label}</span>
        {isActive && <ChevronRight size={13} className="sb-item-arrow" />}
      </button>
    );
  };

  return (
    <div className="sb-wrap" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --sb-bg: #ffffff;
          --sb-border: #e8e8ed;
          --sb-text: #111118;
          --sb-muted: #8888a8;
          --sb-surface: #f4f4f8;
          --sb-active-bg: #ededfb;
          --sb-active-text: #5b5bd6;
          --sb-active-border: #c8c8f4;
          --sb-hover-bg: #f7f7fb;
          --sb-shadow: 1px 0 0 var(--sb-border);
          --sb-width: 220px;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --sb-bg: #16161e;
            --sb-border: #2a2a3a;
            --sb-text: #ededf5;
            --sb-muted: #7070a0;
            --sb-surface: #1e1e2c;
            --sb-active-bg: #22223a;
            --sb-active-text: #8080e0;
            --sb-active-border: #3a3a6a;
            --sb-hover-bg: #1c1c28;
          }
        }
        .sb-wrap {
          width: var(--sb-width);
          min-width: var(--sb-width);
          height: 100vh;
          background: var(--sb-bg);
          box-shadow: var(--sb-shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: sticky;
          top: 0;
        }

        /* Logo */
        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--sb-border);
          margin-bottom: 8px;
          text-decoration: none;
        }
        .sb-logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: var(--sb-active-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sb-logo-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--sb-text);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .sb-logo-sub {
          font-size: 10.5px;
          color: var(--sb-muted);
          margin-top: 2px;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        /* Nav sections */
        .sb-section {
          flex: 1;
          padding: 4px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sb-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sb-muted);
          padding: 8px 6px 4px;
        }
        .sb-bottom {
          padding: 8px 10px 16px;
          border-top: 1px solid var(--sb-border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* Nav item */
        .sb-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 9px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s, border-color 0.12s, color 0.12s;
          color: var(--sb-muted);
          font-family: inherit;
        }
        .sb-item:hover, .sb-item.hovered {
          background: var(--sb-hover-bg);
          color: var(--sb-text);
        }
        .sb-item.active {
          background: var(--sb-active-bg);
          border-color: var(--sb-active-border);
          color: var(--sb-active-text);
        }
        .sb-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 20px;
        }
        .sb-item-label {
          flex: 1;
          font-size: 13.5px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-item-arrow {
          opacity: 0.5;
          flex-shrink: 0;
        }

        /* Version badge */
        .sb-version {
          margin: 0 10px 12px;
          padding: 7px 10px;
          background: var(--sb-surface);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sb-version-label {
          font-size: 11px;
          color: var(--sb-muted);
        }
        .sb-version-num {
          font-size: 11px;
          font-weight: 600;
          color: var(--sb-active-text);
          font-family: 'DM Mono', monospace;
        }
      `}</style>

      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon">
          <Activity size={17} color="var(--sb-active-text)" strokeWidth={2.2} />
        </div>
        <div>
          <div className="sb-logo-name">LMS</div>
          <div className="sb-logo-sub">Log Monitor System</div>
        </div>
      </div>

      {/* Main nav */}
      <div className="sb-section">
        <div className="sb-section-label">Main</div>
        {NAV_ITEMS.map(renderItem)}
      </div>

      {/* Bottom: Settings */}
      <div className="sb-bottom">
        {BOTTOM_ITEMS.map(renderItem)}
      </div>

      {/* Version */}
      <div className="sb-version">
        <span className="sb-version-label">Version</span>
        <span className="sb-version-num">v1.0.0</span>
      </div>
    </div>
  );
}

export default Sidebar;