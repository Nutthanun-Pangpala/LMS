import { Activity, Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
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
    <>
      <style>{`
        .lp-root {
          min-height: 100vh;
          width: 100%;
          background: var(--color-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .lp-card {
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
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
          width: 48px; height: 48px;
          border-radius: var(--radius-lg);
          background: var(--color-accent-bg);
          border: 1px solid var(--color-accent-bd);
          display: flex; align-items: center; justify-content: center;
        }
        .lp-error {
          background: var(--color-danger-bg);
          border: 1px solid var(--color-danger-bd);
          color: var(--color-danger);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .lp-form { display: flex; flex-direction: column; gap: 16px; }
        .lp-field { display: flex; flex-direction: column; gap: 6px; }
        .lp-label {
          font-size: 12.5px; font-weight: 500;
          color: var(--color-muted); letter-spacing: 0.01em;
        }
        .lp-input-wrap {
          display: flex; align-items: center;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lp-input-wrap:focus-within {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-bg);
          background: var(--color-surface);
        }
        .lp-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: var(--font-sans); font-size: 14px;
          color: var(--color-text); padding: 11px 0;
        }
        .lp-input::placeholder { color: var(--color-muted); opacity: 0.6; }
        .lp-eye {
          background: none; border: none; cursor: pointer;
          color: var(--color-muted); display: flex; align-items: center; padding: 0;
          transition: color 0.12s;
        }
        .lp-eye:hover { color: var(--color-text); }
        .lp-btn {
          margin-top: 4px; width: 100%; padding: 12px;
          border-radius: var(--radius-md); border: none;
          background: var(--color-accent); color: #fff;
          font-family: var(--font-sans); font-size: 14px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em;
        }
        .lp-btn:hover:not(:disabled) { opacity: 0.88; }
        .lp-btn:active:not(:disabled) { transform: scale(0.98); }
        .lp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .lp-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: lp-spin 0.7s linear infinite;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-footer {
          text-align: center; font-size: 12px;
          color: var(--color-muted); margin-top: 20px;
        }
        .lp-divider {
          height: 1px; background: var(--color-border); margin-top: 24px;
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-card">

          {/* Header */}
          <div className="lp-header">
            <div className="lp-logo">
              <Activity size={22} color="var(--color-accent)" strokeWidth={2.2} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text)", margin: 0 }}>
                LMS
              </p>
              <p style={{ fontSize: "13px", color: "var(--color-muted)", margin: 0 }}>
                Sign in to your account
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="lp-error">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <div className="lp-form">
            <div className="lp-field">
              <label className="lp-label">Username</label>
              <div className="lp-input-wrap">
                <input
                  type="text"
                  className="lp-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button type="button" className="lp-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
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

          <div className="lp-divider" />
          <p className="lp-footer">LMS v1.0.0 — Log Monitor System</p>
        </div>
      </div>
    </>
  );
}

export default LoginPage;