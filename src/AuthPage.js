import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const AuthPage = ({ onClose, dm }) => {
  const [toggled, setToggled] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") setError("Google sign-in failed. Try again.");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      onClose();
    } catch (e) {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      onClose();
    } catch (e) {
      setError(e.message.includes("email-already") ? "Email already in use." : "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'Poppins', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .auth-wrapper { position: relative; width: 100%; max-width: 800px; height: 500px; border: 2px solid #00d4ff; box-shadow: 0 0 25px #00d4ff; overflow: hidden; }
        .auth-wrapper .credentials-panel { position: absolute; top: 0; width: 50%; height: 100%; display: flex; justify-content: center; flex-direction: column; }
        .credentials-panel.signin { left: 0; padding: 0 40px; }
        .credentials-panel.signin .slide-element { transform: translateX(0%); transition: .7s; opacity: 1; }
        .credentials-panel.signin .slide-element:nth-child(1) { transition-delay: 2.1s; }
        .credentials-panel.signin .slide-element:nth-child(2) { transition-delay: 2.2s; }
        .credentials-panel.signin .slide-element:nth-child(3) { transition-delay: 2.3s; }
        .credentials-panel.signin .slide-element:nth-child(4) { transition-delay: 2.4s; }
        .credentials-panel.signin .slide-element:nth-child(5) { transition-delay: 2.5s; }
        .auth-wrapper.toggled .credentials-panel.signin .slide-element { transform: translateX(-120%); opacity: 0; }
        .auth-wrapper.toggled .credentials-panel.signin .slide-element:nth-child(1) { transition-delay: 0s; }
        .auth-wrapper.toggled .credentials-panel.signin .slide-element:nth-child(2) { transition-delay: 0.1s; }
        .auth-wrapper.toggled .credentials-panel.signin .slide-element:nth-child(3) { transition-delay: 0.2s; }
        .auth-wrapper.toggled .credentials-panel.signin .slide-element:nth-child(4) { transition-delay: 0.3s; }
        .auth-wrapper.toggled .credentials-panel.signin .slide-element:nth-child(5) { transition-delay: 0.4s; }
        .credentials-panel.signup { right: 0; padding: 0 40px; }
        .credentials-panel.signup .slide-element { transform: translateX(120%); transition: .7s ease; opacity: 0; filter: blur(10px); }
        .credentials-panel.signup .slide-element:nth-child(1) { transition-delay: 0s; }
        .credentials-panel.signup .slide-element:nth-child(2) { transition-delay: 0.1s; }
        .credentials-panel.signup .slide-element:nth-child(3) { transition-delay: 0.2s; }
        .credentials-panel.signup .slide-element:nth-child(4) { transition-delay: 0.3s; }
        .credentials-panel.signup .slide-element:nth-child(5) { transition-delay: 0.4s; }
        .credentials-panel.signup .slide-element:nth-child(6) { transition-delay: 0.5s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element { transform: translateX(0%); opacity: 1; filter: blur(0px); }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(1) { transition-delay: 1.7s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(2) { transition-delay: 1.8s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(3) { transition-delay: 1.9s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(4) { transition-delay: 1.9s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(5) { transition-delay: 2.0s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(6) { transition-delay: 2.1s; }
        .credentials-panel h2 { font-size: 28px; text-align: center; color: #fff; margin-bottom: 8px; }
        .auth-field { position: relative; width: 100%; height: 50px; margin-top: 20px; }
        .auth-field input { width: 100%; height: 100%; background: transparent; border: none; outline: none; font-size: 15px; color: #fff; font-weight: 600; border-bottom: 2px solid #fff; padding-right: 23px; transition: .5s; font-family: 'Poppins', sans-serif; }
        .auth-field input:focus, .auth-field input:valid { border-bottom: 2px solid #00d4ff; }
        .auth-field label { position: absolute; top: 50%; left: 0; transform: translateY(-50%); font-size: 15px; color: #fff; transition: .5s; pointer-events: none; }
        .auth-field input:focus~label, .auth-field input:valid~label { top: -5px; color: #00d4ff; font-size: 12px; }
        .auth-submit { position: relative; width: 100%; height: 42px; background: transparent; border-radius: 40px; cursor: pointer; font-size: 15px; font-weight: 600; border: 2px solid #00d4ff; overflow: hidden; z-index: 1; color: #fff; font-family: 'Poppins', sans-serif; transition: .3s; }
        .auth-submit::before { content: ""; position: absolute; height: 300%; width: 100%; background: linear-gradient(#1a1a2e, #00d4ff, #1a1a2e, #00d4ff); top: -100%; left: 0; z-index: -1; transition: .5s; }
        .auth-submit:hover::before { top: 0; }
        .google-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 42px; background: #fff; border: none; border-radius: 40px; cursor: pointer; font-size: 14px; font-weight: 600; color: #1a1a2e; font-family: 'Poppins', sans-serif; transition: .3s; margin-top: 12px; }
        .google-btn:hover { background: #f0f0f0; transform: translateY(-1px); }
        .switch-link { font-size: 13px; text-align: center; margin-top: 16px; color: #fff; }
        .switch-link a { text-decoration: none; color: #00d4ff; font-weight: 600; cursor: pointer; }
        .welcome-section { position: absolute; top: 0; height: 100%; width: 50%; display: flex; justify-content: center; flex-direction: column; }
        .welcome-section.signin { right: 0; text-align: right; padding: 0 40px 60px 150px; }
        .welcome-section.signin .slide-element { transform: translateX(0); transition: .7s ease; opacity: 1; filter: blur(0px); }
        .welcome-section.signin .slide-element:nth-child(1) { transition-delay: 2.0s; }
        .auth-wrapper.toggled .welcome-section.signin .slide-element { transform: translateX(120%); opacity: 0; filter: blur(10px); }
        .auth-wrapper.toggled .welcome-section.signin .slide-element:nth-child(1) { transition-delay: 0s; }
        .welcome-section.signup { left: 0; text-align: left; padding: 0 150px 60px 38px; pointer-events: none; }
        .welcome-section.signup .slide-element { transform: translateX(-120%); transition: .7s ease; opacity: 0; filter: blur(10px); }
        .welcome-section.signup .slide-element:nth-child(1) { transition-delay: 0s; }
        .auth-wrapper.toggled .welcome-section.signup .slide-element { transform: translateX(0%); opacity: 1; filter: blur(0); }
        .auth-wrapper.toggled .welcome-section.signup .slide-element:nth-child(1) { transition-delay: 1.7s; }
        .welcome-section h2 { text-transform: uppercase; font-size: 32px; line-height: 1.3; color: #fff; }
        .auth-bg-shape { position: absolute; right: 0; top: -5px; height: 600px; width: 850px; background: linear-gradient(45deg, #1a1a2e, #00d4ff); transform: rotate(10deg) skewY(40deg); transform-origin: bottom right; transition: 1.5s ease; transition-delay: 1.6s; }
        .auth-wrapper.toggled .auth-bg-shape { transform: rotate(0deg) skewY(0deg); transition-delay: .5s; }
        .auth-secondary-shape { position: absolute; left: 250px; top: 100%; height: 700px; width: 850px; background: #1a1a2e; border-top: 3px solid #00d4ff; transform: rotate(0deg) skewY(0deg); transform-origin: bottom left; transition: 1.5s ease; transition-delay: .5s; }
        .auth-wrapper.toggled .auth-secondary-shape { transform: rotate(-11deg) skewY(-41deg); transition-delay: 1.2s; }
        .auth-error { color: #ff6b6b; font-size: 12px; text-align: center; margin-top: 8px; }
        @media (max-width: 640px) {
          .auth-wrapper { height: auto; min-height: 480px; }
          .auth-wrapper .credentials-panel { width: 100%; position: relative; }
          .credentials-panel.signin { display: flex; padding: 40px 30px; }
          .credentials-panel.signup { display: none; padding: 40px 30px; right: 0; }
          .auth-wrapper.toggled .credentials-panel.signin { display: none; }
          .auth-wrapper.toggled .credentials-panel.signup { display: flex; }
          .credentials-panel.signin .slide-element, .credentials-panel.signup .slide-element { transform: none !important; opacity: 1 !important; filter: none !important; transition: none !important; }
          .welcome-section { display: none; }
          .auth-bg-shape, .auth-secondary-shape { display: none; }
        }
      `}</style>

      {/* Close button */}
      <button onClick={onClose} style={{
        position: "fixed", top: 20, right: 24, zIndex: 10000,
        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "50%", width: 40, height: 40, cursor: "pointer",
        color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
      }}>✕</button>

      <div className={`auth-wrapper${toggled ? " toggled" : ""}`} style={{ background: "#1a1a2e" }}>
        <div className="auth-bg-shape" />
        <div className="auth-secondary-shape" />

        {/* LOGIN PANEL */}
        <div className="credentials-panel signin">
          <h2 className="slide-element">Login</h2>
          {error && !toggled && <p className="auth-error">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="auth-field slide-element">
              <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              <label>Email</label>
            </div>
            <div className="auth-field slide-element">
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              <label>Password</label>
            </div>
            <div className="auth-field slide-element">
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "..." : "Login"}
              </button>
            </div>
            <div className="slide-element">
              <button type="button" className="google-btn" onClick={handleGoogle} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
            </div>
            <div className="switch-link slide-element">
              <p>Don't have an account? <a onClick={() => { setToggled(true); setError(""); }}>Sign Up</a></p>
            </div>
          </form>
        </div>

        {/* WELCOME SIGNIN */}
        <div className="welcome-section signin">
          <h2 className="slide-element">WELCOME BACK!</h2>
        </div>

        {/* REGISTER PANEL */}
        <div className="credentials-panel signup">
          <h2 className="slide-element">Register</h2>
          {error && toggled && <p className="auth-error">{error}</p>}
          <form onSubmit={handleRegister}>
            <div className="auth-field slide-element">
              <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} />
              <label>Username</label>
            </div>
            <div className="auth-field slide-element">
              <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              <label>Email</label>
            </div>
            <div className="auth-field slide-element">
              <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} />
              <label>Password</label>
            </div>
            <div className="auth-field slide-element">
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "..." : "Register"}
              </button>
            </div>
            <div className="slide-element">
              <button type="button" className="google-btn" onClick={handleGoogle} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
            </div>
            <div className="switch-link slide-element">
              <p>Already have an account? <a onClick={() => { setToggled(false); setError(""); }}>Sign In</a></p>
            </div>
          </form>
        </div>

        {/* WELCOME SIGNUP */}
        <div className="welcome-section signup">
          <h2 className="slide-element">WELCOME!</h2>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
