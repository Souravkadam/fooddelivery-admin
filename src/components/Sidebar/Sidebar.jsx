import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "bi-speedometer2",  label: "Dashboard"  },
  { to: "/users",     icon: "bi-people",         label: "Users"      },
  { to: "/add",       icon: "bi-plus-circle",    label: "Add Food"   },
  { to: "/list",      icon: "bi-list-ul",        label: "Food List"  },
  { to: "/orders",    icon: "bi-bag-check",      label: "Orders"     },
];

const Sidebar = ({ isOpen }) => {
  return (
    <div
      className={`sidebar-wrapper border-end bg-white ${isOpen ? "" : "collapsed"}`}
      id="sidebar-wrapper"
    >
      {/* Brand */}
      <div className="sidebar-heading border-bottom d-flex align-items-center gap-2 px-3 py-3">
        <img src={logo} alt="Logo" height={36} width={50} />
        <div>
          <div className="fw-bold text-primary lh-1">Food Land</div>
          <div className="text-muted" style={{ fontSize: "0.7rem" }}>Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 px-2">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link d-flex align-items-center gap-2 px-3 py-2 mb-1 rounded text-decoration-none ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className={`bi ${icon} fs-5`}></i>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
