import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";


import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import LogsPage from "./pages/logsPage";
import RegisterPage from "./pages/RegisterPage";
import TenantsPage from "./pages/Tenantspage";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/logs" element={isAuthenticated ? <LogsPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tenants" element={isAuthenticated ? <TenantsPage /> : <Navigate to="/login" />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;