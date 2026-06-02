import React, { useEffect, useState, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { fetchAllOrders, fetchAllUsers, fetchAllFoods } from "../../services/adminApi";
import "./Dashboard.css";

// ── helpers ───────────────────────────────────────────────────────────────────
const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function last15Days() {
  const out = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push(`${String(d.getDate()).padStart(2,"0")} ${MN[d.getMonth()]}`);
  }
  return out;
}

// Parse any date format Spring Boot might return
function parseDate(v) {
  if (!v) return null;
  if (Array.isArray(v)) {
    // [year, month(1-based), day, h, m, s]
    return new Date(v[0], v[1]-1, v[2], v[3]||0, v[4]||0, v[5]||0);
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toKey(v) {
  const d = parseDate(v);
  if (!d) return null;
  return `${String(d.getDate()).padStart(2,"0")} ${MN[d.getMonth()]}`;
}

function todayKey() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")} ${MN[d.getMonth()]}`;
}

// Build daily chart data — counts ALL orders, revenue from all orders
function makeDailyData(orders, days) {
  const R = {}, O = {};
  days.forEach(d => { R[d] = 0; O[d] = 0; });
  const today = todayKey();
  orders.forEach(o => {
    const k = toKey(o.createdAt) || today;
    if (O[k] === undefined) return;
    O[k]++;
    R[k] += o.amount || 0; // count all order amounts
  });
  return {
    revenue: days.map(d => ({ day: d, revenue: +R[d].toFixed(2) })),
    orders:  days.map(d => ({ day: d, orders:  O[d] })),
  };
}

// Compute all stats from raw orders array
function computeStats(orders, users, foods) {
  // ALL orders count for revenue (amount is the order value regardless of payment)
  const paid = orders.filter(o => o.paymentStatus === "paid");
  
  // Count ALL order statuses dynamically
  const sc = {};
  orders.forEach(o => { 
    const s = (o.orderStatus||"preparing").toLowerCase(); 
    sc[s] = (sc[s]||0) + 1; 
  });

  const fm = {};
  orders.forEach(o => o.orderedItems?.forEach(it => {
    const n = it.name||"Unknown";
    if (!fm[n]) fm[n] = { name:n, qty:0, revenue:0 };
    fm[n].qty += it.quantity ?? it.quantities ?? 1;
    fm[n].revenue += it.price || 0;
  }));

  // Top customers from ALL orders (not just paid)
  const cm = {};
  orders.forEach(o => {
    if (!o.email) return;
    if (!cm[o.email]) cm[o.email] = { email:o.email, totalSpent:0, orderCount:0 };
    cm[o.email].totalSpent += o.amount||0;
    cm[o.email].orderCount++;
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Today revenue from ALL orders placed today
  const todayRevenue = orders.filter(o => {
    const d = parseDate(o.createdAt);
    return d && d >= today;
  }).reduce((s,o) => s+(o.amount||0), 0);

  const monthlyRevenue = orders.filter(o => {
    const d = parseDate(o.createdAt);
    return d && d >= monthStart;
  }).reduce((s,o) => s+(o.amount||0), 0);

  // User stats
  const activeUsers  = users.filter(u => u.accountStatus === "ACTIVE").length;
  const blockedUsers = users.filter(u => u.accountStatus === "BLOCKED").length;
  const newToday     = users.filter(u => { const d=parseDate(u.createdAt); return d&&d>=today; }).length;
  const newMonth     = users.filter(u => { const d=parseDate(u.createdAt); return d&&d>=monthStart; }).length;

  // Food categories
  const cats = [...new Set(foods.map(f=>f.category).filter(Boolean))];

  // Total revenue = sum of all order amounts
  const totalRevenue = orders.reduce((s,o)=>s+(o.amount||0),0);

  return {
    totalRevenue,
    monthlyRevenue,
    todayRevenue,
    totalOrders: orders.length,
    // Map all possible statuses
    pendingOrders:        sc["preparing"]||0,
    confirmedOrders:      sc["confirmed"]||0,
    deliveredOrders:      sc["delivered"]||0,
    cancelledOrders:      sc["cancelled"]||0,
    outForDeliveryOrders: sc["out for delivery"]||0,
    // Raw status map for pie chart
    statusMap: sc,
    totalUsers:    users.length,
    activeUsers,
    blockedUsers,
    newUsersToday: newToday,
    newUsersThisMonth: newMonth,
    totalFoodItems: foods.length,
    totalCategories: cats.length,
    topSellingFoods: Object.values(fm).sort((a,b)=>b.qty-a.qty).slice(0,5),
    topCustomers: Object.values(cm).sort((a,b)=>b.totalSpent-a.totalSpent).slice(0,5),
  };
}

// Auto-sizing chart wrapper — measures real DOM width, passes fixed px to Recharts
function AutoChart({ height, children }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const measure = () => {
      const w = ref.current?.getBoundingClientRect().width;
      if (w > 0) setWidth(Math.floor(w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ width:"100%", height }}>
      {width > 0 && React.cloneElement(children, { width, height })}
    </div>
  );
}

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon"><i className={`bi ${icon}`}></i></div>
    <div className="stat-body">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const PIE_COLORS = ["#ffc107","#198754","#0dcaf0","#dc3545","#6f42c1"];
const GRID = { strokeDasharray:"3 3", stroke:"#f0f0f0" };
const XTICK = { tick:{fontSize:10}, interval:2 };

export default function Dashboard() {
  const DAYS = last15Days();
  const empty = {
    revenue: DAYS.map(d=>({day:d,revenue:0})),
    orders:  DAYS.map(d=>({day:d,orders:0})),
  };

  const [stats,        setStats]        = useState({});
  const [chartData,    setChartData]    = useState(empty);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch orders, users, foods in parallel — compute everything client-side
        const [oRes, uRes, fRes] = await Promise.allSettled([
          fetchAllOrders(),
          fetchAllUsers(),
          fetchAllFoods(),
        ]);
        const orders = oRes.status==="fulfilled" ? (oRes.value.data||[]) : [];
        const users  = uRes.status==="fulfilled" ? (uRes.value.data||[]) : [];
        const foods  = fRes.status==="fulfilled" ? (fRes.value.data||[]) : [];

        console.log("Orders sample:", orders[0]);
        console.log("Total orders:", orders.length);
        console.log("Order statuses:", orders.map(o => o.orderStatus));

        setRecentOrders([...orders].reverse().slice(0,10));
        setChartData(makeDailyData(orders, DAYS));
        setStats(computeStats(orders, users, foods));
      } catch(e) {
        console.error(e);
        setError("Failed to load dashboard. Is the backend running?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight:400}}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{width:48,height:48}}></div>
        <p className="text-muted">Loading dashboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger m-4">
      <i className="bi bi-exclamation-triangle me-2"></i>{error}
    </div>
  );

  const s = stats;

  // Build pie from ALL actual statuses in the data
  const statusColors = {
    "preparing":        "#ffc107",
    "confirmed":        "#0d6efd",
    "out for delivery": "#0dcaf0",
    "delivered":        "#198754",
    "cancelled":        "#dc3545",
    "pending":          "#fd7e14",
  };

  const pieData = Object.entries(s.statusMap||{})
    .filter(([,v]) => v > 0)
    .map(([k,v]) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: v,
      color: statusColors[k.toLowerCase()] || "#6f42c1",
    }));

  // Debug log
  console.log("pieData:", pieData, "statusMap:", s.statusMap);

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Dashboard Overview</h4>
        <span className="badge bg-success px-3 py-2">
          <i className="bi bi-circle-fill me-1" style={{fontSize:"0.5rem"}}></i>Live
        </span>
      </div>

      {/* ── Stat Cards ── */}
      <div className="row g-3 mb-4">
        {[
          {icon:"bi-currency-rupee",label:"Total Revenue",  color:"green",  value:`₹${(s.totalRevenue||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`, sub:`Today: ₹${(s.todayRevenue||0).toFixed(0)}`},
          {icon:"bi-bag-check",     label:"Total Orders",   color:"blue",   value:s.totalOrders||0,    sub:`Confirmed: ${s.confirmedOrders||0}`},
          {icon:"bi-clock-history", label:"In Progress",    color:"orange", value:(s.confirmedOrders||0)+(s.pendingOrders||0)+(s.outForDeliveryOrders||0),  sub:`Out for delivery: ${s.outForDeliveryOrders||0}`},
          {icon:"bi-x-circle",      label:"Cancelled",      color:"red",    value:s.cancelledOrders||0,sub:`Monthly Rev: ₹${(s.monthlyRevenue||0).toFixed(0)}`},
          {icon:"bi-people",        label:"Total Users",    color:"purple", value:s.totalUsers||0,     sub:`Active: ${s.activeUsers||0}`},
          {icon:"bi-person-plus",   label:"New Today",      color:"teal",   value:s.newUsersToday||0,  sub:`This month: ${s.newUsersThisMonth||0}`},
          {icon:"bi-slash-circle",  label:"Blocked Users",  color:"dark",   value:s.blockedUsers||0,   sub:"Account status"},
          {icon:"bi-egg-fried",     label:"Food Items",     color:"indigo", value:s.totalFoodItems||0, sub:`Categories: ${s.totalCategories||0}`},
        ].map(c=>(
          <div key={c.label} className="col-6 col-lg-3">
            <StatCard {...c}/>
          </div>
        ))}
      </div>

      {/* ── Revenue Area Chart ── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-1">
            <i className="bi bi-graph-up-arrow me-2 text-success"></i>
            Revenue — Last 15 Days
          </h6>
          <small className="text-muted d-block mb-3">
            Total: ₹{(s.totalRevenue||0).toLocaleString("en-IN")} &nbsp;|&nbsp;
            Today: ₹{(s.todayRevenue||0).toFixed(2)} &nbsp;|&nbsp;
            This month: ₹{(s.monthlyRevenue||0).toFixed(2)}
          </small>
          <AutoChart height={240}>
            <AreaChart data={chartData.revenue} margin={{top:10,right:30,left:10,bottom:0}}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#198754" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#198754" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID}/>
              <XAxis dataKey="day" {...XTICK}/>
              <YAxis tick={{fontSize:11}} tickFormatter={v=>`₹${v}`} width={70}/>
              <Tooltip formatter={v=>[`₹${Number(v).toFixed(2)}`,"Revenue"]}/>
              <Area type="monotone" dataKey="revenue" stroke="#198754" strokeWidth={2.5}
                fill="url(#gRev)" dot={{r:4,fill:"#198754",strokeWidth:0}} activeDot={{r:6}}/>
            </AreaChart>
          </AutoChart>
        </div>
      </div>

      {/* ── Orders Bar + Pie ── */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-1">
                <i className="bi bi-bar-chart me-2 text-primary"></i>
                Orders — Last 15 Days
              </h6>
              <small className="text-muted d-block mb-3">
                Total: {s.totalOrders||0} orders &nbsp;|&nbsp;
                Pending: {s.pendingOrders||0} &nbsp;|&nbsp;
                Delivered: {s.deliveredOrders||0}
              </small>
              <AutoChart height={220}>
                <BarChart data={chartData.orders} margin={{top:10,right:30,left:0,bottom:0}}>
                  <CartesianGrid {...GRID}/>
                  <XAxis dataKey="day" {...XTICK}/>
                  <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                  <Tooltip/>
                  <Bar dataKey="orders" fill="#0d6efd" radius={[5,5,0,0]} minPointSize={4}/>
                </BarChart>
              </AutoChart>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-pie-chart me-2 text-primary"></i>
                Order Status
              </h6>
              {pieData.length > 0 ? (
                <>
                  <AutoChart height={190}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%"
                        outerRadius={75} innerRadius={30}
                        dataKey="value"
                        label={({percent})=>`${(percent*100).toFixed(0)}%`}
                        labelLine={false}>
                        {pieData.map((d,i)=>(
                          <Cell key={i} fill={d.color}/>
                        ))}
                      </Pie>
                      <Tooltip formatter={(v,n)=>[v,n]}/>
                    </PieChart>
                  </AutoChart>
                  <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
                    {pieData.map((d)=>(
                      <span key={d.name} className="d-flex align-items-center gap-1" style={{fontSize:"0.72rem"}}>
                        <span style={{width:10,height:10,borderRadius:2,background:d.color,display:"inline-block"}}/>
                        {d.name}: <strong>{d.value}</strong>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{height:200}}>
                  <i className="bi bi-pie-chart fs-1 opacity-25 mb-2"></i>
                  <small>No orders yet</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Count Trend ── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-1">
            <i className="bi bi-activity me-2" style={{color:"#6f42c1"}}></i>
            Order Count Trend — Last 15 Days
          </h6>
          <small className="text-muted d-block mb-3">
            Total orders placed: {s.totalOrders||0}
          </small>
          <AutoChart height={200}>
            <AreaChart data={chartData.orders} margin={{top:10,right:30,left:0,bottom:0}}>
              <defs>
                <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6f42c1" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#6f42c1" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID}/>
              <XAxis dataKey="day" {...XTICK}/>
              <YAxis tick={{fontSize:11}} allowDecimals={false} width={40}/>
              <Tooltip/>
              <Area type="monotone" dataKey="orders" stroke="#6f42c1" strokeWidth={2.5}
                fill="url(#gOrd)" dot={{r:4,fill:"#6f42c1",strokeWidth:0}} activeDot={{r:6}}/>
            </AreaChart>
          </AutoChart>
        </div>
      </div>

      {/* ── Top Foods + Top Customers ── */}
      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-trophy me-2 text-warning"></i>
                Top Selling Foods
              </h6>
              {s.topSellingFoods?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr><th>#</th><th>Food</th><th className="text-center">Qty</th><th className="text-end">Revenue</th></tr>
                    </thead>
                    <tbody>
                      {s.topSellingFoods.map((f,i)=>(
                        <tr key={f.name}>
                          <td><span className={`badge ${i===0?"bg-warning text-dark":i===1?"bg-secondary":"bg-light text-dark border"}`}>{i+1}</span></td>
                          <td className="fw-semibold">{f.name}</td>
                          <td className="text-center"><span className="badge bg-primary rounded-pill">{f.qty}</span></td>
                          <td className="text-end text-success fw-bold">₹{(f.revenue||0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-bag-x fs-2 d-block mb-2 opacity-25"></i>
                  <small>No sales data yet</small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-star me-2 text-warning"></i>
                Top Customers
              </h6>
              {s.topCustomers?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr><th>#</th><th>Email</th><th className="text-center">Orders</th><th className="text-end">Spent</th></tr>
                    </thead>
                    <tbody>
                      {s.topCustomers.map((c,i)=>(
                        <tr key={c.email}>
                          <td className="text-muted small">{i+1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar-circle">{(c.email||"?").charAt(0).toUpperCase()}</div>
                              <span className="small text-truncate" style={{maxWidth:120}}>{c.email}</span>
                            </div>
                          </td>
                          <td className="text-center"><span className="badge bg-primary rounded-pill">{c.orderCount}</span></td>
                          <td className="text-end fw-bold text-success small">₹{(c.totalSpent||0).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-people fs-2 d-block mb-2 opacity-25"></i>
                  <small>No customer data yet</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-clock-history me-2 text-primary"></i>
            Recent Orders
          </h6>
          {recentOrders.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <i className="bi bi-bag-x fs-2 d-block mb-2 opacity-25"></i>
              <small>No orders yet</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th><th>Items</th><th>Address</th>
                    <th className="text-center">Payment</th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o=>(
                    <tr key={o.id}>
                      <td>
                        <div className="small fw-semibold">{o.email}</div>
                        <div className="text-muted" style={{fontSize:"0.72rem"}}>{o.phoneNumber}</div>
                      </td>
                      <td className="small">
                        {o.orderedItems?.slice(0,2).map((it,i)=>(
                          <span key={i}>{it.name} ×{it.quantity??it.quantities??1}
                            {i<Math.min(o.orderedItems.length,2)-1?", ":""}</span>
                        ))}
                        {o.orderedItems?.length>2&&<span className="text-muted"> +{o.orderedItems.length-2}</span>}
                      </td>
                      <td className="small text-muted" style={{maxWidth:140}}>{o.userAddress}</td>
                      <td className="text-center">
                        <span className={`badge bg-${o.paymentStatus==="paid"?"success":"warning text-dark"}`}>
                          {o.paymentStatus||"pending"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge bg-${
                          o.orderStatus==="delivered"?"success":
                          o.orderStatus==="cancelled"?"danger":
                          o.orderStatus==="out for delivery"?"info":"warning text-dark"}`}>
                          {o.orderStatus||"preparing"}
                        </span>
                      </td>
                      <td className="text-end fw-bold text-primary">₹{o.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
