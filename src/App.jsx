import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Menubar from "./components/manubar/Menubar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddFood from "./pages/AddFood/AddFood";
import ListFood from "./pages/ListFood/ListFood";
import Orders from "./pages/Order/Orders";
import Users from "./pages/Users/Users";
import AdminLogin from "./pages/Login/AdminLogin";
import "./App.css";

// ── Protected layout wrapper ──────────────────────────────────────────────────
const AdminLayout = ({ sidebarOpen, onToggleSidebar, onLogout, children }) => (
  <div className="d-flex" id="wrapper">
    <Sidebar isOpen={sidebarOpen} />
    <div id="page-content-wrapper" className="flex-grow-1">
      <Menubar onToggleSidebar={onToggleSidebar} onLogout={onLogout} />
      <div className="container-fluid p-4">{children}</div>
    </div>
  </div>
);

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");

  const handleLogin  = (t) => {
    localStorage.setItem("adminToken", t);
    setToken(t);
  };
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    setToken("");
  };

  const isAuthenticated = Boolean(token);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <AdminLogin onLogin={handleLogin} />
          }
        />

        {/* Protected */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <AdminLayout sidebarOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen((p) => !p)}
                  onLogout={handleLogout}>
                  <Dashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/users"
              element={
                <AdminLayout sidebarOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen((p) => !p)}
                  onLogout={handleLogout}>
                  <Users />
                </AdminLayout>
              }
            />
            <Route
              path="/add"
              element={
                <AdminLayout sidebarOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen((p) => !p)}
                  onLogout={handleLogout}>
                  <AddFood />
                </AdminLayout>
              }
            />
            <Route
              path="/list"
              element={
                <AdminLayout sidebarOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen((p) => !p)}
                  onLogout={handleLogout}>
                  <ListFood />
                </AdminLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <AdminLayout sidebarOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen((p) => !p)}
                  onLogout={handleLogout}>
                  <Orders />
                </AdminLayout>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
