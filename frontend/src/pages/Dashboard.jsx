import React from "react";



function Dashboard() {
  const [logs, setLogs] = React.useState([]);
  const [error, setError] = React.useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/logs/getLogs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }

        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Tenant</th>
            <th>Source</th>
            <th>Severity</th>
            <th>Event Type</th>
            <th>Source IP</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.at_timestamp).toLocaleString()}</td>
              <td>{log.tenant}</td>
              <td>{log.source}</td>
              <td>{log.severity}</td>
              <td>{log.event_type}</td>
              <td>{log.src_ip}</td>
              <td>{log.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;