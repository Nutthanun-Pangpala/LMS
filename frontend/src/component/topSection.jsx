import { Activity } from "lucide-react";

function TopSection({ systemName = "LMS", version = null }) {
  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --ts-bg: #ffffff;
          --ts-border: #e8e8ed;
          --ts-text: #111118;
          --ts-muted: #7878a0;
          --ts-accent: #5b5bd6;
          --ts-accent-light: #ededfb;
          --ts-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --ts-bg: #16161e;
            --ts-border: #2a2a3a;
            --ts-text: #ededf5;
            --ts-muted: #7070a0;
            --ts-accent: #7c7ce0;
            --ts-accent-light: #1e1e3a;
            --ts-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);
          }
        }
        .ts-wrap {
          background: var(--ts-bg);
          border-radius: 14px;
          box-shadow: var(--ts-shadow);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ts-logo {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: var(--ts-accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ts-name {
          font-size: 17px;
          font-weight: 600;
          color: var(--ts-text);
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.2;
        }
        .ts-sub {
          font-size: 12px;
          color: var(--ts-muted);
          margin: 2px 0 0;
          font-weight: 400;
        }
        .ts-badge {
          font-size: 11px;
          font-weight: 600;
          background: var(--ts-accent-light);
          color: var(--ts-accent);
          border-radius: 20px;
          padding: 3px 10px;
          letter-spacing: 0.02em;
          margin-left: auto;
          white-space: nowrap;
        }
        .ts-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #1a7f45;
          display: inline-block;
          margin-right: 5px;
          box-shadow: 0 0 0 2px #b8ecd1;
        }
      `}</style>

      <div className="ts-wrap">
        {/* Logo */}
        <div className="ts-logo">
          <Activity size={20} color="var(--ts-accent)" strokeWidth={2.2} />
        </div>

        {/* Name */}
        <div>
          <p className="ts-name">{systemName}</p>
          <p className="ts-sub">
            <span className="ts-dot" />
            Log Mangement System
          </p>
        </div>

        {/* Version badge */}
        {version && (
          <span className="ts-badge">v{version}</span>
        )}
      </div>
    </div>
  );
}

export default TopSection;