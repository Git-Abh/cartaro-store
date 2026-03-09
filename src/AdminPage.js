import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";

const ADMIN_PASSWORD = "cartaro2024";

const AdminPage = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

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
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { if (authed) fetchOrders(); }, [authed]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const statusColor = (s) => ({
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    shipped: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444"
  }[s] || "#64748B");

  if (!authed) return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, marginBottom: 24 }}>Admin Login</h1>
      <input
        type="password"
        placeholder="Enter admin password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === "Enter" && login()}
        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 15, marginBottom: 16, boxSizing: "border-box" }}
      />
      <button onClick={login} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        Login
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800 }}>📦 Orders Dashboard</h1>
        <button onClick={fetchOrders} style={{ padding: "10px 20px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
        {[
          ["Total Orders", orders.length, "#3B82F6"],
          ["Pending", orders.filter(o => o.status === "pending").length, "#F59E0B"],
          ["Delivered", orders.filter(o => o.status === "delivered").length, "#10B981"],
          ["Cancelled", orders.filter(o => o.status === "cancelled").length, "#EF4444"],
          ["Revenue", "₹" + orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0).toLocaleString(), "#8B5CF6"],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 40 }}>Loading orders...</div> : (
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>No orders yet</div>
          ) : orders.map(order => (
            <div key={order.id} style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>#{order.orderId}</div>
                  <div style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
                    {order.customer?.name} · {order.customer?.phone} · {order.customer?.city}
                  </div>
                  <div style={{ color: "#64748B", fontSize: 13 }}>{order.customer?.address}, {order.customer?.pincode}</div>
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    {order.items?.map(i => `${i.name} x${i.qty}`).join(", ")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>₹{order.total?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{order.paymentMethod?.toUpperCase()}</div>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, border: `2px solid ${statusColor(order.status)}`, color: statusColor(order.status), fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                  >
                    {["pending","confirmed","shipped","delivered","cancelled"].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
