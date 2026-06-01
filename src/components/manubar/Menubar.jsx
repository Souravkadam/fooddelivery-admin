import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/logo.png";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/users":     "User Management",
  "/add":       "Add Food",
  "/list":      "Food List",
  "/orders":    "Orders",
};

const Menubar = ({ onToggleSidebar, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title    = PAGE_TITLES[location.pathname] || "Admin Panel";
  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    toast.info("Logged out successfully.");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar bg-white border-bottom shadow-sm px-3 py-2">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <span className="fw-semibold text-dark">{title}</span>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <span className="badge bg-success px-3 py-2">
          <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.5rem" }}></i>
          Online
        </span>

        <div className="dropdown">
          <button
            className="btn btn-light btn-sm d-flex align-items-center gap-2 dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img src={logo} alt="logo" height={28} width={38} className="rounded" />
            <div className="d-none d-md-block text-start">
              <div className="fw-semibold small lh-1">{adminName}</div>
              <div className="text-muted" style={{ fontSize: "0.7rem" }}>Administrator</div>
            </div>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li>
              <span className="dropdown-item-text small text-muted">
                <i className="bi bi-person-circle me-2"></i>{adminName}
              </span>
            </li>
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button className="dropdown-item text-danger small" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menubar;
