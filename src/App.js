import "./styles.css";
import AdminPage from "./AdminPage";
import { db } from "./firebase";
import emailjs from "@emailjs/browser";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, orderBy } from "firebase/firestore";
import { Analytics } from "@vercel/analytics/react";
import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: "AirFlow Pro Neck Fan",
    category: "Gadgets",
    price: 1299,
    mrp: 2499,
    rating: 4.7,
    reviews: 312,
    badge: "Trending",
    img: "🌀",
    desc: "360° hands-free personal cooling fan with 3 speeds. USB-C rechargeable, ultra-quiet motor. Perfect for Indian summers.",
    tags: ["portable", "summer", "cooling"],
    stock: 48,
  },
  {
    id: 2,
    name: "MagLift Electric Screwdriver",
    category: "Home Tools",
    price: 1899,
    mrp: 3499,
    rating: 4.8,
    reviews: 214,
    badge: "Best Seller",
    img: "🔧",
    desc: "Cordless electric screwdriver with 30 bits, magnetic tip, LED light, and auto-stop clutch. 2000mAh battery.",
    tags: ["diy", "tools", "electric"],
    stock: 23,
  },
  {
    id: 3,
    name: "SmartFit Pro Band",
    category: "Fitness",
    price: 2199,
    mrp: 4999,
    rating: 4.6,
    reviews: 891,
    badge: "Hot",
    img: "⌚",
    desc: "IP68 waterproof fitness tracker with SpO2, heart rate, 14-day battery life, and WhatsApp notifications.",
    tags: ["fitness", "health", "wearable"],
    stock: 67,
  },
  {
    id: 4,
    name: "AutoGrip Dashboard Mount",
    category: "Car Accessories",
    price: 699,
    mrp: 1499,
    rating: 4.9,
    reviews: 1204,
    badge: "Top Rated",
    img: "📱",
    desc: "One-touch auto-clamping phone mount with 360° rotation. Strong suction, fits all dashboards.",
    tags: ["car", "mount", "phone"],
    stock: 156,
  },
  {
    id: 5,
    name: "LumiDesk LED Lamp",
    category: "Smart Devices",
    price: 1599,
    mrp: 2999,
    rating: 4.5,
    reviews: 432,
    badge: "New",
    img: "💡",
    desc: "Touch-sensitive LED desk lamp with USB charging port, 3 color modes, and adjustable brightness. Eye-care certified.",
    tags: ["desk", "led", "study"],
    stock: 34,
  },
  {
    id: 6,
    name: "TurboBlend Mini",
    category: "Home Tools",
    price: 1099,
    mrp: 1999,
    rating: 4.7,
    reviews: 567,
    badge: "Trending",
    img: "🥤",
    desc: "Portable USB blender with 6 stainless blades. Blend smoothies, protein shakes on the go. BPA-free, 380ml.",
    tags: ["kitchen", "blender", "portable"],
    stock: 89,
  },
  {
    id: 7,
    name: "PulseX Jump Rope",
    category: "Fitness",
    price: 499,
    mrp: 999,
    rating: 4.8,
    reviews: 2341,
    badge: "Best Seller",
    img: "🪢",
    desc: "Anti-tangle speed jump rope with ball bearings, foam handles, and adjustable cable. Great for HIIT training.",
    tags: ["cardio", "hiit", "rope"],
    stock: 211,
  },
  {
    id: 8,
    name: "ClearView Dash Cam",
    category: "Car Accessories",
    price: 3499,
    mrp: 6999,
    rating: 4.6,
    reviews: 378,
    badge: "Hot",
    img: "📹",
    desc: "4K dual dash cam with night vision, 170° wide angle, loop recording, and G-sensor. 32GB card included.",
    tags: ["car", "camera", "safety"],
    stock: 18,
  },
  {
    id: 9,
    name: "NanoBoost Power Bank",
    category: "Gadgets",
    price: 1799,
    mrp: 3299,
    rating: 4.8,
    reviews: 945,
    badge: "Trending",
    img: "🔋",
    desc: "20000mAh slim power bank with 22.5W fast charge, dual USB-A + USB-C ports. Airline approved.",
    tags: ["power", "charging", "travel"],
    stock: 72,
  },
  {
    id: 10,
    name: "FlexGrip Resistance Bands",
    category: "Fitness",
    price: 799,
    mrp: 1499,
    rating: 4.7,
    reviews: 1532,
    badge: "Best Seller",
    img: "🏋️",
    desc: "Set of 5 latex resistance bands (10-50 lbs). Anti-snap, odorless, includes carry bag and workout guide.",
    tags: ["gym", "resistance", "home"],
    stock: 143,
  },
  {
    id: 11,
    name: "AirPure Mini Purifier",
    category: "Smart Devices",
    price: 2499,
    mrp: 4999,
    rating: 4.5,
    reviews: 287,
    badge: "New",
    img: "🌿",
    desc: "Desktop HEPA air purifier removes 99.97% pollutants. Ultra-quiet 25dB, 3-stage filtration, USB powered.",
    tags: ["air", "health", "office"],
    stock: 29,
  },
  {
    id: 12,
    name: "MagSafe Wireless Charger",
    category: "Gadgets",
    price: 899,
    mrp: 1799,
    rating: 4.6,
    reviews: 1678,
    badge: "Hot",
    img: "⚡",
    desc: "15W Qi2 wireless charging pad compatible with iPhone and Android. LED indicator, anti-slip base, 1m cable.",
    tags: ["wireless", "charging", "fast"],
    stock: 94,
  },
];

const CATEGORIES = [
  "All",
  "Gadgets",
  "Home Tools",
  "Fitness",
  "Car Accessories",
  "Smart Devices",
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    text: "Got my SmartFit Band in 2 days! Quality is amazing, looks premium. The packaging was so professional. Will definitely order again.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    city: "Delhi",
    text: "Ordered the dash cam and it's exactly as described. 4K footage is crystal clear. Cartaro has the best prices I've found online.",
    rating: 5,
    avatar: "RV",
  },
  {
    name: "Ananya Singh",
    city: "Bangalore",
    text: "The neck fan is a lifesaver this summer! Silent, powerful, and looks really cool. Fast delivery and great customer support.",
    rating: 5,
    avatar: "AS",
  },
  {
    name: "Karthik M",
    city: "Chennai",
    text: "Bought resistance bands and the jump rope. Both are heavy-duty quality. Can't believe these prices — felt like I was getting a deal!",
    rating: 5,
    avatar: "KM",
  },
  {
    name: "Sneha Patel",
    city: "Ahmedabad",
    text: "The LumiDesk lamp has transformed my WFH setup. USB charging port is super handy. Zero complaints, 10/10 would recommend Cartaro.",
    rating: 5,
    avatar: "SP",
  },
];

