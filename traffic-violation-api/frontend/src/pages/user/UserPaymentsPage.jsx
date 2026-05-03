import { useState, useEffect } from "react";
import { useTheme }            from "../../context/ThemeContext";
import { useAuth }             from "../../context/AuthContext";
import SpotlightCard           from "../../components/ui/SpotlightCard";
import GlitchText              from "../../components/ui/GlitchText";
import api                     from "../../axiosConfig";

// ✅ Load Razorpay script
const loadRazorpay = () => new Promise(resolve => {
  if (window.Razorpay) { resolve(true); return; }
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload  = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const RAZORPAY_KEY = "rzp_test_YOUR_KEY_HERE"; // ✅ razorpay.com se test key lo

export default function UserPaymentsPage({ prefill }) {
  // prefill — jab Pay Now click karke aaye toh vehicle details auto fill
  const { c }    = useTheme();
  const { user } = useAuth();

  const [violations, setViolations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("due");
  const [paying,     setPaying]     = useState(null);
  const [paidIds,    setPaidIds]    = useState([]);

  // ✅ Direct payment form — agar seedha page pe aaye
  const [directForm, setDirectForm] = useState({
    vehicleNumber: prefill?.vehicleNumber || "",
    chalanNumber:  prefill?.chalanNumber  || "",
    amount:        prefill?.amount        || "",
    name:          user?.name             || "",
    email:         user?.email            || "",
    phone:         user?.phoneNumber      || "",
  });
  const setDF = (key) => (e) => setDirectForm(f => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/violations/user/${user.id}`)
      .then(res => {
        setViolations(res.data
          .filter(v => v.status === "APPROVED" || v.status === "FINE_ISSUED")
          .map(v => ({
            id:            v.id,
            vehicleNumber: v.vehicleNumber || "N/A",
            type:          v.violationType,
            fine:          v.fineAmount || 0,
            status:        v.status,
            date:          v.violationDate
              ? new Date(v.violationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "N/A",
          })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const due  = violations.filter(v => v.status === "APPROVED");
  const paid = violations.filter(v => v.status === "FINE_ISSUED" || v.status === "FINE ISSUED");

  const totalDue  = due.reduce((s, v)  => s + v.fine, 0);
  const totalPaid = paid.reduce((s, v) => s + v.fine, 0);

  // ✅ Razorpay payment handler
  const handleRazorpay = async ({ amount, name, email, phone, violationId, description }) => {
    const loaded = await loadRazorpay();
    if (!loaded) { alert("Payment gateway failed to load. Check internet connection."); return; }

    const options = {
      key:         RAZORPAY_KEY,
      amount:      amount * 100,  // paise mein
      currency:    "INR",
      name:        "TrafficWatch",
      description: description || "Traffic Violation Fine",
      image:       "https://i.imgur.com/n5tjHFD.png",
      prefill: {
        name:    name  || user?.name,
        email:   email || user?.email,
        contact: phone || user?.phoneNumber,
      },
      theme: { color: "#00d4ff" },
      handler: async (response) => {
        // Payment successful
        console.log("Payment ID:", response.razorpay_payment_id);
        if (violationId) {
          setPaidIds(prev => [...prev, violationId]);
          // Backend mein status update karo
          try {
            await api.patch(`/violations/${violationId}/status`, { status: "FINE_ISSUED" });
          } catch (e) {
            console.error("Status update failed:", e);
          }
        }
        alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
      },
      modal: {
        ondismiss: () => setPaying(null),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePayViolation = async (v) => {
    setPaying(v.id);
    await handleRazorpay({
      amount:      v.fine,
      description: `Fine for ${v.type} — ${v.vehicleNumber}`,
      violationId: v.id,
    });
    setPaying(null);
  };

  const handleDirectPay = async () => {
    if (!directForm.amount || !directForm.vehicleNumber) {
      alert("Please fill vehicle number and amount."); return;
    }
    await handleRazorpay({
      amount:      parseFloat(directForm.amount),
      name:        directForm.name,
      email:       directForm.email,
      phone:       directForm.phone,
      description: `Traffic fine — Vehicle: ${directForm.vehicleNumber}${directForm.chalanNumber ? ` · Chalan: ${directForm.chalanNumber}` : ""}`,
    });
  };

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 13,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  const tabBtn = (id, label, count, color) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: "9px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13,
      border: `1px solid ${activeTab === id ? color : c.border}`,
      background: activeTab === id ? color + "18" : "transparent",
      color: activeTab === id ? color : c.muted,
      fontWeight: activeTab === id ? 700 : 400,
      fontFamily: "inherit", transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {label}
      <span style={{
        padding: "2px 8px", borderRadius: 10, fontSize: 11,
        background: activeTab === id ? color : c.hi,
        color: activeTab === id ? "#fff" : c.muted,
        border: `1px solid ${activeTab === id ? "transparent" : c.border}`,
      }}>{count}</span>
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div className="fade-up">
        <GlitchText text="Payments" color={c.text} size={21} />
        <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
          Pay your traffic fines securely
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ fontSize: 10, color: c.muted, letterSpacing: "0.08em", marginBottom: 10 }}>AMOUNT DUE</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: c.red, fontFamily: "monospace" }}>
            ₹{totalDue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: 6 }}>
            {due.length} pending payment{due.length !== 1 ? "s" : ""}
          </div>
          <div style={{ marginTop: 12, height: 3, borderRadius: 4, background: `linear-gradient(90deg, ${c.red}, ${c.yellow})` }} />
        </SpotlightCard>

        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ fontSize: 10, color: c.muted, letterSpacing: "0.08em", marginBottom: 10 }}>AMOUNT PAID</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: c.green, fontFamily: "monospace" }}>
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: 6 }}>
            {paid.length} completed
          </div>
          <div style={{ marginTop: 12, height: 3, borderRadius: 4, background: `linear-gradient(90deg, ${c.green}, ${c.accent})` }} />
        </SpotlightCard>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {tabBtn("due",    "Amount Due",     due.length,  c.red)}
        {tabBtn("paid",   "Paid History",   paid.length, c.green)}
        {tabBtn("direct", "Pay by Details", 0,           c.accent)}
      </div>

      {/* ══ DUE / PAID LIST ══ */}
      {activeTab !== "direct" && (
        loading ? (
          <div style={{ textAlign: "center", padding: 40, color: c.muted, fontSize: 13 }}>Loading...</div>
        ) : (activeTab === "due" ? due : paid).length === 0 ? (
          <SpotlightCard style={{ padding: 44, textAlign: "center" }}>
            <div style={{ color: c.muted, fontSize: 13 }}>
              {activeTab === "due" ? "No pending payments. All clear." : "No payment history yet."}
            </div>
          </SpotlightCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(activeTab === "due" ? due : paid).map(v => {
              const isPaying = paying === v.id;
              const isPaid   = paidIds.includes(v.id);
              return (
                <SpotlightCard key={v.id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 14, color: c.accent }}>
                          {v.vehicleNumber}
                        </span>
                        <span style={{ fontSize: 11, color: c.muted }}>#{v.id}</span>
                      </div>
                      <div style={{ fontSize: 12, color: c.muted }}>{v.type} · {v.date}</div>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: activeTab === "due" ? c.red : c.green }}>
                      ₹{v.fine.toLocaleString("en-IN")}
                    </div>

                    {activeTab === "due" && (
                      isPaid ? (
                        <div style={{
                          padding: "9px 18px", borderRadius: 10,
                          background: c.greenDim, color: c.green,
                          fontSize: 12, fontWeight: 700, border: `1px solid ${c.green}44`,
                        }}>
                          Payment Successful
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePayViolation(v)}
                          disabled={isPaying}
                          style={{
                            padding: "10px 24px", borderRadius: 10,
                            cursor: isPaying ? "wait" : "pointer",
                            background: isPaying ? c.hi : `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
                            color: isPaying ? c.muted : "#fff",
                            border: isPaying ? `1px solid ${c.border}` : "none",
                            fontWeight: 700, fontSize: 13, fontFamily: "inherit",
                            boxShadow: isPaying ? "none" : `0 4px 14px ${c.accentGlow}`,
                            minWidth: 110, transition: "all 0.3s",
                          }}>
                          {isPaying ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                              <span style={{
                                width: 12, height: 12, borderRadius: "50%",
                                border: `2px solid ${c.muted}`, borderTopColor: c.accent,
                                display: "inline-block", animation: "spin 0.8s linear infinite",
                              }} />
                              Processing
                            </span>
                          ) : "Pay Now"}
                        </button>
                      )
                    )}

                    {activeTab === "paid" && (
                      <div style={{
                        padding: "8px 16px", borderRadius: 10,
                        background: c.greenDim, color: c.green,
                        fontSize: 12, fontWeight: 700, border: `1px solid ${c.green}33`,
                      }}>Paid</div>
                    )}
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )
      )}

      {/* ══ DIRECT PAYMENT FORM ══ */}
      {activeTab === "direct" && (
        <SpotlightCard style={{ padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 6 }}>
            Pay Fine Directly
          </div>
          <div style={{ fontSize: 12, color: c.muted, marginBottom: 20 }}>
            Enter your vehicle and chalan details to pay
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  VEHICLE NUMBER *
                </label>
                <input
                  style={{ ...inp, textTransform: "uppercase" }}
                  placeholder="DL01AB1234"
                  value={directForm.vehicleNumber}
                  onChange={setDF("vehicleNumber")}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  CHALAN NUMBER
                </label>
                <input
                  style={inp}
                  placeholder="e.g. CH2024001234"
                  value={directForm.chalanNumber}
                  onChange={setDF("chalanNumber")}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  FINE AMOUNT (₹) *
                </label>
                <input
                  type="number"
                  style={inp}
                  placeholder="e.g. 500"
                  value={directForm.amount}
                  onChange={setDF("amount")}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  FULL NAME
                </label>
                <input
                  style={inp}
                  placeholder="Rahul Sharma"
                  value={directForm.name}
                  onChange={setDF("name")}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  style={inp}
                  placeholder="rahul@gmail.com"
                  value={directForm.email}
                  onChange={setDF("email")}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  PHONE
                </label>
                <input
                  type="tel"
                  style={inp}
                  placeholder="9876543210"
                  value={directForm.phone}
                  onChange={setDF("phone")}
                />
              </div>
            </div>

            {/* Razorpay badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              background: c.bg, border: `1px solid ${c.border}`,
              fontSize: 12, color: c.muted,
            }}>
              <div style={{
                padding: "4px 10px", borderRadius: 6,
                background: "#528FF0", color: "#fff",
                fontSize: 11, fontWeight: 800,
              }}>Razorpay</div>
              Secured payment · UPI · Cards · Net Banking · Wallets
            </div>

            <button
              onClick={handleDirectPay}
              style={{
                padding: "13px", borderRadius: 12, cursor: "pointer",
                background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
                color: "#fff", border: "none", fontWeight: 800,
                fontSize: 14, fontFamily: "inherit",
                boxShadow: `0 4px 20px ${c.accentGlow}`,
              }}>
              Pay ₹{directForm.amount ? parseFloat(directForm.amount).toLocaleString("en-IN") : "0"} Now
            </button>
          </div>
        </SpotlightCard>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}