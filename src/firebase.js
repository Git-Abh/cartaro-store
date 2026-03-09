import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCTSkm9DZca4yr7-8rshEiKsHCF6f8nOo",
  authDomain: "cartaro-store.firebaseapp.com",
  projectId: "cartaro-store",
  storageBucket: "cartaro-store.firebasestorage.app",
  messagingSenderId: "40400617307",
  appId: "1:40400617307:web:b97ce061b631830829247e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
