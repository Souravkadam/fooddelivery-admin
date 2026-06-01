import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  fetchAllUsers, searchUsers, blockUser, unblockUser,
  deleteUser, updateUser, resetUserPassword
} from "../../services/adminApi";
import "./Users.css";

const STATUS_BADGE = {
  ACTIVE:   "success",
  INACTIVE: "secondary",
  BLOCKED:  "danger",
};

const ROLE_BADGE = {
  ADMIN: "danger",
  USER:  "primary",
};

const PAGE_SIZE = 10;

const Users = () => {
  const [users, setUsers]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortBy, setSortBy]         = useState("createdAt");
  const [sortDir, setSortDir]       = useState("desc");
  const [page, setPage]             = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModal, setEditModal]   = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [editForm, setEditForm]     = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers();
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Filter + Sort ─────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.mobileNumber?.includes(q)
      );
    }
    if (statusFilter !== "ALL") result = result.filter((u) => u.accountStatus === statusFilter);
    if (roleFilter !== "ALL")   result = result.filter((u) => u.role === roleFilter);

    result.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (sortBy === "totalSpent" || sortBy === "totalOrders") {
        va = Number(va) || 0; vb = Number(vb) || 0;
      } else {
        va = va || ""; vb = vb || "";
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(result);
    setPage(1);
  }, [users, search, statusFilter, roleFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleBlock = async (user) => {
    if (!window.confirm(`Block ${user.name}?`)) return;
    setActionLoading(true);
    try {
      await blockUser(user.id);
      toast.success(`${user.name} has been blocked.`);
      loadUsers();
    } catch { toast.error("Failed to block user."); }
    finally { setActionLoading(false); }
  };

  const handleUnblock = async (user) => {
    setActionLoading(true);
    try {
      await unblockUser(user.id);
      toast.success(`${user.name} has been unblocked.`);
      loadUsers();
    } catch { toast.error("Failed to unblock user."); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await deleteUser(user.id);
      toast.success("User deleted.");
      loadUsers();
    } catch { toast.error("Failed to delete user."); }
    finally { setActionLoading(false); }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
      address: user.address || "",
      role: user.role || "USER",
      accountStatus: user.accountStatus || "ACTIVE",
    });
    setEditModal(true);
  };

  const handleEditSave = async () => {
    setActionLoading(true);
    try {
      await updateUser(selectedUser.id, editForm);
      toast.success("User updated successfully.");
      setEditModal(false);
      loadUsers();
    } catch { toast.error("Failed to update user."); }
    finally { setActionLoading(false); }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setActionLoading(true);
    try {
      await resetUserPassword(selectedUser.id, newPassword);
      toast.success("Password reset successfully.");
      setResetModal(false);
      setNewPassword("");
    } catch { toast.error("Failed to reset password."); }
    finally { setActionLoading(false); }
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) =>
    sortBy === col ? (
      <i className={`bi bi-sort-${sortDir === "asc" ? "up" : "down"} ms-1`}></i>
    ) : (
      <i className="bi bi-arrow-down-up ms-1 text-muted opacity-50"></i>
    );

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="users-page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">User Management</h4>
          <small className="text-muted">{filtered.length} users found</small>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadUsers}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, email, mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearch("")}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm" value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm" value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="col-auto ms-auto">
              <div className="d-flex gap-2">
                <span className="badge bg-success px-2 py-1">
                  Active: {users.filter((u) => u.accountStatus === "ACTIVE").length}
                </span>
                <span className="badge bg-danger px-2 py-1">
                  Blocked: {users.filter((u) => u.accountStatus === "BLOCKED").length}
                </span>
                <span className="badge bg-primary px-2 py-1">
                  Total: {users.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-2"></i>
              No users found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 users-table">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>User</th>
                    <th className="cursor-pointer" onClick={() => toggleSort("email")}>
                      Email <SortIcon col="email" />
                    </th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="cursor-pointer" onClick={() => toggleSort("createdAt")}>
                      Registered <SortIcon col="createdAt" />
                    </th>
                    <th>Last Login</th>
                    <th className="cursor-pointer text-center" onClick={() => toggleSort("totalOrders")}>
                      Orders <SortIcon col="totalOrders" />
                    </th>
                    <th className="cursor-pointer text-end" onClick={() => toggleSort("totalSpent")}>
                      Spent <SortIcon col="totalSpent" />
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user, idx) => (
                    <tr key={user.id}>
                      <td className="text-muted small">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name}
                              className="rounded-circle" width={36} height={36}
                              style={{ objectFit: "cover" }} />
                          ) : (
                            <div className="user-avatar">
                              {(user.name || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold small">{user.name}</div>
                            {user.username && (
                              <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                                @{user.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="small">{user.email}</td>
                      <td className="small">{user.mobileNumber || "—"}</td>
                      <td>
                        <span className={`badge bg-${ROLE_BADGE[user.role] || "secondary"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${STATUS_BADGE[user.accountStatus] || "secondary"}`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="small text-muted">{formatDate(user.createdAt)}</td>
                      <td className="small text-muted">{formatDate(user.lastLogin)}</td>
                      <td className="text-center">
                        <span className="badge bg-primary rounded-pill">{user.totalOrders || 0}</span>
                      </td>
                      <td className="text-end fw-semibold text-success small">
                        ₹{(user.totalSpent || 0).toFixed(0)}
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          {/* View */}
                          <button className="btn btn-outline-info btn-xs"
                            title="View Profile"
                            onClick={() => { setSelectedUser(user); setDetailModal(true); }}>
                            <i className="bi bi-eye"></i>
                          </button>
                          {/* Edit */}
                          <button className="btn btn-outline-primary btn-xs"
                            title="Edit User"
                            onClick={() => openEdit(user)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          {/* Block / Unblock */}
                          {user.accountStatus === "BLOCKED" ? (
                            <button className="btn btn-outline-success btn-xs"
                              title="Unblock User"
                              onClick={() => handleUnblock(user)}
                              disabled={actionLoading}>
                              <i className="bi bi-unlock"></i>
                            </button>
                          ) : (
                            <button className="btn btn-outline-warning btn-xs"
                              title="Block User"
                              onClick={() => handleBlock(user)}
                              disabled={actionLoading}>
                              <i className="bi bi-slash-circle"></i>
                            </button>
                          )}
                          {/* Reset Password */}
                          <button className="btn btn-outline-secondary btn-xs"
                            title="Reset Password"
                            onClick={() => { setSelectedUser(user); setResetModal(true); }}>
                            <i className="bi bi-key"></i>
                          </button>
                          {/* Delete */}
                          <button className="btn btn-outline-danger btn-xs"
                            title="Delete User"
                            onClick={() => handleDelete(user)}
                            disabled={actionLoading}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-top d-flex justify-content-between align-items-center py-2 px-3">
            <small className="text-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => p - 1)}>‹</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => p + 1)}>›</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5 className="mb-0 fw-bold">Edit User</h5>
              <button className="btn-close" onClick={() => setEditModal(false)}></button>
            </div>
            <div className="modal-body-custom">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Username", key: "username", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Mobile Number", key: "mobileNumber", type: "tel" },
                { label: "Address", key: "address", type: "text" },
              ].map(({ label, key, type }) => (
                <div className="mb-3" key={key}>
                  <label className="form-label small fw-semibold">{label}</label>
                  <input type={type} className="form-control form-control-sm"
                    value={editForm[key] || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Role</label>
                  <select className="form-select form-select-sm" value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select form-select-sm" value={editForm.accountStatus}
                    onChange={(e) => setEditForm((f) => ({ ...f, accountStatus: e.target.value }))}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={actionLoading}>
                {actionLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {detailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setDetailModal(false)}>
          <div className="modal-box modal-box-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5 className="mb-0 fw-bold">User Profile</h5>
              <button className="btn-close" onClick={() => setDetailModal(false)}></button>
            </div>
            <div className="modal-body-custom">
              <div className="d-flex align-items-center gap-3 mb-4">
                {selectedUser.profileImage ? (
                  <img src={selectedUser.profileImage} alt={selectedUser.name}
                    className="rounded-circle" width={64} height={64} style={{ objectFit: "cover" }} />
                ) : (
                  <div className="user-avatar user-avatar-lg">
                    {(selectedUser.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h5 className="mb-0 fw-bold">{selectedUser.name}</h5>
                  <div className="text-muted small">{selectedUser.email}</div>
                  <div className="d-flex gap-2 mt-1">
                    <span className={`badge bg-${ROLE_BADGE[selectedUser.role] || "secondary"}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`badge bg-${STATUS_BADGE[selectedUser.accountStatus] || "secondary"}`}>
                      {selectedUser.accountStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {[
                  { label: "Username", value: selectedUser.username || "—" },
                  { label: "Mobile", value: selectedUser.mobileNumber || "—" },
                  { label: "Address", value: selectedUser.address || "—" },
                  { label: "Registered", value: formatDate(selectedUser.createdAt) },
                  { label: "Last Login", value: formatDate(selectedUser.lastLogin) },
                  { label: "Login Count", value: selectedUser.loginCount || 0 },
                  { label: "Total Orders", value: selectedUser.totalOrders || 0 },
                  { label: "Total Spent", value: `₹${(selectedUser.totalSpent || 0).toFixed(2)}` },
                ].map(({ label, value }) => (
                  <div className="col-6" key={label}>
                    <div className="detail-item">
                      <div className="detail-label">{label}</div>
                      <div className="detail-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedUser.loginHistory?.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-2">Recent Login History</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Time</th>
                          <th>IP</th>
                          <th>Browser</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.loginHistory.slice(0, 5).map((h, i) => (
                          <tr key={i}>
                            <td className="small">{formatDate(h.loginTime)}</td>
                            <td className="small">{h.ipAddress || "—"}</td>
                            <td className="small">{h.browser || "—"}</td>
                            <td>
                              <span className={`badge bg-${h.status === "SUCCESS" ? "success" : "danger"}`}>
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary btn-sm" onClick={() => setDetailModal(false)}>Close</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setDetailModal(false); openEdit(selectedUser); }}>
                <i className="bi bi-pencil me-1"></i>Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ─────────────────────────────────────────────── */}
      {resetModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setResetModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5 className="mb-0 fw-bold">Reset Password</h5>
              <button className="btn-close" onClick={() => setResetModal(false)}></button>
            </div>
            <div className="modal-body-custom">
              <p className="text-muted small mb-3">
                Reset password for <strong>{selectedUser.name}</strong> ({selectedUser.email})
              </p>
              <label className="form-label fw-semibold">New Password</label>
              <input type="password" className="form-control"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary btn-sm" onClick={() => { setResetModal(false); setNewPassword(""); }}>
                Cancel
              </button>
              <button className="btn btn-warning btn-sm" onClick={handleResetPassword} disabled={actionLoading}>
                {actionLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
