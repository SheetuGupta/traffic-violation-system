import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import AuroraBG from "../ui/AuroraBG";
import NoiseOverlay from "../ui/NoiseOverlay";
import ParticleGrid from "../ui/ParticleGrid";
import SpotlightCard from "../ui/SpotlightCard";
import MagneticButton from "../ui/MagneticButton";
import GlitchText from "../ui/GlitchText";
import Chip from "../ui/Chip";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const { c, dark, toggle } = useTheme();
  const { login, register, continueWithGoogle, authError } = useAuth();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [notice, setNotice] = useState(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaErr, setCaptchaErr] = useState(false);

  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPass: "",
  });

  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const roleRef = useRef(role);
  const googleAuthRef = useRef(continueWithGoogle);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    googleAuthRef.current = continueWithGoogle;
  }, [continueWithGoogle]);

  useEffect(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaErr(false);
    setErr(null);
  }, [mode]);

  useEffect(() => {
    if (authError) setErr(authError);
  }, [authError]);

  useEffect(() => {
    if (!googleClientId) return;

    let cancelled = false;
    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            setErr("Gmail registration failed.");
            return;
          }

          setLoading(true);
          setErr(null);
          setNotice(null);

          const ok = await googleAuthRef.current(response.credential, roleRef.current);
          if (!ok) setErr("Gmail registration failed.");
          setLoading(false);
        },
      });

      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const existingScript = document.querySelector("script[src='https://accounts.google.com/gsi/client']");
      if (existingScript) {
        existingScript.addEventListener("load", initializeGoogle, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!googleReady || !googleButtonRef.current || !window.google?.accounts?.id) return;

    googleButtonRef.current.innerHTML = "";
    const buttonWidth = Math.max(
      220,
      Math.min(360, Math.floor(googleButtonRef.current.getBoundingClientRect().width || 360))
    );

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: dark ? "filled_black" : "outline",
      size: "large",
      text: mode === "register" ? "signup_with" : "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: buttonWidth,
    });
  }, [dark, googleReady, mode]);

  const setReg = (key) => (e) => setRegForm(form => ({ ...form, [key]: e.target.value }));
  const selectedRole = role === "admin" ? "ADMIN" : "USER";

  const resetCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaErr(false);
  };

  const validateCaptcha = () => {
    if (captchaInput === captcha.answer) return true;
    setCaptchaErr(true);
    resetCaptcha();
    setErr("Incorrect captcha. Please try again.");
    return false;
  };

  const handleLogin = async () => {
    if (!email || !pass) {
      setErr("Please enter email and password.");
      return;
    }
    if (!validateCaptcha()) return;

    setLoading(true);
    setErr(null);
    setNotice(null);

    const ok = await login(email, pass, role);
    if (!ok) setErr("Login failed. Check credentials.");
    setLoading(false);
  };

  const handleRegister = async () => {
    const name = regForm.name.trim();
    const regEmail = regForm.email.trim();
    const { password, confirmPass } = regForm;

    if (!name || !regEmail || !password || !confirmPass) {
      setErr("Please fill username, email, password, and confirm password.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(regEmail)) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPass) {
      setErr("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (!validateCaptcha()) return;

    setLoading(true);
    setErr(null);
    setNotice(null);

    const res = await register({
      name,
      email: regEmail,
      password,
      role: selectedRole,
    });

    if (res?.success) {
      setMode("login");
      setEmail(regEmail);
      setPass("");
      setNotice(`${selectedRole === "ADMIN" ? "Admin" : "User"} account created. Please log in.`);
      resetCaptcha();
    } else {
      setErr("Registration failed.");
    }
    setLoading(false);
  };

  const handleMissingGoogle = () => {
    setErr("Gmail sign-up needs REACT_APP_GOOGLE_CLIENT_ID in the frontend environment.");
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 8,
    fontSize: 13,
    background: c.hi,
    border: `1px solid ${c.border}`,
    color: c.text,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const buttonStyle = (active) => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: `1px solid ${active ? c.accent : c.border}`,
    background: active ? c.accentDim : "transparent",
    color: active ? c.accent : c.muted,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
    fontWeight: 700,
    transition: "all 0.2s",
  });

  const label = (text) => (
    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
      {text}
    </label>
  );

  const renderCaptcha = () => (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "center",
      padding: "12px 14px",
      borderRadius: 8,
      background: c.bg,
      border: `1px solid ${captchaErr ? `${c.red}88` : c.border}`,
      flexWrap: "wrap",
    }}>
      <div style={{
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 15,
        fontFamily: "monospace",
        fontWeight: 800,
        letterSpacing: 4,
        background: c.hi,
        color: c.accent,
        userSelect: "none",
        border: `1px solid ${c.accent}33`,
        flexShrink: 0,
      }}>
        {captcha.question}
      </div>
      <input
        type="text"
        placeholder="Answer"
        maxLength={2}
        value={captchaInput}
        onChange={e => {
          setCaptchaInput(e.target.value);
          setCaptchaErr(false);
        }}
        style={{ ...inputStyle, flex: "1 1 110px" }}
      />
      <button
        onClick={resetCaptcha}
        title="Refresh captcha"
        aria-label="Refresh captcha"
        style={{
          width: 42,
          height: 42,
          borderRadius: 8,
          cursor: "pointer",
          border: `1px solid ${c.border}`,
          background: "transparent",
          color: c.muted,
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        R
      </button>
    </div>
  );

  const renderGoogleAction = () => (
    <div style={{ display: "flex", justifyContent: "center", minHeight: 42 }}>
      {googleClientId ? (
        <div ref={googleButtonRef} style={{ width: "100%", display: "flex", justifyContent: "center" }} />
      ) : (
        <button
          type="button"
          onClick={handleMissingGoogle}
          style={{
            ...inputStyle,
            cursor: "pointer",
            background: c.surface,
            color: c.text,
            fontWeight: 800,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
          </span>
          Continue with Google
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: c.bg, position: "relative", fontFamily: "inherit" }}>
      <AuroraBG />
      <NoiseOverlay />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <ParticleGrid />
      </div>

      <div style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "30px 20px",
      }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: `linear-gradient(135deg,${c.accent},${c.purple})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 900,
            color: "#fff",
            margin: "0 auto 12px",
            boxShadow: `0 8px 32px ${c.accentGlow}`,
          }}>
            TW
          </div>
          <GlitchText text="TrafficWatch" color={c.text} size={24} />
          <div style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
            Smart Violation Enforcement Platform
          </div>
        </div>

        <div className="fade-up" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" }}>
          {["user", "admin"].map(item => (
            <button key={item} onClick={() => setRole(item)} style={buttonStyle(role === item)}>
              {item === "admin" ? "Admin" : "User"}
            </button>
          ))}
          <button onClick={toggle} style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${c.border}`,
            background: "transparent",
            color: c.muted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
        </div>

        <div className="fade-up" style={{ width: "100%", maxWidth: mode === "register" ? 520 : 420 }}>
          <SpotlightCard style={{ padding: 30 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: c.text }}>
                {mode === "login"
                  ? role === "admin" ? "Admin Login" : "User Login"
                  : role === "admin" ? "Create Admin Account" : "Create User Account"}
              </div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 3 }}>
                {mode === "login"
                  ? "Use email and password or Gmail"
                  : "Register with username, email, password, or Gmail"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {mode === "login" && (
                <>
                  <div>
                    {label("EMAIL ADDRESS")}
                    <input
                      type="email"
                      value={email}
                      placeholder="you@gmail.com"
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    {label("PASSWORD")}
                    <input
                      type="password"
                      value={pass}
                      placeholder="Minimum 6 characters"
                      onChange={e => setPass(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      style={inputStyle}
                    />
                  </div>

                  {renderCaptcha()}

                  <MagneticButton onClick={handleLogin} accent={c.accent} glow={c.accentGlow}
                    style={{ width: "100%", marginTop: 2 }} disabled={loading}>
                    {loading ? "Logging in..." : role === "admin" ? "Login as Admin" : "Login as User"}
                  </MagneticButton>
                </>
              )}

              {mode === "register" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
                    <div>
                      {label("USERNAME *")}
                      <input
                        type="text"
                        placeholder="Rahul Sharma"
                        value={regForm.name}
                        onChange={setReg("name")}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      {label("EMAIL ADDRESS *")}
                      <input
                        type="email"
                        placeholder="rahul@gmail.com"
                        value={regForm.email}
                        onChange={setReg("email")}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      {label("PASSWORD *")}
                      <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={regForm.password}
                        onChange={setReg("password")}
                        onKeyDown={e => e.key === "Enter" && handleRegister()}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      {label("CONFIRM PASSWORD *")}
                      <input
                        type="password"
                        placeholder="Repeat password"
                        value={regForm.confirmPass}
                        onChange={setReg("confirmPass")}
                        onKeyDown={e => e.key === "Enter" && handleRegister()}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {renderCaptcha()}

                  <MagneticButton onClick={handleRegister} accent={c.accent} glow={c.accentGlow}
                    style={{ width: "100%", marginTop: 2 }} disabled={loading}>
                    {loading ? "Creating account..." : `Create ${selectedRole === "ADMIN" ? "Admin" : "User"} Account`}
                  </MagneticButton>
                </>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", color: c.dim, fontSize: 10 }}>
                <span style={{ height: 1, background: c.border }} />
                <span>OR</span>
                <span style={{ height: 1, background: c.border }} />
              </div>

              {renderGoogleAction()}

              {err && (
                <div style={{
                  padding: "9px 13px",
                  background: c.redDim,
                  borderRadius: 8,
                  color: c.red,
                  fontSize: 12,
                  border: `1px solid ${c.red}33`,
                }}>
                  {err}
                </div>
              )}

              {notice && (
                <div style={{
                  padding: "9px 13px",
                  background: c.greenDim,
                  borderRadius: 8,
                  color: c.green,
                  fontSize: 12,
                  border: `1px solid ${c.green}33`,
                }}>
                  {notice}
                </div>
              )}

              <div style={{ textAlign: "center", fontSize: 11, color: c.dim }}>
                {mode === "login" ? (
                  <>
                    No account?{" "}
                    <span onClick={() => setMode("register")}
                      style={{ color: c.accent, cursor: "pointer", fontWeight: 700 }}>
                      Register
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span onClick={() => setMode("login")}
                      style={{ color: c.accent, cursor: "pointer", fontWeight: 700 }}>
                      Login
                    </span>
                  </>
                )}
              </div>
            </div>
          </SpotlightCard>
        </div>

        <div className="fade-up" style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {["Secured", "OCR Detection", "GPS Tagging", "AI Classify"].map(t => (
            <Chip key={t} label={t} color={c.muted}
              bg={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
          ))}
        </div>
      </div>
    </div>
  );
}
