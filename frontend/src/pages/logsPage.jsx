import { useCallback, useEffect, useState } from "react";
import FilterBar from "../component/filterbar";
import LogsTable from "../component/logsTable";
import Sidebar from "../component/sidebar";

const API_URL = import.meta.env.VITE_API_URL;

function LogsPage() {
  const [logs, setLogs]             = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const [search, setSearch]         = useState("");
  const [tenant, setTenant]         = useState("");
  const [dateRange, setDateRange]   = useState({ from: "", to: "" });
  const [page, setPage]             = useState(1);
  const [tenantList, setTenantList] = useState([]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 20 });
      if (tenant)         params.set("tenant", tenant);
      if (search)         params.set("search", search);
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to)   params.set("to",   dateRange.to);

      const res = await fetch(`${API_URL}/api/logs/getLogs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data.data ?? []);
      setLogs(rows);
      setPagination(Array.isArray(data) ? null : (data.pagination ?? null));
      setTenantList((prev) => {
        const merged = new Set([...prev, ...rows.map((l) => l.tenant).filter(Boolean)]);
        return [...merged];
      });
    } catch (err) {
      console.error("❌ fetchLogs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, tenant, search, dateRange]);

  useEffect(() => {
    const id = setTimeout(fetchLogs, search ? 300 : 0);
    return () => clearTimeout(id);
  }, [fetchLogs]);

  const resetPage = () => setPage(1);

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar activePage="logs" onNavigate={(path) => { window.location.href = path; }} />

      {/* MAIN */}
      <main className="app-main" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1>Logs</h1>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", marginTop: "4px" }}>
              {pagination ? `${pagination.total.toLocaleString()} total logs` : `${logs.length} logs`}
            </p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: "13px", fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              color: loading ? "var(--color-muted)" : "var(--color-text)",
              fontFamily: "inherit", transition: "background 0.12s",
            }}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-bd)",
            color: "var(--color-danger)",
            fontSize: "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Filter */}
        <FilterBar
          search={search}
          setSearch={(v) => { setSearch(v); resetPage(); }}
          tenant={tenant}
          setTenant={(v) => { setTenant(v); resetPage(); }}
          dateRange={dateRange}
          setDateRange={(v) => { setDateRange(v); resetPage(); }}
          tenants={tenantList}
          resetPage={resetPage}
        />

        {/* Table */}
        <LogsTable
          logs={logs}
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
        />

      </main>
    </div>
  );
}

export default LogsPage;