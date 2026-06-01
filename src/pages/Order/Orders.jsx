import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { fetchAllOrders, updateOrderStatus } from "../../services/adminApi";
import parsel from "../../assets/parsel.png";
import "./Orders.css";

const STATUS_OPTIONS = [
  { value: "preparing",        label: "Preparing",        color: "warning" },
  { value: "confirmed",        label: "Confirmed",        color: "primary" },
  { value: "out for delivery", label: "Out for Delivery", color: "info"    },
  { value: "delivered",        label: "Delivered",        color: "success" },
  { value: "cancelled",        label: "Cancelled",        color: "danger"  },
];

const PAGE_SIZE = 10;

const Orders = () => {
  const [orders, setOrders]         = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [page, setPage]             = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrders();
      setOrders([...res.data].reverse());
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    let result = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.email?.toLowerCase().includes(q) ||
          o.phoneNumber?.includes(q) ||
          o.userAddress?.toLowerCase().includes(q) ||
          o.id?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL")  result = result.filter((o) => o.orderStatus === statusFilter);
    if (paymentFilter !== "ALL") result = result.filter((o) => o.paymentStatus === paymentFilter);
    setFiltered(result);
    setPage(1);
  }, [orders, search, statusFilter, paymentFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success("Order status updated.");
    } catch {
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = (status) =>
    STATUS_OPTIONS.find((s) => s.value === status?.toLowerCase())?.color || "secondary";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }) : "—";

  // ── Summary counts ────────────────────────────────────────────────────────
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = orders.filter((o) => o.orderStatus === s.value).length;
    return acc;
  }, {});
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + (o.amount || 0), 0);

  return (
    <div className="orders-page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Order Management</h4>
          <small className="text-muted">{filtered.length} orders</small>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadOrders}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="row g-2 mb-4">
        {[
          { label: "Total", value: orders.length, color: "primary", icon: "bi-bag" },
          { label: "Preparing", value: counts["preparing"] || 0, color: "warning", icon: "bi-fire" },
          { label: "Delivered", value: counts["delivered"] || 0, color: "success", icon: "bi-check-circle" },
          { label: "Cancelled", value: counts["cancelled"] || 0, color: "danger", icon: "bi-x-circle" },
          { label: "Revenue", value: `₹${totalRevenue.toFixed(0)}`, color: "success", icon: "bi-currency-rupee" },
        ].map((c) => (
          <div key={c.label} className="col">
            <div className={`order-summary-card border-${c.color}`}>
              <i className={`bi ${c.icon} text-${c.color} fs-5`}></i>
              <div>
                <div className="fw-bold">{c.value}</div>
                <div className="text-muted small">{c.label}</div>
              </div>
            </div>
          </div>
        ))}
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
                <input type="text" className="form-control border-start-0"
                  placeholder="Search by email, phone, address..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
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
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm" value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="ALL">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Orders Table ───────────────────────────────────────────────────── */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading orders...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bag-x fs-1 d-block mb-2"></i>
              No orders found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order, idx) => (
                    <tr key={order.id}>
                      <td className="text-muted small">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <div className="small fw-semibold">{order.email}</div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                          <i className="bi bi-telephone me-1"></i>{order.phoneNumber}
                        </div>
                      </td>
                      <td className="small">
                        {order.orderedItems?.slice(0, 2).map((item, i) => (
                          <span key={i}>
                            {item.name} ×{item.quantities ?? item.quantity}
                            {i < Math.min(order.orderedItems.length, 2) - 1 ? ", " : ""}
                          </span>
                        ))}
                        {order.orderedItems?.length > 2 && (
                          <span className="text-muted"> +{order.orderedItems.length - 2}</span>
                        )}
                      </td>
                      <td className="fw-bold text-primary">₹{order.amount}</td>
                      <td>
                        <span className={`badge bg-${order.paymentStatus === "paid" ? "success" : "warning text-dark"}`}>
                          {order.paymentStatus || "pending"}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {formatDate(order.createdAt)}
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm status-select border-${statusColor(order.orderStatus)}`}
                          value={order.orderStatus || "preparing"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          style={{ minWidth: 140 }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-outline-info btn-xs"
                          title="View Details"
                          onClick={() => { setSelectedOrder(order); setDetailModal(true); }}>
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
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
                {[...Array(Math.min(totalPages, 7))].map((_, i) => (
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

      {/* ── Order Detail Modal ───────────────────────────────────────────────── */}
      {detailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setDetailModal(false)}>
          <div className="modal-box modal-box-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div>
                <h5 className="mb-0 fw-bold">Order Details</h5>
                <small className="text-muted">ID: {selectedOrder.id}</small>
              </div>
              <button className="btn-close" onClick={() => setDetailModal(false)}></button>
            </div>
            <div className="modal-body-custom">
              {/* Customer Info */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="detail-section">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-person me-2 text-primary"></i>Customer
                    </h6>
                    <div className="small"><strong>Email:</strong> {selectedOrder.email}</div>
                    <div className="small"><strong>Phone:</strong> {selectedOrder.phoneNumber}</div>
                    <div className="small"><strong>Address:</strong> {selectedOrder.userAddress}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-section">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-info-circle me-2 text-primary"></i>Order Info
                    </h6>
                    <div className="small"><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</div>
                    <div className="small">
                      <strong>Payment:</strong>{" "}
                      <span className={`badge bg-${selectedOrder.paymentStatus === "paid" ? "success" : "warning text-dark"}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="small">
                      <strong>Status:</strong>{" "}
                      <span className={`badge bg-${statusColor(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <h6 className="fw-bold mb-2">
                <i className="bi bi-bag me-2 text-primary"></i>Ordered Items
              </h6>
              <div className="table-responsive mb-3">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderedItems?.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name}
                                width={32} height={32} className="rounded"
                                style={{ objectFit: "cover" }} />
                            )}
                            <span className="small fw-semibold">{item.name}</span>
                          </div>
                        </td>
                        <td className="small">{item.category || "—"}</td>
                        <td className="text-center small">{item.quantities ?? item.quantity}</td>
                        <td className="text-end small fw-bold">₹{item.price?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={3} className="fw-bold text-end">Total</td>
                      <td className="text-end fw-bold text-primary">₹{selectedOrder.amount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Update Status */}
              <div className="d-flex align-items-center gap-2">
                <label className="form-label mb-0 fw-semibold small">Update Status:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 200 }}
                  value={selectedOrder.orderStatus || "preparing"}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value);
                    setSelectedOrder((o) => ({ ...o, orderStatus: e.target.value }));
                  }}
                  disabled={updatingId === selectedOrder.id}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn btn-secondary btn-sm" onClick={() => setDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
