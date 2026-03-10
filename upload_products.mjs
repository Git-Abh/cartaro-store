import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCTSkm9DZca4yr7-8rshEiKsHCF6f8nOo",
  authDomain: "cartaro-store.firebaseapp.com",
  projectId: "cartaro-store",
  storageBucket: "cartaro-store.firebasestorage.app",
  messagingSenderId: "40400617307",
  appId: "1:40400617307:web:b97ce061b631830829247e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [{"id": 1, "name": "AirFlow Pro Neck Fan", "category": "Gadgets", "price": 1299, "mrp": 2499, "rating": 4.7, "reviews": 312, "badge": "Trending", "img": "🌀", "desc": "360° hands-free personal cooling fan with 3 speeds. USB-C rechargeable, ultra-quiet motor. Perfect for Indian summers.", "tags": ["portable", "summer", "cooling"], "stock": 48}, {"id": 2, "name": "MagLift Electric Screwdriver", "category": "Home Tools", "price": 1899, "mrp": 3499, "rating": 4.8, "reviews": 214, "badge": "Best Seller", "img": "🔧", "desc": "Cordless electric screwdriver with 30 bits, magnetic tip, LED light, and auto-stop clutch. 2000mAh battery.", "tags": ["diy", "tools", "electric"], "stock": 23}, {"id": 3, "name": "SmartFit Pro Band", "category": "Fitness", "price": 2199, "mrp": 4999, "rating": 4.6, "reviews": 891, "badge": "Hot", "img": "⌚", "desc": "IP68 waterproof fitness tracker with SpO2, heart rate, 14-day battery life, and WhatsApp notifications.", "tags": ["fitness", "health", "wearable"], "stock": 67}, {"id": 4, "name": "AutoGrip Dashboard Mount", "category": "Car Accessories", "price": 699, "mrp": 1499, "rating": 4.9, "reviews": 1204, "badge": "Top Rated", "img": "📱", "desc": "One-touch auto-clamping phone mount with 360° rotation. Strong suction, fits all dashboards.", "tags": ["car", "mount", "phone"], "stock": 156}, {"id": 5, "name": "LumiDesk LED Lamp", "category": "Smart Devices", "price": 1599, "mrp": 2999, "rating": 4.5, "reviews": 432, "badge": "New", "img": "💡", "desc": "Touch-sensitive LED desk lamp with USB charging port, 3 color modes, and adjustable brightness. Eye-care certified.", "tags": ["desk", "led", "study"], "stock": 34}, {"id": 6, "name": "TurboBlend Mini", "category": "Home Tools", "price": 1099, "mrp": 1999, "rating": 4.7, "reviews": 567, "badge": "Trending", "img": "🥤", "desc": "Portable USB blender with 6 stainless blades. Blend smoothies, protein shakes on the go. BPA-free, 380ml.", "tags": ["kitchen", "blender", "portable"], "stock": 89}, {"id": 7, "name": "PulseX Jump Rope", "category": "Fitness", "price": 499, "mrp": 999, "rating": 4.8, "reviews": 2341, "badge": "Best Seller", "img": "🪢", "desc": "Anti-tangle speed jump rope with ball bearings, foam handles, and adjustable cable. Great for HIIT training.", "tags": ["cardio", "hiit", "rope"], "stock": 211}, {"id": 8, "name": "ClearView Dash Cam", "category": "Car Accessories", "price": 3499, "mrp": 6999, "rating": 4.6, "reviews": 378, "badge": "Hot", "img": "📹", "desc": "4K dual dash cam with night vision, 170° wide angle, loop recording, and G-sensor. 32GB card included.", "tags": ["car", "camera", "safety"], "stock": 18}, {"id": 9, "name": "NanoBoost Power Bank", "category": "Gadgets", "price": 1799, "mrp": 3299, "rating": 4.8, "reviews": 945, "badge": "Trending", "img": "🔋", "desc": "20000mAh slim power bank with 22.5W fast charge, dual USB-A + USB-C ports. Airline approved.", "tags": ["power", "charging", "travel"], "stock": 72}, {"id": 10, "name": "FlexGrip Resistance Bands", "category": "Fitness", "price": 799, "mrp": 1499, "rating": 4.7, "reviews": 1532, "badge": "Best Seller", "img": "🏋️", "desc": "Set of 5 latex resistance bands (10-50 lbs). Anti-snap, odorless, includes carry bag and workout guide.", "tags": ["gym", "resistance", "home"], "stock": 143}, {"id": 11, "name": "AirPure Mini Purifier", "category": "Smart Devices", "price": 2499, "mrp": 4999, "rating": 4.5, "reviews": 287, "badge": "New", "img": "🌿", "desc": "Desktop HEPA air purifier removes 99.97% pollutants. Ultra-quiet 25dB, 3-stage filtration, USB powered.", "tags": ["air", "health", "office"], "stock": 29}, {"id": 12, "name": "MagSafe Wireless Charger", "category": "Gadgets", "price": 899, "mrp": 1799, "rating": 4.6, "reviews": 1678, "badge": "Hot", "img": "⚡", "desc": "15W Qi2 wireless charging pad compatible with iPhone and Android. LED indicator, anti-slip base, 1m cable.", "tags": ["wireless", "charging", "fast"], "stock": 94}];

async function upload() {
  for (const p of products) {
    await addDoc(collection(db, 'products'), p);
    console.log('Uploaded:', p.name);
  }
  console.log('All done!');
  process.exit(0);
}

upload().catch(console.error);