const FAQS = [
  {
    q: "How fast is delivery across India?",
    a: "We deliver across all major cities in 2–4 business days. Remote areas may take up to 7 days. All orders come with real-time tracking.",
  },
  {
    q: "What is your return and refund policy?",
    a: "We offer a hassle-free 10-day return policy. If you're not satisfied, raise a request and we'll arrange a free pickup and full refund.",
  },
  {
    q: "Are the products original and high quality?",
    a: "Yes! All Cartaro products are sourced from verified suppliers and undergo quality checks. Each product is tested before being listed.",
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes, we offer COD on all orders below ₹5,000. For orders above ₹5,000, we recommend online payment for faster processing.",
  },
  {
    q: "Can I track my order in real time?",
    a: "Absolutely. Once your order ships, you'll receive an SMS and email with a tracking link. You can also track on our Order Tracking page.",
  },
  {
    q: "Are there any discount coupons available?",
    a: "Yes! New users get 10% off with code WELCOME10. Subscribe to our newsletter for exclusive deals and flash sale alerts.",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;
const disc = (p, m) => Math.round(((m - p) / m) * 100);

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const StarRating = ({ rating, small }) => (
  <span style={{ color: "#F59E0B", fontSize: small ? 12 : 14 }}>
    {"★".repeat(Math.floor(rating))}
    {"☆".repeat(5 - Math.floor(rating))}
    <span
      style={{ color: "#94A3B8", marginLeft: 4, fontSize: small ? 11 : 13 }}
    >
      {rating}
    </span>
  </span>
);

const Badge = ({ label }) => {
  const colors = {
    Trending: "#3B82F6",
    "Best Seller": "#10B981",
    Hot: "#EF4444",
    "Top Rated": "#8B5CF6",
    New: "#F59E0B",
  };
  return (
    <span
      style={{
        background: colors[label] || "#3B82F6",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 4,
        letterSpacing: 0.5,
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
};

const ProductCard = ({
  product,
  onAddToCart,
  onWishlist,
  wishlist,
  dm,
  onView,
}) => {
  const [hovered, setHovered] = useState(false);
  const wished = wishlist.includes(product.id);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(product)}
      style={{
        background: dm ? "#1E293B" : "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 20px 60px rgba(59,130,246,0.15)"
          : "0 2px 16px rgba(0,0,0,0.06)",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "none",
        cursor: "pointer",
        border: "1px solid #F1F5F9",
      }}
    >
      {/* Image area */}
      <div
        style={{
          background: dm ? "#0F172A" : "linear-gradient(135deg,#EFF6FF,#F0F9FF)",
          padding: "28px 20px 20px",
          position: "relative",
          textAlign: "center",
        }}
      >
        <div style={{ position: "fixed", top: 12, left: 12 }}>
          <Badge label={product.badge} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            color: wished ? "#EF4444" : "#CBD5E1",
          }}
        >
          {wished ? "❤️" : "🤍"}
        </button>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1,
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
          }}
        >
          {product.img}
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "16px 16px 20px" }}>
        <div
          style={{
            fontSize: 11,
            color: "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 4,
          }}
        >
          {product.category}
        </div>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: dm ? "#F1F5F9" : "#0F172A",
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </div>
        <StarRating rating={product.rating} small />
        <span style={{ color: "#94A3B8", fontSize: 11, marginLeft: 4 }}>
          ({product.reviews})
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: dm ? "#F1F5F9" : "#0F172A",
            }}
          >
            {fmt(product.price)}
          </span>
          <span
            style={{
              fontSize: 13,
              color: "#94A3B8",
              textDecoration: "line-through",
            }}
          >
            {fmt(product.mrp)}
          </span>
          <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700 }}>
            {disc(product.price, product.mrp)}% off
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>

          <button
            onClick={(e) => { e.stopPropagation(); product.stock > 0 && onAddToCart(product); }}
            disabled={product.stock === 0}
            style={{
              flex: 2,
              padding: "9px 0",
              borderRadius: 10,
              border: "none",
              background: product.stock === 0 ? "#E2E8F0" : "linear-gradient(135deg,#2563EB,#3B82F6)",
              color: product.stock === 0 ? "#94A3B8" : "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Logo = ({ dark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "linear-gradient(135deg,#2563EB,#60A5FA)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
      }}
    >
      <span
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: 900,
          fontFamily: "'Syne', sans-serif",
        }}
      >
        C
      </span>
    </div>
    <span
      style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: 22,
        color: dark ? "#fff" : "#0F172A",
        letterSpacing: -0.5,
      }}
    >
      cart<span style={{ color: "#3B82F6" }}>aro</span>
    </span>
  </div>
);

// ─── PAGES ───────────────────────────────────────────────────────────────────

