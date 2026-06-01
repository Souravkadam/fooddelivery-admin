import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminLogin } from "../../services/adminApi";
import logo from "../../assets/logo.png";

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(form.email, form.password);
      const { token, role, name } = res.data;

      if (!token) {
        toast.error("Login failed. No token received.");
        return;
      }

      // If backend doesn't return role yet (old backend), allow login
      // and warn — role check is best-effort
      if (role && role !== "ADMIN") {
        toast.error("Access denied. Admin credentials required.");
        return;
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminName", name || form.email);
      onLogin(token);
      toast.success(`Welcome back, ${name || "Admin"}!`);
      navigate("/dashboard");
    } catch (err) {
      // Backend may return plain string or JSON object
      const data = err.response?.data;
      const msg =
        (typeof data === "string" ? data : data?.message) ||
        "Login failed. Check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Logo */}
        <div className="text-center mb-4">
          <img src={logo} alt="Food Land" height={56} />
          <h4 className="fw-bold mt-3 mb-1">Admin Panel</h4>
          <p className="text-muted small">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="admin@foodland.com"
                value={form.email}
                onChange={onChange}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={onChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
              >
                <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-shield-lock me-2"></i>Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            <i className="bi bi-shield-check me-1 text-success"></i>
            Secured with JWT Authentication
          </small>
        </div>
      </div>

      <style>{`
        .admin-login-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .admin-login-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
