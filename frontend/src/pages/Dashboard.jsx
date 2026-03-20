import { useCallback, useEffect, useState } from "react";
import FilterBar from "../component/filterbar";
import LogsTable from "../component/logsTable";
import Sidebar from "../component/sidebar";
import StatsCards from "../component/statsCards";
import TimelineChart from "../component/timelineChart";
import TopSection from "../component/topSection";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [logs, setLogs]             = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const [search, setSearch]         = useState("");
  const [tenant, setTenant]         = useState("");
  const [dateRange, setDateRange]   = useState({ from: "", to: "" });
  const [page, setPage]             = useState(1);
  const [activePage, setActivePage] = useState("dashboard");

  const [tenantList, setTenantList] = useState([]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 10 });
      if (tenant)         params.set("tenant", tenant);
      if (search)         params.set("search", search);
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to)   params.set("to",   dateRange.to);

      const res = await fetch(`${API_URL}/api/logs/getLogs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (Array.isArray(data)) {
        setLogs(data);
        setPagination(null);
        setTenantList((prev) => {
          const merged = new Set([...prev, ...data.map((l) => l.tenant).filter(Boolean)]);
          return [...merged];
        });
      } else {
        const rows = data.data ?? [];
        setLogs(rows);
        setPagination(data.pagination ?? null);
        setTenantList((prev) => {
          const merged = new Set([...prev, ...rows.map((l) => l.tenant).filter(Boolean)]);
          return [...merged];
        });
      }
    } catch (err) {
      console.error("❌ fetchLogs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, tenant, search, dateRange]);

  useEffect(() => {
    const delay = search ? 300 : 0;
    const id = setTimeout(fetchLogs, delay);
    return () => clearTimeout(id);
  }, [fetchLogs]);

  const resetPage = () => setPage(1);

  return (
    // Outer: Sidebar ซ้าย + content ขวา
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f4f8" }}>

      {/* SIDEBAR */}
      <Sidebar
        activePage={activePage}
        onNavigate={(path, key) => {
          setActivePage(key);
          window.location.href = path;
        }}
      />

      {/* MAIN CONTENT */}
      <main style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "24px",
        minWidth: 0,
      }}>

        {/* HEADER */}
        <TopSection systemName="LMS" version="1.0.0" />

        {/* ERROR */}
        {error && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fff0f0",
            border: "1px solid #fad4d4",
            color: "#c0392b",
            fontSize: "13.5px",
            fontFamily: "'DM Sans',sans-serif",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* SUMMARY */}
        <StatsCards logs={logs} pagination={pagination} />

        {/* TIMELINE */}
        <TimelineChart logs={logs} />

        {/* FILTER */}
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

        {/* TABLE */}
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

export default Dashboard;