const HomePage = ({
  products,
  onAddToCart,
  onWishlist,
  wishlist,
  onView,
  setPage,
  dm,
}) => {
  const [faqOpen, setFaqOpen] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [couponVisible, setCouponVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCouponVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const trending = products
    .filter((p) => p.badge === "Trending" || p.badge === "Hot")
    .slice(0, 4);
  const bestsellers = products
    .filter((p) => p.badge === "Best Seller" || p.badge === "Top Rated")
    .slice(0, 4);

  return (
    <div>
      {/* Coupon Banner */}
      {couponVisible && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg,#0F172A,#1E3A5F)",
            color: "#fff",
            borderRadius: 14,
            padding: "14px 28px",
            zIndex: 999,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            animation: "slideUp 0.5s ease",
          }}
        >
          <span style={{ fontSize: 24 }}>🎁</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              New user? Get 10% OFF!
            </div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>
              Use code <strong style={{ color: "#60A5FA" }}>WELCOME10</strong>{" "}
              at checkout
            </div>
          </div>
          <button
            onClick={() => setCouponVisible(false)}
            style={{
              background: "none",
              border: "none",
              color: "#94A3B8",
              fontSize: 20,
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* HERO */}
      <section
        style={{
          background:
            "linear-gradient(160deg,#0F172A 0%,#1E3A5F 50%,#0F172A 100%)",
          padding: "100px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* bg decoration */}
        <div
          style={{
            position: "fixed",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(59,130,246,0.2),transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "fixed",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(96,165,250,0.15),transparent)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(96,165,250,0.3)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 12 }}>🚀</span>
            <span style={{ color: "#93C5FD", fontSize: 13, fontWeight: 600 }}>
              Trending products • Fast delivery • Best prices
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(36px,6vw,72px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.08,
              marginBottom: 20,
              letterSpacing: -1,
            }}
          >
            Shop Smarter.
            <br />
            <span style={{ color: "#60A5FA" }}>Live Better.</span>
          </h1>
          <p
            style={{
              color: "#94A3B8",
              fontSize: "clamp(15px,2vw,18px)",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 520,
              margin: "0 auto 36px",
            }}
          >
            Discover India's most trending gadgets, tools & accessories —
            curated, quality-checked, and delivered to your door in days.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setPage("shop")}
              style={{
                padding: "15px 36px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(37,99,235,0.5)",
              }}
            >
              Shop Now →
            </button>
            <button
              onClick={() => setPage("about")}
              style={{
                padding: "15px 32px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
              }}
            >
              About Cartaro
            </button>
          </div>
          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 40,
              justifyContent: "center",
              marginTop: 56,
              flexWrap: "wrap",
            }}
          >
            {[
              ["50,000+", "Happy Customers"],
              ["4.8★", "Average Rating"],
              ["2-4 Days", "Pan-India Delivery"],
              ["7 Days", "Easy Returns"],
            ].map(([val, lab]) => (
              <div key={lab} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {val}
                </div>
                <div style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 13, marginTop: 2 }}>
                  {lab}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section style={{ padding: "72px 24px", background: dm ? "#0F172A" : "#FAFBFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader
            title="🔥 Trending Right Now"
            sub="Products flying off shelves across India"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 24,
              marginTop: 40,
            }}
          >
            {trending.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                wishlist={wishlist}
                onView={onView}
                dm={dm}
              />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section style={{ padding: "72px 24px", background: dm ? "#1E293B" : "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            title="Why Thousands Choose Cartaro"
            sub="We're not just a store — we're a promise"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
              gap: 24,
              marginTop: 48,
            }}
          >
            {[
              {
                icon: "🚚",
                title: "Free Fast Delivery",
                desc: "Free shipping on orders above ₹599. Pan-India delivery in 2–4 days with real-time tracking.",
              },
              {
                icon: "🛡️",
                title: "100% Secure Payments",
                desc: "UPI, cards, wallets & COD. SSL encrypted checkout with Razorpay integration.",
              },
              {
                icon: "↩️",
                title: "7-Day Easy Returns",
                desc: "Not happy? Raise a return in seconds. Free pickup & instant refund. No questions asked.",
              },
              {
                icon: "✅",
                title: "Quality Guaranteed",
                desc: "Every product is sourced from verified suppliers and quality checked before listing.",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                desc: "Chat, WhatsApp, or email — our team is always here to help you with any issue.",
              },
              {
                icon: "💰",
                title: "Best Price Promise",
                desc: "Find it cheaper elsewhere? We'll match it. Premium quality at prices that make sense.",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  padding: "28px 24px",
                  borderRadius: 16,
                  border: dm ? "1px solid #334155" : "1px solid #E2E8F0",
                  background: dm ? "#0F172A" : "#FAFBFF",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: dm ? "#F1F5F9" : "#0F172A",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 14, lineHeight: 1.6 }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section style={{ padding: "72px 24px", background: dm ? "#0F172A" : "#FAFBFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader
            title="⭐ Best Sellers"
            sub="Most loved products by our customers"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 24,
              marginTop: 40,
            }}
          >
            {bestsellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                wishlist={wishlist}
                onView={onView}
                dm={dm}
              />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={() => setPage("shop")}
              style={{
                padding: "14px 40px",
                borderRadius: 12,
                background: "#0F172A",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
              }}
            >
              View All Products →
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "72px 24px", background: "#0F172A" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            title="What Our Customers Say"
            sub="Real reviews from real people across India"
            dark
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 20,
              marginTop: 48,
            }}
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16,
                  padding: "24px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{ color: "#F59E0B", fontSize: 16, marginBottom: 12 }}
                >
                  {"★".repeat(t.rating)}
                </div>
                <p
                  style={{
                    color: "#CBD5E1",
                    fontSize: 14,
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#2563EB,#60A5FA)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div
                      style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}
                    >
                      {t.name}
                    </div>
                    <div style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 12 }}>
                      {t.city}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "72px 24px", background: dm ? "#1E293B" : "#fff" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <SectionHeader
            title="Frequently Asked Questions"
            sub="Everything you need to know about Cartaro"
          />
          <div style={{ marginTop: 48 }}>
            {FAQS.map((f, i) => (
              <div
                key={i}
                style={{
                  borderBottom: dm ? "1px solid #334155" : "1px solid #E2E8F0",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "18px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: dm ? "#F1F5F9" : "#0F172A",
                    }}
                  >
                    {f.q}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      color: "#3B82F6",
                      transform: faqOpen === i ? "rotate(45deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    +
                  </span>
                </button>
                {faqOpen === i && (
                  <div
                    style={{
                      color: dm ? "#94A3B8" : "#64748B",
                      fontSize: 14,
                      lineHeight: 1.7,
                      paddingBottom: 18,
                    }}
                  >
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section
        style={{
          padding: "72px 24px",
          background: dm ? "#1E293B" : "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
        }}
      >
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: dm ? "#F1F5F9" : "#0F172A",
              marginBottom: 12,
            }}
          >
            Get Exclusive Deals First
          </h2>
          <p
            style={{
              color: dm ? "#94A3B8" : "#64748B",
              fontSize: 15,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Join 50,000+ smart shoppers. Get flash sales, new arrivals &
            discount codes straight to your inbox.
          </p>
          {subscribed ? (
            <div
              style={{
                background: "#10B981",
                color: "#fff",
                borderRadius: 12,
                padding: "16px 24px",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              🎉 You're in! Check your inbox for a surprise discount.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 10,
                maxWidth: 460,
                margin: "0 auto",
                flexWrap: "wrap",
              }}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: dm ? "1.5px solid #334155" : "1.5px solid #BFDBFE",
                  fontSize: 15,
                  outline: "none",
                  background: dm ? "#0F172A" : "#fff",
                  color: dm ? "#F1F5F9" : "#0F172A",
                }}
              />
              <button
                onClick={() => email && setSubscribed(true)}
                style={{
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section
        style={{
          padding: "32px 24px",
          background: dm ? "#1E293B" : "#fff",
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {[
            "🔒 SSL Secured",
            "📦 Free Returns",
            "✅ Quality Checked",
            "🚚 Pan-India Delivery",
            "💳 Safe Payments",
            "📞 24/7 Support",
          ].map((b) => (
            <div
              key={b}
              style={{
                color: dm ? "#94A3B8" : "#64748B",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const SectionHeader = ({ title, sub, dark }) => (
  <div style={{ textAlign: "center" }}>
    <h2
      style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(24px,4vw,38px)",
        fontWeight: 800,
        color: dark ? "#fff" : "#0F172A",
        marginBottom: 12,
        letterSpacing: -0.5,
      }}
    >
      {title}
    </h2>
    <p style={{ color: dark ? "#64748B" : "#94A3B8", fontSize: 16 }}>{sub}</p>
  </div>
);

const ShopPage = ({ products, onAddToCart, onWishlist, wishlist, onView, dm }) => {
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(10000);

  let filtered = products.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())) &&
      p.price <= priceRange
  );
  if (sort === "price_asc")
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price_desc")
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "rating")
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 36,
          fontWeight: 800,
          color: dm ? "#F1F5F9" : "#0F172A",
          marginBottom: 8,
        }}
      >
        Shop All Products
      </h1>
      <p style={{ color: "#94A3B8", marginBottom: 36 }}>
        Showing {filtered.length} products
      </p>

      {/* Search + Sort */}
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}
      >
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <span
            style={{
              position: "fixed",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              fontSize: 16,
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              width: "100%",
              padding: "12px 14px 12px 40px",
              borderRadius: 10,
              border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
            fontSize: 14,
            background: dm ? "#1E293B" : "#fff",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="default">Sort: Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Category Filters */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              padding: "8px 18px",
              borderRadius: 100,
              border: cat === c ? "none" : "1.5px solid #E2E8F0",
              background:
                cat === c ? "linear-gradient(135deg,#2563EB,#3B82F6)" : "#fff",
              color: cat === c ? "#fff" : "#475569",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Price Slider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 36,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: dm ? "#94A3B8" : "#64748B",
            fontWeight: 600,
            minWidth: 70,
          }}
        >
          Max Price:
        </span>
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={priceRange}
          onChange={(e) => setPriceRange(+e.target.value)}
          style={{ flex: 1, maxWidth: 300, accentColor: "#3B82F6" }}
        />
        <span style={{ fontWeight: 700, color: dm ? "#F1F5F9" : "#0F172A", minWidth: 60 }}>
          {fmt(priceRange)}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8" }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>No products found</div>
          <div style={{ marginTop: 8 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 24,
          }}
        >
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onWishlist={onWishlist}
              wishlist={wishlist}
              onView={onView}
              dm={dm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductPage = ({
  product,
  onAddToCart,
  onWishlist,
  wishlist,
  products,
  setPage,
  dm,
}) => {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("desc");
  const [added, setAdded] = useState(false);
  if (!product)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        Select a product from the shop.
      </div>
    );
  const wished = wishlist.includes(product.id);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div
        style={{
          color: "#94A3B8",
          fontSize: 13,
          marginBottom: 32,
          display: "flex",
          gap: 8,
        }}
      >
        <span
          onClick={() => setPage("home")}
          style={{ cursor: "pointer", color: "#3B82F6" }}
        >
          Home
        </span>{" "}
        /
        <span
          onClick={() => setPage("shop")}
          style={{ cursor: "pointer", color: "#3B82F6" }}
        >
          Shop
        </span>{" "}
        /<span>{product.name}</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "start",
        }}
      >
        {/* Image */}
        <div
          style={{
            background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
            borderRadius: 24,
            padding: "60px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 120,
              filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.12))",
            }}
          >
            {product.img}
          </div>
          <Badge label={product.badge} />
        </div>
        {/* Info */}
        <div>
          <div
            style={{
              fontSize: 13,
              color: "#3B82F6",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            {product.category}
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 30,
              fontWeight: 800,
              color: dm ? "#F1F5F9" : "#0F172A",
              marginBottom: 12,
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>
          <div style={{ marginBottom: 16 }}>
            <StarRating rating={product.rating} />{" "}
            <span style={{ color: "#94A3B8", fontSize: 13 }}>
              ({product.reviews} reviews)
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 36,
                fontWeight: 800,
                color: dm ? "#F1F5F9" : "#0F172A",
              }}
            >
              {fmt(product.price)}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#94A3B8",
                textDecoration: "line-through",
              }}
            >
              {fmt(product.mrp)}
            </span>
            <span
              style={{
                background: "#DCFCE7",
                color: "#16A34A",
                fontWeight: 700,
                fontSize: 14,
                padding: "4px 10px",
                borderRadius: 6,
              }}
            >
              {disc(product.price, product.mrp)}% OFF
            </span>
          </div>
          <div
            style={{
              background: dm ? "#1E293B" : "#FFF7ED",
              border: "1px solid #FED7AA",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 24,
              fontSize: 13,
              color: "#9A3412",
            }}
          >
            ⚡ Only <strong>{product.stock} left</strong> in stock — Order soon!
          </div>
          <p
            style={{
              color: dm ? "#94A3B8" : "#475569",
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            {product.desc}
          </p>
          {/* Qty */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <span style={{ fontWeight: 600, color: "#374151" }}>Qty:</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => qty > 1 && setQty((q) => q - 1)}
                style={{
                  width: 40,
                  height: 40,
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                −
              </button>
              <span
                style={{
                  width: 40,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{
                  width: 40,
                  height: 40,
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
          </div>
          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <button
              onClick={product.stock > 0 ? handleAdd : undefined}
              disabled={product.stock === 0}
              style={{
                flex: 1,
                padding: "15px 0",
                borderRadius: 12,
                border: "none",
                background: product.stock === 0 ? "#E2E8F0" : added ? "#10B981" : "linear-gradient(135deg,#2563EB,#3B82F6)",
                color: product.stock === 0 ? "#94A3B8" : "#fff",
                fontWeight: 700,
                fontSize: 16,
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                transition: "background 0.3s",
              }}
            >
              {product.stock === 0 ? "Out of Stock" : added ? "✓ Added to Cart!" : "Add to Cart"}
            </button>
            <button
              onClick={() => onWishlist(product.id)}
              style={{
                padding: "15px 20px",
                borderRadius: 12,
                border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                background: dm ? "#1E293B" : "#fff",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              {wished ? "❤️" : "🤍"}
            </button>
          </div>
          {/* Perks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "🚚 Free delivery on orders above ₹599",
              "↩️ 10-day hassle-free returns",
              "🛡️ Secure payment — UPI, cards, COD",
              "✅ Quality guaranteed by Cartaro",
            ].map((p) => (
              <div key={p} style={{ color: dm ? "#94A3B8" : "#475569", fontSize: 14 }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 56 }}>
        <div
          style={{ display: "flex", gap: 0, borderBottom: "2px solid #E2E8F0" }}
        >
          {["desc", "reviews", "shipping"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "12px 24px",
                border: "none",
                background: "none",
                fontWeight: 700,
                fontSize: 14,
                color: tab === t ? "#3B82F6" : "#94A3B8",
                borderBottom:
                  tab === t ? "2px solid #3B82F6" : "2px solid transparent",
                marginBottom: -2,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t === "desc"
                ? "Description"
                : t === "reviews"
                ? "Reviews"
                : "Shipping"}
            </button>
          ))}
        </div>
        <div
          style={{
            padding: "28px 0",
            color: dm ? "#94A3B8" : "#475569",
            fontSize: 15,
            lineHeight: 1.8,
          }}
        >
          {tab === "desc" && (
            <p>
              {product.desc} <br />
              <br />
              All Cartaro products undergo rigorous quality checks before
              dispatch. This product comes in original packaging with a 6-month
              warranty against manufacturing defects.
            </p>
          )}
          {tab === "reviews" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 56,
                      fontWeight: 800,
                      color: dm ? "#F1F5F9" : "#0F172A",
                    }}
                  >
                    {product.rating}
                  </div>
                  <StarRating rating={product.rating} />
                  <div style={{ color: "#94A3B8", fontSize: 13, marginTop: 4 }}>
                    {product.reviews} reviews
                  </div>
                </div>
              </div>
              {[5, 4, 3].map((stars) => (
                <div
                  key={stars}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, minWidth: 40 }}>{stars}★</span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: dm ? "#334155" : "#F1F5F9",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "#F59E0B",
                        width:
                          stars === 5 ? "70%" : stars === 4 ? "20%" : "10%",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "shipping" && (
            <p>
              🚚 <strong>Free delivery</strong> on orders above ₹599 across
              India.
              <br />
              📦 Orders are dispatched within 24 hours of placement.
              <br />
              🗓️ Estimated delivery: 2–4 business days (major cities), 5–7 days
              (others).
              <br />
              🔍 Real-time tracking link sent via SMS & email after dispatch.
            </p>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: dm ? "#F1F5F9" : "#0F172A",
              marginBottom: 28,
            }}
          >
            You Might Also Like
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: 20,
            }}
          >
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                wishlist={wishlist}
                onView={() => {}}
                dm={dm}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WishlistPage = ({ wishlist, products, onAddToCart, onWishlist, setPage, dm }) => {
  const wishedProducts = products.filter(p => wishlist.includes(p.id));
  if (wishedProducts.length === 0) return (
    <div style={{ textAlign: "center", padding: "100px 24px", background: dm ? "#0F172A" : "transparent", minHeight: "100vh" }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🤍</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, marginBottom: 12 }}>Your wishlist is empty</h2>
      <p style={{ color: dm ? "#94A3B8" : "#64748B", marginBottom: 32 }}>Save items you love and find them here.</p>
      <button onClick={() => setPage("shop")} style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>Browse Products</button>
    </div>
  );
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", background: dm ? "#0F172A" : "transparent", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, marginBottom: 8, color: dm ? "#F1F5F9" : "#0F172A" }}>My Wishlist</h1>
      <p style={{ color: dm ? "#94A3B8" : "#64748B", marginBottom: 32 }}>{wishedProducts.length} saved items</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
        {wishedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} dm={dm} onView={() => setPage("shop")} />)}
      </div>
    </div>
  );
};

const CartPage = ({ cart, setCart, setPage, setCoupon, coupon, discount, dm }) => {
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
  const COUPONS = { WELCOME10: 10, CARTARO15: 15, SAVE20: 20 };

  const updateQty = (id, delta) =>
    setCart((c) => {
      const idx = c.findIndex((i) => i.id === id);
      if (idx === -1) return c;
      const updated = [...c];
      updated[idx] = {
        ...updated[idx],
        qty: Math.max(1, updated[idx].qty + delta),
      };
      return updated;
    });
  const remove = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = Math.round(subtotal * (discount / 100));
  const shipping = subtotal > 599 ? 0 : 99;
  const total = subtotal - discountAmt + shipping;

  const applyCode = () => {
    if (COUPONS[couponInput.toUpperCase()]) {
      setCoupon({
        code: couponInput.toUpperCase(),
        pct: COUPONS[couponInput.toUpperCase()],
      });
      setCouponMsg({
        type: "success",
        text: `🎉 ${COUPONS[couponInput.toUpperCase()]}% discount applied!`,
      });
    } else {
      setCouponMsg({ type: "error", text: "❌ Invalid coupon code." });
    }
  };

  if (cart.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🛒</div>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: dm ? "#F1F5F9" : "#0F172A",
            marginBottom: 12,
          }}
        >
          Your cart is empty
        </h2>
        <p style={{ color: "#94A3B8", marginBottom: 32 }}>
          Looks like you haven't added anything yet.
        </p>
        <button
          onClick={() => setPage("shop")}
          style={{
            padding: "14px 36px",
            borderRadius: 12,
            background: "linear-gradient(135deg,#2563EB,#3B82F6)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
          }}
        >
          Start Shopping
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 32,
        }}
      >
        Your Cart ({cart.reduce((s, i) => s + i.qty, 0)} items)
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          ["@media (max-width: 768px)"]: { gridTemplateColumns: "1fr" },
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                background: dm ? "#1E293B" : "#fff",
                borderRadius: 16,
                padding: "20px",
                border: dm ? "1px solid #334155" : "1px solid #E2E8F0",
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  flexShrink: 0,
                }}
              >
                {item.img}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: dm ? "#F1F5F9" : "#0F172A",
                    marginBottom: 4,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{ color: "#94A3B8", fontSize: 13, marginBottom: 8 }}
                >
                  {item.category}
                </div>
                <div
                  style={{ fontWeight: 800, fontSize: 17, color: dm ? "#F1F5F9" : "#0F172A" }}
                >
                  {fmt(item.price)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    style={{
                      width: 32,
                      height: 32,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{ width: 32, textAlign: "center", fontWeight: 700 }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    style={{
                      width: 32,
                      height: 32,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#EF4444",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Summary */}
        <div
          style={{
            background: dm ? "#0F172A" : "#FAFBFF",
            borderRadius: 16,
            padding: "24px",
            border: dm ? "1px solid #334155" : "1px solid #E2E8F0",
            position: "sticky",
            top: 90,
          }}
        >
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 20,
            }}
          >
            Order Summary
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Row label="Subtotal" value={fmt(subtotal)} />
            {discount > 0 && (
              <Row
                label={`Discount (${discount}%)`}
                value={`-${fmt(discountAmt)}`}
                green
              />
            )}
            <Row
              label="Shipping"
              value={shipping === 0 ? "FREE 🎉" : fmt(shipping)}
            />
            <div style={{ borderTop: dm ? "1px solid #334155" : "1px solid #E2E8F0", paddingTop: 12 }}>
              <Row label="Total" value={fmt(total)} bold />
            </div>
          </div>
          {/* Coupon */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={applyCode}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "#0F172A",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: couponMsg.type === "success" ? "#10B981" : "#EF4444",
                }}
              >
                {couponMsg.text}
              </div>
            )}
          </div>
          <button
            onClick={() => setPage("checkout")}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 12,
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
            }}
          >
            Proceed to Checkout →
          </button>
          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              color: "#94A3B8",
              fontSize: 12,
            }}
          >
            🔒 Secure checkout · UPI · Cards · COD
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold, green }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 14 }}>{label}</span>
    <span
      style={{
        fontWeight: bold ? 800 : 600,
        fontSize: bold ? 18 : 14,
        color: green ? "#10B981" : bold ? "#0F172A" : "#374151",
      }}
    >
      {value}
    </span>
  </div>
);

