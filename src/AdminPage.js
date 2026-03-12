import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, orderBy, query, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";

const ADMIN_PASSWORD = "cartaro2024";

const statusColor = (s) => ({
  pending: "#F59E0B", confirmed: "#3B82F6", shipped: "#8B5CF6",
  "out for delivery": "#F97316", delivered: "#10B981", cancelled: "#EF4444"
}[s] || "#64748B");

const statusBg = (s) => ({
  pending: "#FEF3C7", confirmed: "#EFF6FF", shipped: "#F5F3FF",
  "out for delivery": "#FFF7ED", delivered: "#F0FDF4", cancelled: "#FEF2F2"
}[s] || "#F8FAFC");

const EMPTY_PRODUCT = { name: "", category: "Gadgets", price: "", mrp: "", badge: "New", img: "📦", desc: "", stock: "", tags: "", costPrice: "", deliveryCost: "" };
const CATEGORIES = ["Gadgets", "Home Tools", "Fitness", "Car Accessories", "Smart Devices"];
const BADGES = ["New", "Trending", "Hot", "Best Seller", "Top Rated"];

const AdminPage = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);

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

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ firebaseId: d.id, ...d.data() })).sort((a,b) => a.id - b.id));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (authed) { fetchOrders(); fetchProducts(); } }, [authed]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) return alert("Name and price required!");
    const data = {
      ...productForm,
      price: Number(productForm.price),
      mrp: Number(productForm.mrp),
      stock: Number(productForm.stock),
      rating: productForm.rating ? Number(productForm.rating) : 4.5,
      reviews: productForm.reviews ? Number(productForm.reviews) : 0,
      tags: typeof productForm.tags === "string" ? productForm.tags.split(",").map(t => t.trim()) : productForm.tags,
    };
    if (editingProduct) {
      await updateDoc(doc(db, "products", editingProduct), data);
    } else {
      const maxId = products.length ? Math.max(...products.map(p => p.id || 0)) : 0;
      await addDoc(collection(db, "products"), { ...data, id: maxId + 1 });
    }
    await fetchProducts();
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
  };

  const deleteProduct = async () => {
    if (!deleteModal) return;
    await deleteDoc(doc(db, "products", deleteModal.firebaseId));
    setProducts(products.filter(p => p.firebaseId !== deleteModal.firebaseId));
    setDeleteModal(null);
  };

  const editProduct = (p) => {
    setProductForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags });
    setEditingProduct(p.firebaseId);
    setShowProductForm(true);
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

  const filteredProducts = products.filter(p =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

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
      <button onClick={login} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Login</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, margin: 0 }}>🛠️ Admin Dashboard</h1>
        <button onClick={() => { fetchOrders(); fetchProducts(); }} style={{ padding: "10px 20px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>🔄 Refresh</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "2px solid #E2E8F0" }}>
        {[["orders", "📦 Orders"], ["products", "🛍️ Products"], ["analytics", "�� Analytics"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "10px 24px", border: "none", borderBottom: tab === key ? "3px solid #2563EB" : "3px solid transparent", background: "none", fontWeight: tab === key ? 700 : 500, color: tab === key ? "#2563EB" : "#64748B", cursor: "pointer", fontSize: 15, marginBottom: -2 }}>
            {label}
          </button>
        ))}
      </div>

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name, phone, email, order ID..."
              style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", outline: "none" }}>
              <option value="all">All Status</option>
              {["pending","confirmed","shipped","out for delivery","delivered","cancelled"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>Showing {filteredOrders.length} of {orders.length} orders</div>
          {loading ? <div style={{ textAlign: "center", padding: 40 }}>Loading...</div> : (
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {filteredOrders.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>No orders found</div>
              : filteredOrders.map(order => (
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
                      <div style={{ color: "#94A3B8" }}>{expandedId === order.id ? "▲" : "▼"}</div>
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
                            <div key={i} style={{ fontSize: 13, color: "#0F172A", marginBottom: 2 }}>{item.name} × {item.qty} — ₹{(item.price * item.qty).toLocaleString()}</div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>PAYMENT</div>
                          <div style={{ fontSize: 13, color: "#64748B" }}>Subtotal: ₹{order.subtotal?.toLocaleString()}</div>
                          <div style={{ fontSize: 13, color: "#64748B" }}>Discount: -₹{order.discount?.toLocaleString()}</div>
                          <div style={{ fontSize: 13, color: "#64748B" }}>Shipping: ₹{order.shipping?.toLocaleString()}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>Total: ₹{order.total?.toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
        </>
      )}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="🔍 Search products..."
              style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }} />
            <button onClick={() => { setProductForm(EMPTY_PRODUCT); setEditingProduct(null); setShowProductForm(true); }}
              style={{ padding: "10px 24px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              ➕ Add Product
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 24 }}>
                  {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    ["name", "Product Name", "text", "span 2"],
                    ["img", "Emoji Icon", "text", "span 1"],
                    ["badge", "Badge", "select", "span 1"],
                    ["category", "Category", "select", "span 1"],
                    ["price", "Price (₹)", "number", "span 1"],
                    ["mrp", "MRP (₹)", "number", "span 1"],
                    ["stock", "Stock", "number", "span 1"],
                    ["desc", "Description", "textarea", "span 2"],
                    ["tags", "Tags (comma separated)", "text", "span 2"],
                    ["costPrice", "Your Cost Price (₹)", "number", "span 1"],
                    ["deliveryCost", "Delivery Cost (₹)", "number", "span 1"],
                  ].map(([field, label, type, span]) => (
                    <div key={field} style={{ gridColumn: span }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>{label}</label>
                      {type === "select" && field === "category" ? (
                        <select value={productForm[field]} onChange={e => setProductForm({...productForm, [field]: e.target.value})}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : type === "select" && field === "badge" ? (
                        <select value={productForm[field]} onChange={e => setProductForm({...productForm, [field]: e.target.value})}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}>
                          {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      ) : type === "textarea" ? (
                        <textarea value={productForm[field]} onChange={e => setProductForm({...productForm, [field]: e.target.value})}
                          rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                      ) : (
                        <input type={type} value={productForm[field]} onChange={e => setProductForm({...productForm, [field]: e.target.value})}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm(EMPTY_PRODUCT); }}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#F8FAFC", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveProduct}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    {editingProduct ? "Save Changes" : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirm Modal */}
          {deleteModal && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Delete Product?</h2>
                <p style={{ color: "#64748B", marginBottom: 8, fontSize: 14 }}>You are about to delete</p>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 24 }}>{deleteModal.img} {deleteModal.name}</p>
                <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 24 }}>This cannot be undone. The product will be removed from your store immediately.</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#F8FAFC", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                    Cancel
                  </button>
                  <button onClick={deleteProduct} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#EF4444", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filteredProducts.map(p => (
              <div key={p.firebaseId} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: 40 }}>{p.img}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => editProduct(p)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #3B82F6", color: "#3B82F6", background: "#EFF6FF", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>✏️ Edit</button>
                    <button onClick={() => setDeleteModal(p)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #EF4444", color: "#EF4444", background: "#FEF2F2", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🗑️</button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>{p.category} · {p.badge}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#2563EB" }}>₹{p.price?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: p.stock < 20 ? "#EF4444" : "#10B981", fontWeight: 600 }}>Stock: {p.stock}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "analytics" && (
        <AnalyticsTab orders={orders} products={products} />
      )}
    </div>
  );
};

