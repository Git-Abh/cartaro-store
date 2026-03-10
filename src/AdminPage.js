import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";

const ADMIN_PASSWORD = "cartaro2024";

const statusColor = (s) => ({
  pending: "#F59E0B", confirmed: "#3B82F6", shipped: "#8B5CF6",
  "out for delivery": "#F97316", delivered: "#10B981", cancelled: "#EF4444"
}[s] || "#64748B");

const statusBg = (s) => ({
  pending: "#FEF3C7", confirmed: "#EFF6FF", shipped: "#F5F3FF",
  "out for delivery": "#FFF7ED", delivered: "#F0FDF4", cancelled: "#FEF2F2"
}[s] || "#F8FAFC");

const AdminPage = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const login = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else alert("Wrong password!");
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { if (authed) fetchOrders(); }, [authed]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = !search ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.phone?.includes(search) ||
      o.customer?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const todayOrders = orders.filter(o => {
    if (!o.createdAt?.toDate) return false;
    const d = o.createdAt.toDate();
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  if (!authed) return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, marginBottom: 24 }}>Admin Login</h1>
      <input type="password" placeholder="Enter admin password" value={password}
        onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 15, marginBottom: 16, boxSizing: "border-box" }} />
      <button onClick={login} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        Login
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, margin: 0 }}>📦 Orders Dashboard</h1>
          <p style={{ color: "#64748B", marginTop: 4, fontSize: 14 }}>Manage and track all customer orders</p>
        </div>
        <button onClick={fetchOrders} style={{ padding: "10px 20px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
        {[
          ["Total Orders", orders.length, "#3B82F6", "📋"],
          ["Today", todayOrders.length, "#8B5CF6", "📅"],
          ["Pending", orders.filter(o => o.status === "pending").length, "#F59E0B", "⏳"],
          ["Delivered", orders.filter(o => o.status === "delivered").length, "#10B981", "✅"],
          ["Cancelled", orders.filter(o => o.status === "cancelled").length, "#EF4444", "❌"],
          ["Revenue", "₹" + orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0).toLocaleString(), "#8B5CF6", "💰"],
        ].map(([label, value, color, icon]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name, phone, email, order ID..."
          style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", outline: "none" }}>
          <option value="all">All Status</option>
          {["pending","confirmed","shipped","out for delivery","delivered","cancelled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 40 }}>Loading orders...</div> : (
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>No orders found</div>
          ) : filteredOrders.map(order => (
            <div key={order.id} style={{ borderBottom: "1px solid #F1F5F9", opacity: order.status === "cancelled" ? 0.6 : 1 }}>
              <div style={{ padding: "16px 24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>#{order.orderId}</div>
                  <div style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>{order.customer?.name} · {order.customer?.phone}</div>
                  <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 1 }}>
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>₹{order.total?.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{order.paymentMethod?.toUpperCase()}</div>
                  </div>
                  <div style={{ background: statusBg(order.status), color: statusColor(order.status), padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1px solid ${statusColor(order.status)}20` }}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: 18 }}>{expandedId === order.id ? "▲" : "▼"}</div>
                </div>
              </div>
              {expandedId === order.id && (
                <div style={{ padding: "0 24px 20px", borderTop: "1px solid #F8FAFC", background: "#FAFBFF" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>CUSTOMER</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{order.customer?.name}</div>
                      <div style={{ color: "#64748B", fontSize: 13 }}>{order.customer?.phone}</div>
                      <div style={{ color: "#64748B", fontSize: 13 }}>{order.customer?.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>DELIVERY ADDRESS</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{order.customer?.address}</div>
                      <div style={{ color: "#64748B", fontSize: 13 }}>{order.customer?.city}, {order.customer?.state}</div>
                      <div style={{ color: "#64748B", fontSize: 13 }}>PIN: {order.customer?.pincode}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>ORDER ITEMS</div>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#0F172A", marginBottom: 2 }}>
                          {item.name} × {item.qty} — ₹{(item.price * item.qty).toLocaleString()}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>PAYMENT SUMMARY</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>Subtotal: ₹{order.subtotal?.toLocaleString()}</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>Discount: -₹{order.discount?.toLocaleString()}</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>Shipping: ₹{order.shipping?.toLocaleString()}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>Total: ₹{order.total?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Update Status:</div>
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                      style={{ padding: "8px 14px", borderRadius: 8, border: `2px solid ${statusColor(order.status)}`, color: statusColor(order.status), fontWeight: 700, cursor: "pointer", fontSize: 13, background: statusBg(order.status) }}>
                      {["pending","confirmed","shipped","out for delivery","delivered","cancelled"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
