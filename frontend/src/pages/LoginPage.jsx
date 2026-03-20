import { Activity, Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass]  = useState(false);
  const [error, setError]        = useState(null);
  const [loading, setLoading]    = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Invalid username or password");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --lp-bg: #f4f4f8;
          --lp-card: #ffffff;
          --lp-border: #e8e8ed;
          --lp-text: #111118;
          --lp-muted: #7878a0;
          --lp-surface: #f7f7fb;
          --lp-accent: #5b5bd6;
          --lp-accent-hover: #4a4ac0;
          --lp-accent-light: #ededfb;
          --lp-accent-border: #c8c8f4;
          --lp-danger-bg: #fff0f0;
          --lp-danger-border: #fad4d4;
          --lp-danger-text: #c0392b;
          --lp-shadow: 0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --lp-bg: #111118;
            --lp-card: #16161e;
            --lp-border: #2a2a3a;
            --lp-text: #ededf5;
            --lp-muted: #7070a0;
            --lp-surface: #1c1c28;
            --lp-accent: #7c7ce0;
            --lp-accent-hover: #9090e8;
            --lp-accent-light: #1e1e3a;
            --lp-accent-border: #3a3a6a;
            --lp-danger-bg: #2a1515;
            --lp-danger-border: #5a2020;
            --lp-danger-text: #f08080;
            --lp-shadow: 0 2px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04);
          }
        }
        .lp-root {
          min-height: 100vh;
          background: var(--lp-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .lp-card {
          background: var(--lp-card);
          border-radius: 18px;
          box-shadow: var(--lp-shadow);
          width: 100%;
          max-width: 400px;
          padding: 36px 32px 32px;
        }
        .lp-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .lp-logo {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--lp-accent-light);
          border: 1px solid var(--lp-accent-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--lp-text);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .lp-subtitle {
          font-size: 13px;
          color: var(--lp-muted);
          margin: 0;
        }
        .lp-error {
          background: var(--lp-danger-bg);
          border: 1px solid var(--lp-danger-border);
          color: var(--lp-danger-text);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lp-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lp-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--lp-muted);
          letter-spacing: 0.01em;
        }
        .lp-input-wrap {
          display: flex;
          align-items: center;
          background: var(--lp-surface);
          border: 1px solid var(--lp-border);
          border-radius: 10px;
          padding: 0 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lp-input-wrap:focus-within {
          border-color: var(--lp-accent);
          box-shadow: 0 0 0 3px var(--lp-accent-light);
          background: var(--lp-card);
        }
        .lp-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          color: var(--lp-text);
          padding: 11px 0;
        }
        .lp-input::placeholder { color: var(--lp-muted); opacity: 0.6; }
        .lp-eye {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--lp-muted);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.12s;
        }
        .lp-eye:hover { color: var(--lp-text); }
        .lp-btn {
          margin-top: 4px;
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: var(--lp-accent);
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s, opacity 0.15s;
          letter-spacing: -0.01em;
        }
        .lp-btn:hover:not(:disabled) { background: var(--lp-accent-hover); }
        .lp-btn:active:not(:disabled) { transform: scale(0.98); }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lp-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lp-spin 0.7s linear infinite;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-divider {
          height: 1px;
          background: var(--lp-border);
          margin: 4px 0;
        }
        .lp-footer {
          text-align: center;
          font-size: 12px;
          color: var(--lp-muted);
          margin-top: 20px;
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-card">

          {/* Header */}
          <div className="lp-header">
            <div className="lp-logo">
              <Activity size={22} color="var(--lp-accent)" strokeWidth={2.2} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p className="lp-title">LMS</p>
              <p className="lp-subtitle">Sign in to your account</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="lp-error">
              <span style={{ fontSize: 15 }}>⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <div className="lp-form" onSubmit={handleLogin}>
            <div className="lp-field">
              <label className="lp-label">Username</label>
              <div className="lp-input-wrap">
                <input
                  type="text"
                  className="lp-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  className="lp-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="lp-btn"
              disabled={loading || !username || !password}
              onClick={handleLogin}
            >
              {loading
                ? <><div className="lp-spinner" /> Signing in...</>
                : <><LogIn size={15} /> Sign in</>
              }
            </button>
          </div>

          <div className="lp-divider" style={{ marginTop: 24 }} />
          <p className="lp-footer">LMS v1.0.0 — Log Monitor System</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;