export default AdminPage;

function AnalyticsTab({ orders, products }) {
  const [expenses, setExpenses] = useState({ platform: "", marketing: "", gst: "", other: "" });
  const [savedExpenses, setSavedExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cartaro_expenses") || "{}"); } catch { return {}; }
  });
  const [month, setMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });

  const saveExpenses = () => {
    const updated = { ...savedExpenses, [month]: expenses };
    setSavedExpenses(updated);
    localStorage.setItem("cartaro_expenses", JSON.stringify(updated));
    alert("Expenses saved!");
  };

  useEffect(() => {
    if (savedExpenses[month]) setExpenses(savedExpenses[month]);
    else setExpenses({ platform: "", marketing: "", gst: "", other: "" });
  }, [month]);

  const monthOrders = orders.filter(o => {
    if (!o.createdAt?.toDate) return false;
    const d = o.createdAt.toDate();
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    return key === month && o.status !== "cancelled";
  });
  const deliveredOrders = monthOrders.filter(o => o.status === "delivered");

  const revenue = deliveredOrders.reduce((s, o) => s + (o.total || 0), 0);

  const productCosts = deliveredOrders.reduce((s, o) =>
    s + (o.items || []).reduce((ps, item) => {
      const p = products.find(p => p.name === item.name);
      return ps + ((Number(p?.costPrice) || 0) * item.qty);
    }, 0), 0);

  const deliveryCosts = deliveredOrders.reduce((s, o) =>
    s + (o.items || []).reduce((ps, item) => {
      const p = products.find(p => p.name === item.name);
      return ps + ((Number(p?.deliveryCost) || 0) * item.qty);
    }, 0), 0);

  const gatewayFees = Math.round(revenue * 0.02);
  const fixedExpenses = Object.values(expenses).reduce((s, v) => s + (Number(v) || 0), 0);
  const totalExpenses = productCosts + deliveryCosts + gatewayFees + fixedExpenses;
  const netProfit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

  const productStats = {};
  monthOrders.forEach(o => {
    (o.items || []).forEach(item => {
      if (!productStats[item.name]) productStats[item.name] = { name: item.name, units: 0, revenue: 0 };
      productStats[item.name].units += item.qty;
      productStats[item.name].revenue += item.price * item.qty;
    });
  });
  const productList = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
  const fmt = n => "₹" + Number(n).toLocaleString("en-IN");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>📅 Select Month:</div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", fontWeight: 600 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          ["💰 Delivered Revenue", fmt(revenue), "#10B981", "#F0FDF4"],
          ["⏳ Pending Revenue", fmt(monthOrders.filter(o=>o.status==="pending").reduce((s,o)=>s+(o.total||0),0)), "#F59E0B", "#FEF3C7"],
          ["🛒 Product Costs", fmt(productCosts), "#F59E0B", "#FEF3C7"],
          ["🚚 Delivery Costs", fmt(deliveryCosts), "#8B5CF6", "#F5F3FF"],
          ["💳 Gateway Fees", fmt(gatewayFees), "#3B82F6", "#EFF6FF"],
          ["🏢 Fixed Expenses", fmt(fixedExpenses), "#EF4444", "#FEF2F2"],
          ["📊 Net Profit", fmt(netProfit), netProfit >= 0 ? "#10B981" : "#EF4444", netProfit >= 0 ? "#F0FDF4" : "#FEF2F2"],
        ].map(([label, value, color, bg]) => (
          <div key={label} style={{ background: bg, borderRadius: 14, padding: "18px 20px", border: `1.5px solid ${color}30` }}>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", marginBottom: 28, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, color: "#64748B" }}>Profit Margin</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: Number(profitMargin) >= 0 ? "#10B981" : "#EF4444" }}>{profitMargin}%</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ height: 12, background: "#E2E8F0", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(Math.abs(Number(profitMargin)), 100)}%`, background: Number(profitMargin) >= 0 ? "linear-gradient(90deg,#10B981,#34D399)" : "#EF4444", borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#64748B" }}>Orders this month</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>{monthOrders.length}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🏢 Monthly Fixed Expenses</div>
          {[["platform","Platform & Hosting (₹)"],["marketing","Marketing & Ads (₹)"],["gst","GST & Tax (₹)"],["other","Other Expenses (₹)"]].map(([key, label]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{label}</label>
              <input type="number" value={expenses[key]} onChange={e => setExpenses({ ...expenses, [key]: e.target.value })}
                placeholder="0" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <button onClick={saveExpenses} style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
            💾 Save Expenses
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📋 Expense Breakdown</div>
          {[
            ["Product Costs", productCosts, "#F59E0B"],
            ["Delivery Costs", deliveryCosts, "#8B5CF6"],
            ["Gateway Fees (2%)", gatewayFees, "#3B82F6"],
            ["Platform & Hosting", Number(expenses.platform)||0, "#EF4444"],
            ["Marketing & Ads", Number(expenses.marketing)||0, "#EC4899"],
            ["GST & Tax", Number(expenses.gst)||0, "#F97316"],
            ["Other", Number(expenses.other)||0, "#64748B"],
          ].map(([label, amount, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{fmt(amount)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Total Expenses</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#EF4444" }}>{fmt(totalExpenses)}</span>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🏆 Product Performance</div>
        {productList.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No orders this month yet</div>
        ) : productList.map((p, i) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#FEF3C7" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i+1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{p.units} units sold</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#10B981" }}>{fmt(p.revenue)}</div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>revenue</div>
            </div>
            <div style={{ width: 80 }}>
              <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(p.revenue / (productList[0]?.revenue || 1)) * 100}%`, background: "linear-gradient(90deg,#2563EB,#60A5FA)", borderRadius: 3 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