const CheckoutPage = ({ cart, setCart, setPage, discount, dm }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment: "upi",
  });
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = Math.round(subtotal * (discount / 100));
  const shipping = subtotal > 599 ? 0 : 99;
  const total = subtotal - discountAmt + shipping;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter valid 10-digit number";
    if (!form.email.includes("@")) e.email = "Enter valid email";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter 6-digit pincode";
    return e;
  };

  const placeOrder = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const id = "CRT" + Date.now().toString().slice(-8);
    try {
      await addDoc(collection(db, "orders"), {
        orderId: id,
        customer: form,
        items: cart,
        subtotal,
        discount: discountAmt,
        shipping,
        total,
        status: "pending",
        paymentMethod: form.payment,
        createdAt: new Date()
      });
    } catch (err) {
      console.error("Order save failed:", err);
    }
    emailjs.send("service_er39cen", "template_tb6qfi4", {
      customer_email: form.email,
      customer_name: form.name,
      order_id: id,
      items: cart.map(i => `${i.name} x${i.qty}`).join(", "),
      total: "₹" + total.toLocaleString(),
      payment_method: form.payment.toUpperCase(),
      address: form.address,
      city: form.city,
      pincode: form.pincode
    }, "gOBtPAkj0_9RCLVm5").then(() => console.log("Email sent successfully!")).catch(err => console.error("Email failed:", JSON.stringify(err)));
    setOrderId(id);
    setPlaced(true);
    setCart([]);
  };

  if (placed)
    return (
      <div
        style={{
          maxWidth: 560,
          margin: "80px auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            color: dm ? "#F1F5F9" : "#0F172A",
            marginBottom: 12,
          }}
        >
          Order Placed!
        </h1>
        <p style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 16, marginBottom: 8 }}>
          Thank you, <strong>{form.name}</strong>! Your order is confirmed.
        </p>
        <div
          style={{
            background: dm ? "#1E293B" : "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 13, color: "#3B82F6", fontWeight: 600 }}>
            Order ID
          </div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: dm ? "#F1F5F9" : "#0F172A",
            }}
          >
            #{orderId}
          </div>
        </div>
        <p style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 14, marginBottom: 32 }}>
          A confirmation has been sent to <strong>{form.email}</strong>.
          Expected delivery in 2–4 business days.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => setPage("tracking")}
            style={{
              padding: "13px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
          >
            Track Order
          </button>
          <button
            onClick={() => setPage("home")}
            style={{
              padding: "13px 28px",
              borderRadius: 12,
              background: dm ? "#334155" : "#F1F5F9",
              color: dm ? "#F1F5F9" : "#0F172A",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );

  const inp = (field, label, placeholder, half) => (
    <div style={{ gridColumn: half ? "span 1" : "span 2" }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        value={form[field]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [field]: e.target.value }));
          setErrors((er) => ({ ...er, [field]: "" }));
        }}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          border: `1.5px solid ${errors[field] ? "#EF4444" : "#E2E8F0"}`,
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {errors[field] && (
        <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
          {errors[field]}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 32,
        }}
      >
        Checkout
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 340px",
          gap: 32,
          alignItems: "start",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              marginBottom: 20,
              color: dm ? "#F1F5F9" : "#0F172A",
            }}
          >
            Shipping Details
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 32,
            }}
          >
            {inp("name", "Full Name", "Your full name")}
            {inp("phone", "Phone Number", "10-digit mobile number", true)}
            {inp("email", "Email Address", "your@email.com", true)}
            {inp("address", "Address")}
            {inp("city", "City", "Your city", true)}
            {inp("state", "State", "Your state", true)}
            {inp("pincode", "Pincode", "6-digit pincode", true)}
          </div>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              marginBottom: 16,
              color: dm ? "#F1F5F9" : "#0F172A",
            }}
          >
            Payment Method
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["upi", "📱 UPI / QR Code"],
              ["card", "💳 Credit / Debit Card"],
              ["cod", "💵 Cash on Delivery"],
            ].map(([val, label]) => (
              <label
                key={val}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1.5px solid ${
                    form.payment === val ? "#3B82F6" : "#E2E8F0"
                  }`,
                  background: form.payment === val ? "#EFF6FF" : "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={val}
                  checked={form.payment === val}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, payment: e.target.value }))
                  }
                  style={{ accentColor: "#3B82F6" }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        {/* Order Summary */}
        <div
          style={{
            background: dm ? "#0F172A" : "#FAFBFF",
            borderRadius: 16,
            padding: "24px",
            border: dm ? "1px solid #334155" : "1px solid #E2E8F0",
            position: "sticky",
            top: 90,
          }}
        >
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            Order Summary
          </h3>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>{item.img}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: dm ? "#F1F5F9" : "#0F172A" }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>
                  Qty: {item.qty}
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                {fmt(item.price * item.qty)}
              </span>
            </div>
          ))}
          <div
            style={{
              borderTop: dm ? "1px solid #334155" : "1px solid #E2E8F0",
              paddingTop: 14,
              marginTop: 4,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Row label="Subtotal" value={fmt(subtotal)} />
            {discount > 0 && (
              <Row
                label={`Discount (${discount}%)`}
                value={`-${fmt(discountAmt)}`}
                green
              />
            )}
            <Row
              label="Shipping"
              value={shipping === 0 ? "FREE" : fmt(shipping)}
            />
            <div style={{ borderTop: dm ? "1px solid #334155" : "1px solid #E2E8F0", paddingTop: 10 }}>
              <Row label="Total" value={fmt(total)} bold />
            </div>
          </div>
          <button
            onClick={placeOrder}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 12,
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              marginTop: 20,
            }}
          >
            Place Order →
          </button>
          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              color: "#94A3B8",
              fontSize: 12,
            }}
          >
            🔒 Your data is encrypted & secure
          </div>
        </div>
      </div>
    </div>
  );
};

const TrackingPage = ({ dm }) => {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [docId, setDocId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const STEPS = ["Order Placed", "Confirmed", "Packed & Shipped", "Out for Delivery", "Delivered"];
  const STATUS_STEP = { "pending": 0, "confirmed": 1, "shipped": 2, "out for delivery": 3, "delivered": 4 };
  const cancelOrder = async () => {
    if (!docId) return;
    setCancelling(true);
    setShowCancelModal(false);
    try {
      await updateDoc(doc(db, "orders", docId), { status: "cancelled" });
      setResult(prev => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      console.error("Cancel error:", err);
    }
    setCancelling(false);
  };
  const track = async () => {
    if (!orderId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const q = query(collection(db, "orders"), where("orderId", "==", orderId.trim().toUpperCase()));
      const snap = await getDocs(q);
      console.log("Found:", snap.size, "for", orderId.trim().toUpperCase());
      if (snap.empty) { setResult("not_found"); }
      else { setDocId(snap.docs[0].id); setResult(snap.docs[0].data()); }
    } catch (err) {
      console.error("Track error:", err);
      setResult("not_found");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px", background: dm ? "#0F172A" : "transparent", minHeight: "100vh" }}>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 36,
          fontWeight: 800,
          marginBottom: 8,
          color: dm ? "#F1F5F9" : "#0F172A",
        }}
      >
        Track Your Order
      </h1>
      <p style={{ color: "#94A3B8", marginBottom: 36 }}>
        Enter your Order ID to get real-time status updates.
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. CRT12345678"
          style={{
            flex: 1,
            padding: "13px 16px",
            borderRadius: 12,
            border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
            fontSize: 15,
            outline: "none",
          }}
        />
        <button
          onClick={track}
          style={{
            padding: "13px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg,#2563EB,#3B82F6)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
          }}
        >
          Track
        </button>
      </div>


      {result === "not_found" && (
        <div
          style={{
            background: dm ? "#1E293B" : "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: 12,
            padding: "20px",
            color: "#DC2626",
            fontWeight: 600,
          }}
        >
          ❌ Order not found. Please check your Order ID and try again.
        </div>
      )}
      {result && result !== "not_found" && (
        <div
          style={{
            background: dm ? "#1E293B" : "#fff",
            borderRadius: 20,
            border: dm ? "1px solid #334155" : "1px solid #E2E8F0",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              padding: "24px 28px",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Order ID
            </div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                color: "#fff",
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              #{orderId.toUpperCase()}
            </div>
          </div>
          <div style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 32,
              }}
            >
              {[
                ["Items", result.items?.map(i => `${i.name} x${i.qty}`).join(", ")],
                ["Customer", result.customer?.name],
                ["City", result.customer?.city],
                ["Order Date", result.createdAt?.toDate ? result.createdAt.toDate().toLocaleDateString("en-IN") : "N/A"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2 }}
                  >
                    {k}
                  </div>
                  <div style={{ fontWeight: 700, color: dm ? "#F1F5F9" : "#0F172A" }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Progress */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "fixed",
                  top: 16,
                  left: 16,
                  right: 16,
                  height: 4,
                  background: "#E2E8F0",
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg,#2563EB,#60A5FA)",
                    borderRadius: 2,
                    width: `${((STATUS_STEP[result.status?.toLowerCase()] ?? 0) / (STEPS.length - 1)) * 100}%`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      width: `${100 / STEPS.length}%`,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: i <= (STATUS_STEP[result.status?.toLowerCase()] ?? 0)
                          ? "linear-gradient(135deg,#2563EB,#3B82F6)"
                          : "#E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 14,
                        zIndex: 1,
                      }}
                    >
                      {i <= (STATUS_STEP[result.status?.toLowerCase()] ?? 0) ? "✓" : i + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: i <= (STATUS_STEP[result.status?.toLowerCase()] ?? 0) ? "#0F172A" : "#94A3B8",
                        fontWeight: i <= (STATUS_STEP[result.status?.toLowerCase()] ?? 0) ? 700 : 400,
                        textAlign: "center",
                        lineHeight: 1.3,
                      }}
                    >
                      {s}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                marginTop: 28,
                background: dm ? "#1E293B" : "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#16A34A",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              📍 Current Status: {result.status}
            </div>
            {result.status === "cancelled" && (
              <div style={{ marginTop: 16, background: dm ? "#1E293B" : "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontWeight: 700, fontSize: 14 }}>
                ❌ This order has been cancelled.
              </div>
            )}
            {result.status === "pending" && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
                style={{ marginTop: 20, width: "100%", padding: "13px", background: dm ? "#1E293B" : "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              >
                {cancelling ? "Cancelling..." : "❌ Cancel Order"}
              </button>
            )}
            {showCancelModal && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ background: dm ? "#1E293B" : "#fff", borderRadius: 20, padding: 32, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Cancel Order?</h2>
                  <p style={{ color: dm ? "#94A3B8" : "#64748B", marginBottom: 24, fontSize: 14 }}>Are you sure you want to cancel order <strong>#{result.orderId}</strong>? This cannot be undone.</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0", background: dm ? "#0F172A" : "#F8FAFC", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                      Keep Order
                    </button>
                    <button onClick={cancelOrder} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#DC2626", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                      Yes, Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AboutPage = ({ dm }) => (
  <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
    <div style={{ textAlign: "center", marginBottom: 64 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🛍️</div>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(32px,5vw,52px)",
          fontWeight: 800,
          color: dm ? "#F1F5F9" : "#0F172A",
          marginBottom: 16,
          letterSpacing: -1,
        }}
      >
        We're Building the Future
        <br />
        of Smart Shopping in India
      </h1>
      <p
        style={{
          color: dm ? "#94A3B8" : "#64748B",
          fontSize: 17,
          lineHeight: 1.8,
          maxWidth: 620,
          margin: "0 auto",
        }}
      >
        Cartaro was founded with one mission: make premium, trending products
        accessible and affordable for every Indian. From Gadgets to Fitness gear
        — we've got India covered.
      </p>
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
        gap: 20,
        marginBottom: 64,
      }}
    >
      {[
        ["2022", "Year Founded"],
        ["50,000+", "Happy Customers"],
        ["1,000+", "Products Sold Monthly"],
        ["4.8★", "Average Rating"],
      ].map(([num, lab]) => (
        <div
          key={lab}
          style={{
            background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
            borderRadius: 16,
            padding: "28px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: "#2563EB",
            }}
          >
            {num}
          </div>
          <div style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 14, marginTop: 4 }}>
            {lab}
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        marginBottom: 64,
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: dm ? "#F1F5F9" : "#0F172A",
            marginBottom: 16,
          }}
        >
          Our Story
        </h2>
        <p
          style={{
            color: dm ? "#94A3B8" : "#64748B",
            fontSize: 15,
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          Cartaro started in a small apartment in Bangalore, where two friends
          frustrated by overpriced, low-quality imports decided to build
          something better. We wanted to create a store that felt like it was
          made for India — for the everyday buyer who wants great products
          without the premium markup.
        </p>
        <p style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 15, lineHeight: 1.8 }}>
          Today, we ship to 19,000+ pincodes across India, with a team of 25
          passionate people committed to making your shopping experience
          seamless, affordable, and delightful.
        </p>
      </div>
      <div>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: dm ? "#F1F5F9" : "#0F172A",
            marginBottom: 16,
          }}
        >
          Our Values
        </h2>
        {[
          "Transparency — No hidden charges, ever.",
          "Quality — Every product is tested before listing.",
          "Affordability — Premium shouldn't mean expensive.",
          "Speed — Fast dispatch. Faster service.",
          "Community — We grow when our customers succeed.",
        ].map((v) => (
          <div
            key={v}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span style={{ color: "#3B82F6", fontWeight: 800, marginTop: 1 }}>
              →
            </span>
            <span style={{ color: dm ? "#94A3B8" : "#475569", fontSize: 15, lineHeight: 1.5 }}>
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactPage = ({ dm }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    msg: "",
  });
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (form.name && form.email && form.msg) {
      setSent(true);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 42,
            fontWeight: 800,
            color: dm ? "#F1F5F9" : "#0F172A",
            marginBottom: 12,
          }}
        >
          Get in Touch
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 16 }}>
          We're here to help. Reach out anytime and we'll get back within hours.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "start",
        }}
      >
        <div>
          {[
            { icon: "📧", title: "Email", val: "support@cartaro.in" },
            { icon: "💬", title: "WhatsApp", val: "+91 98765 43210" },
            { icon: "🕐", title: "Support Hours", val: "Mon–Sat, 9AM–8PM IST" },
            {
              icon: "📍",
              title: "Address",
              val: "Cartaro HQ, Koramangala, Bangalore – 560095",
            },
          ].map((c) => (
            <div
              key={c.title}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: dm ? "#1E293B" : "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: dm ? "#F1F5F9" : "#0F172A",
                    marginBottom: 2,
                  }}
                >
                  {c.title}
                </div>
                <div style={{ color: dm ? "#94A3B8" : "#64748B", fontSize: 14 }}>{c.val}</div>
              </div>
            </div>
          ))}
        </div>
        {sent ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: dm ? "#1E293B" : "#F0FDF4",
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: dm ? "#F1F5F9" : "#0F172A",
                marginBottom: 8,
              }}
            >
              Message Sent!
            </h3>
            <p style={{ color: dm ? "#94A3B8" : "#64748B" }}>
              We'll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: dm ? "#0F172A" : "#FAFBFF",
              borderRadius: 20,
              padding: "32px",
              border: dm ? "1px solid #334155" : "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["name", "Your Name", "text"],
                ["email", "Email Address", "email"],
                ["subject", "Subject", "text"],
              ].map(([f, pl, type]) => (
                <input
                  key={f}
                  type={type}
                  value={form[f]}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, [f]: e.target.value }))
                  }
                  placeholder={pl}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              ))}
              <textarea
                value={form.msg}
                onChange={(e) =>
                  setForm((v) => ({ ...v, msg: e.target.value }))
                }
                placeholder="Your message..."
                rows={5}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: dm ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                  fontSize: 14,
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={submit}
                style={{
                  padding: "14px 0",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send Message →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cartaro_dark") === "true");
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
    localStorage.setItem("cartaro_dark", darkMode);
  }, [darkMode]);
  const [page, setPage] = useState(() => {
    const h = window.location.hash.replace("#", "");
    return h || "home";
  });
  const navigateTo = (newPage) => {
    window.location.hash = newPage;
    setPage(newPage);
  };
  useEffect(() => {
    const handlePop = () => {
      const h = window.location.hash.replace("#", "");
      setPage(h || "home");
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [products, setProducts] = useState(PRODUCTS);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("id"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setProducts(snap.docs.map(d => ({ ...d.data(), firebaseId: d.id })));
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const [adminClicks, setAdminClicks] = useState(0);
  const handleAdminClick = () => {
    const newCount = adminClicks + 1;
    setAdminClicks(newCount);
    if (newCount >= 3) { navigateTo("admin"); setAdminClicks(0); } else { console.log("Admin clicks:", newCount); }
  };
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cartaro-cart")) || []; }
    catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cartaro-wishlist")) || []; }
    catch { return []; }
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const discount = coupon ? coupon.pct : 0;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart((c) => {
      const idx = c.findIndex((i) => i.id === product.id);
      if (idx > -1) {
        const u = [...c];
        u[idx] = { ...u[idx], qty: u[idx].qty + 1 };
        return u;
      }
      return [...c, { ...product, qty: 1 }];
    });
    showToast(`✅ ${product.name} added to cart!`);
  };

  useEffect(() => { localStorage.setItem("cartaro-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("cartaro-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  const toggleWishlist = (id) => {
    setWishlist((w) =>
      w.includes(id) ? w.filter((x) => x !== id) : [...w, id]
    );
    showToast(
      wishlist.includes(id) ? "Removed from wishlist" : "❤️ Added to wishlist!"
    );
  };

  const viewProduct = (product) => {
    setSelectedProduct(product);
    navigateTo("product");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const navLinks = [
    { label: "Home", key: "home" },
    { label: "Shop", key: "shop" },
    { label: "Track Order", key: "tracking" },
    { label: "About", key: "about" },
    { label: "Contact", key: "contact" },
  ];

  const searchResults =
    searchQ.length > 1
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQ.toLowerCase())
        ).slice(0, 5)
      : [];

  const dm = darkMode;
  const dmBg = dm ? "#0F172A" : "#fff";
  const dmBg2 = dm ? "#1E293B" : "#fff";
  const dmBg3 = dm ? "#334155" : "#F1F5F9";
  const dmText = dm ? "#F1F5F9" : "#0F172A";
  const dmText2 = dm ? "#94A3B8" : "#64748B";
  const dmBorder = dm ? "#334155" : "#E2E8F0";
  const dmCard = dm ? "#1E293B" : "#fff";
  return (
    <div
      style={{
        background: dm ? "#0F172A" : "#FAFBFF",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: dm ? "#F1F5F9" : "#0F172A",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        body.dark-mode #root > div > main {
          background: #0F172A !important;
          filter: none;
        }
        body.dark-mode .dm-bg { background: #0F172A !important; }
        body.dark-mode .dm-card { background: #1E293B !important; border-color: #334155 !important; }
        body.dark-mode .dm-card2 { background: #334155 !important; }
        body.dark-mode .dm-text { color: #F1F5F9 !important; }
        body.dark-mode .dm-text2 { color: #94A3B8 !important; }
        body.dark-mode .dm-border { border-color: #334155 !important; }
        body.dark-mode .dm-input { background: #1E293B !important; color: #F1F5F9 !important; border-color: #334155 !important; }
        body.dark-mode #root > div > main,
        body.dark-mode #root > div > div:not(nav):not(footer) {
          background: #0F172A !important;
        }
        body.dark-mode * {
          --white: #1E293B;
          --light: #334155;
        }
        body.dark-mode div:not([style*="linear-gradient(135deg,#2563EB"]):not([style*="linear-gradient(135deg, #2563EB"]):not([style*="#0F172A"]):not([style*="rgba(0,0,0"]):not(nav) {
          background-color: unset;
        }
        button { font-family: 'DM Sans', sans-serif; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        @keyframes slideUp { from { transform: translate(-50%,40px); opacity: 0; } to { transform: translate(-50%,0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 24,
            background: "#0F172A",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 12,
            zIndex: 9999,
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <nav
        className="dark-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: dm ? "1px solid #334155" : "1px solid #F1F5F9",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            height: 64,
          }}
        >
          <div
            style={{ cursor: "pointer", flex: 1 }}
            onClick={() => navigateTo("home")}
          >
            <Logo />
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {navLinks.map((n) => (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                style={{
                  background: "none",
                  border: "none",
                  color: page === n.key ? "#2563EB" : "#475569",
                  fontWeight: page === n.key ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "4px 0",
                  borderBottom:
                    page === n.key
                      ? "2px solid #3B82F6"
                      : "2px solid transparent",
                }}
              >
                {n.label}
              </button>
            ))}
          </div>

          {/* Icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginLeft: 24,
            }}
          >
            {/* Dark mode toggle */}
            <label className="switch" style={{ marginRight: 8 }}>
              <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
              <span className="slider"></span>
            </label>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setSearchOpen((o) => !o);
                  setSearchQ("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: 8,
                  color: dm ? "#94A3B8" : "#475569",
                }}
              >
                🔍
              </button>
              {searchOpen && (
                <div
                  style={{
                    position: "fixed",
                    right: isMobile ? 8 : 16,
                    left: isMobile ? 8 : "auto",
                    top: 64,
                    width: isMobile ? "auto" : 340,
                    background: dm ? "#1E293B" : "#fff",
                    borderRadius: 14,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                    border: dm ? "1px solid #334155" : "1px solid #E2E8F0",
                    zIndex: 9999,
                    overflow: "hidden",
                    maxHeight: "70vh",
                    overflowY: "auto",
                  }}
                >
                  <div>
                  <input
                    autoFocus
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search products..."
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "none",
                      fontSize: 14,
                      outline: "none",
                      borderBottom: dm ? "1px solid #334155" : "1px solid #F1F5F9",
                      boxSizing: "border-box",
                    }}
                  />
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        viewProduct(p);
                        setSearchOpen(false);
                      }}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #F8FAFC",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      <span style={{ fontSize: 24 }}>{p.img}</span>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: dm ? "#F1F5F9" : "#0F172A",
                          }}
                        >
                          {p.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#94A3B8" }}>
                          {fmt(p.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchQ.length > 1 && searchResults.length === 0 && (
                    <div
                      style={{ padding: 16, color: "#94A3B8", fontSize: 14 }}
                    >
                      No products found
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
            {/* Wishlist */}
            <button
              onClick={() => navigateTo("wishlist")}
              style={{
                background: "none",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                padding: "8px",
                borderRadius: 8,
                color: dm ? "#94A3B8" : "#475569",
                position: "relative",
              }}
            >
              🤍
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: "fixed",
                    top: 2,
                    right: 2,
                    background: "#EF4444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>
            {/* Cart */}
            <button
              onClick={() => navigateTo("cart")}
              style={{
                position: "relative",
                background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🛒 Cart
              {cartCount > 0 && (
                <span
                  style={{
                    background: "#EF4444",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ANNOUNCEMENT BAR */}
      <div
        style={{
          background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
          color: "#fff",
          textAlign: "center",
          padding: "10px 24px",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        🚀 Free shipping on orders above ₹599 · Use <strong>WELCOME10</strong>{" "}
        for 10% off · COD available
      </div>

      {/* PAGE CONTENT */}
      <main>
        {page === "home" && (
          <HomePage
            products={products}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
            onView={viewProduct}
            dm={dm}
            setPage={navigateTo}
            dm={dm}
          />
        )}
        {page === "shop" && (
          <ShopPage
            products={products}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
            onView={viewProduct}
            dm={dm}
            dm={dm}
          />
        )}
        {page === "product" && (
          <ProductPage
            product={selectedProduct}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
            products={products}
            setPage={navigateTo}
            dm={dm}
          />
        )}
        {page === "wishlist" && (<WishlistPage
            wishlist={wishlist}
            products={products}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            setPage={navigateTo}
          />)}
        {page === "cart" && (
          <CartPage
            cart={cart}
            setCart={setCart}
            setPage={navigateTo}
            setCoupon={setCoupon}
            coupon={coupon}
            discount={discount}
            dm={dm}
          />
        )}
        {page === "checkout" && (
          <CheckoutPage
            cart={cart}
            setCart={setCart}
            setPage={navigateTo}
            discount={discount}
            dm={dm}
          />
        )}
        {page === "tracking" && <TrackingPage dm={dm} />}
        {page === "about" && <AboutPage dm={dm} />}
        {page === "contact" && <ContactPage dm={dm} />}
        {page === "admin" && <AdminPage />}
      </main>

      {/* FOOTER */}
      <footer
        ref={el => {
          if (!el) return;
          const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("footer-visible"); obs.disconnect(); } }, { threshold: 0.05 });
          obs.observe(el);
        }}
        style={{
          background: "#0F172A",
          color: "#fff",
          padding: "56px 24px 32px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span className="footer-tagline">India's Final Stop for <span style={{color:"#3B82F6"}}>Smart Shopping.</span></span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 40,
              marginBottom: 48,
            }}
          >
            <div>
              <Logo dark />
              <p
                style={{
                  color: dm ? "#94A3B8" : "#64748B",
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginTop: 14,
                  maxWidth: 280,
                }}
              >
                India's most trusted destination for trending products.
                Quality-checked, fast-delivered, and always affordable.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {["📘", "📷", "🐦", "▶️"].map((s) => (
                  <div
                    key={s}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 16,
                      transition: "all 0.25s",
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Quick Links
              </div>
              {["Home", "Shop", "About Us", "Contact", "Track Order"].map(
                (l) => (
                  <div
                    key={l}
                    style={{
                      color: dm ? "#94A3B8" : "#64748B",
                      fontSize: 14,
                      marginBottom: 10,
                      cursor: "pointer",
                    }}
                  >
                    {l}
                  </div>
                )
              )}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Categories
              </div>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <div
                  key={c}
                  style={{
                    color: dm ? "#94A3B8" : "#64748B",
                    fontSize: 14,
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Support
              </div>
              {[
                "FAQ",
                "Return Policy",
                "Privacy Policy",
                "Terms of Service",
                "Shipping Info",
              ].map((l) => (
                <div
                  key={l}
                  style={{
                    color: dm ? "#94A3B8" : "#64748B",
                    fontSize: 14,
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
          <div className="footer-divider" />
          <div
            className="footer-bottom"
            style={{
              paddingTop: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ color: dm ? "#94A3B8" : "#475569", fontSize: 13 }}>
              <span onClick={handleAdminClick} style={{ cursor: "default" }}>© 2026 Cartaro. All rights reserved. Made with ❤️ in India.</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {["💳", "📱", "🏦", "💵"].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 16,
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
