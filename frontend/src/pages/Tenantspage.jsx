import { Activity, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Sidebar from "../component/sidebar";

const API_URL = import.meta.env.VITE_API_URL;

const SEVERITY_COLORS = { error: "#c0392b", warning: "#d4860a", info: "#2c5cc5" };

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)", width: "100%", maxWidth: 440, padding: "28px 28px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 16, color: "var(--color-text)", margin: 0 }}>{title}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TenantForm({ initial = {}, onSubmit, onClose, loading }) {
  const [name, setName]         = useState(initial.name || "");
  const [desc, setDesc]         = useState(initial.description || "");
  const [status, setStatus]     = useState(initial.status || "active");

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)", fontSize: 13.5, color: "var(--color-text)",
    fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 500, color: "var(--color-muted)", display: "block", marginBottom: 5 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>Name *</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. demoA" />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description" />
      </div>
      <div>
        <label style={labelStyle}>Status</label>
        <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: "9px 0", borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)", background: "var(--color-surface-2)",
          color: "var(--color-muted)", fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "var(--font-sans)",
        }}>Cancel</button>
        <button
          disabled={!name.trim() || loading}
          onClick={() => onSubmit({ name: name.trim(), description: desc.trim(), status })}
          style={{
            flex: 1, padding: "9px 0", borderRadius: "var(--radius-md)",
            border: "none", background: "var(--color-accent)", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: name.trim() ? "pointer" : "not-allowed",
            opacity: name.trim() ? 1 : 0.5, fontFamily: "var(--font-sans)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Check size={14} /> {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function TenantsPage() {
  const [tenants, setTenants]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(null); // null | 'add' | {edit: tenant} | {delete: tenant}
  const [saving, setSaving]     = useState(false);

  const token = () => localStorage.getItem("token");

  const fetchTenants = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/tenants`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setTenants(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleCreate = async (body) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tenants`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setModal(null); fetchTenants();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (body) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tenants/${modal.edit.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setModal(null); fetchTenants();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tenants/${modal.delete.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setModal(null); fetchTenants();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const chartData = tenants.map(t => ({
    name: t.name,
    errors:   Number(t.error_count)   || 0,
    warnings: Number(t.warning_count) || 0,
    total:    Number(t.log_count)     || 0,
  }));

  return (
    <div className="app-layout">
      <Sidebar activePage="tenants" onNavigate={(path) => { window.location.href = path; }} />

      <main className="app-main" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1>Tenants</h1>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 4 }}>
              {tenants.length} tenant{tenants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={() => setModal("add")} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: "var(--radius-md)",
            border: "none", background: "var(--color-accent)", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>
            <Plus size={15} /> Add Tenant
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-bd)", color: "var(--color-danger)", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", padding: "16px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginBottom: 12 }}>Log distribution by tenant</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
              {[["Errors", SEVERITY_COLORS.error], ["Warnings", SEVERITY_COLORS.warning], ["Total", "#c0c0e0"]].map(([l, c]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-muted)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />{l}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="errors"   fill={SEVERITY_COLORS.error}   radius={[3,3,0,0]} />
                <Bar dataKey="warnings" fill={SEVERITY_COLORS.warning} radius={[3,3,0,0]} />
                <Bar dataKey="total"    fill="#c0c0e0"                  radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Tenant", "Description", "Status", "Logs", "Errors", "Warnings", "Last Seen", ""].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--color-muted)", fontSize: 14 }}>Loading...</td></tr>
                ) : tenants.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "var(--color-muted)", fontSize: 14 }}>No tenants yet — click Add Tenant to create one</td></tr>
                ) : tenants.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--color-accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Activity size={13} color="var(--color-accent)" />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-muted)", maxWidth: 200 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{t.description || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                        background: t.status === "active" ? "var(--color-success-bg)" : "var(--color-surface-2)",
                        color: t.status === "active" ? "var(--color-success)" : "var(--color-muted)",
                        border: `1px solid ${t.status === "active" ? "var(--color-success-bg)" : "var(--color-border)"}`,
                      }}>{t.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>{Number(t.log_count).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--color-danger)" }}>{Number(t.error_count).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--color-warning)" }}>{Number(t.warning_count).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                      {t.last_seen ? new Date(t.last_seen).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setModal({ edit: t })} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 7, cursor: "pointer", padding: "5px 8px", color: "var(--color-muted)", display: "flex" }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setModal({ delete: t })} style={{ background: "none", border: "1px solid var(--color-danger-bd)", borderRadius: 7, cursor: "pointer", padding: "5px 8px", color: "var(--color-danger)", display: "flex" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Add Modal */}
      {modal === "add" && (
        <Modal title="Add Tenant" onClose={() => setModal(null)}>
          <TenantForm onSubmit={handleCreate} onClose={() => setModal(null)} loading={saving} />
        </Modal>
      )}

      {/* Edit Modal */}
      {modal?.edit && (
        <Modal title="Edit Tenant" onClose={() => setModal(null)}>
          <TenantForm initial={modal.edit} onSubmit={handleUpdate} onClose={() => setModal(null)} loading={saving} />
        </Modal>
      )}

      {/* Delete Confirm */}
      {modal?.delete && (
        <Modal title="Delete Tenant" onClose={() => setModal(null)}>
          <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 20 }}>
            ลบ <strong style={{ color: "var(--color-text)" }}>{modal.delete.name}</strong> และ log ที่เชื่อมอยู่จะไม่ถูกลบ ยืนยันหรือไม่?
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: "9px 0", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface-2)", color: "var(--color-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: "9px 0", borderRadius: "var(--radius-md)", border: "none", background: "var(--color-danger)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default TenantsPage;