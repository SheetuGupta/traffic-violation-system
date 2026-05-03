import { useState } from "react";
import { useReports } from "../context/ReportsContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import SpotlightCard from "../components/ui/SpotlightCard";
import StatusBadge from "../components/ui/StatusBadge";
import GlitchText from "../components/ui/GlitchText";
import UserDetailModal from "../components/admin/UserDetailModal";

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

export default function FiledViolationsPage() {
  const { reports } = useReports();
  const { c } = useTheme();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const currentEmail = normalizeEmail(user?.email);
  const myFiledReports = user
    ? reports.filter(r => {
        const sameEmail = currentEmail && normalizeEmail(r.reporterEmail) === currentEmail;
        const sameUserId = user?.id && String(r.reporterId) === String(user.id);
        return sameEmail || sameUserId;
      })
    : [];

  const filtered = myFiledReports.filter(r =>
    r.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.type?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="fade-up">
        <GlitchText text="Filed Violations" color={c.text} size={21} />
        <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
          View violations submitted from {user?.email || "this account"}.
        </div>
      </div>

      <SpotlightCard style={{ padding: 18 }}>
        <input
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            background: c.hi,
            border: `1px solid ${c.border}`,
            color: c.text,
            outline: "none",
            fontFamily: "inherit",
            width: "100%",
            maxWidth: 400,
            marginBottom: 20,
          }}
          placeholder="Search plate, type, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: c.muted }}>
              No violations submitted from this email ID
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id} style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 10,
                background: c.hi,
                border: `1px solid ${c.border}`,
              }}>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: c.accent, fontWeight: 700 }}>
                  #{r.id}
                </div>

                <div style={{ flex: "2 1 150px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{r.vehicleNumber || "N/A"}</div>
                  <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{r.type}</div>
                </div>

                <div style={{ flex: "1 1 120px", fontSize: 12, color: c.muted }}>
                  {r.location || "N/A"}
                </div>

                <div
                  style={{
                    flex: "1 1 160px",
                    fontSize: 11,
                    color: r.reporterId ? c.accent : c.dim,
                    cursor: r.reporterId ? "pointer" : "default",
                    textDecoration: r.reporterId ? "underline" : "none",
                  }}
                  onClick={() => {
                    if (r.reporterId) {
                      setSelectedUserId(r.reporterId);
                    }
                  }}
                >
                  <div>{r.reporterName || "Unknown"}</div>
                  <div style={{ marginTop: 2, color: c.dim, textDecoration: "none" }}>
                    {r.reporterEmail || "Email not saved"}
                  </div>
                </div>

                <div style={{ fontSize: 14, color: c.red, fontFamily: "monospace", fontWeight: 800 }}>
                  Rs. {(r.fine || 0).toLocaleString("en-IN")}
                </div>

                <StatusBadge status={r.status} />

                <div style={{ fontSize: 12, color: c.dim, marginLeft: "auto" }}>
                  {r.time}
                </div>
              </div>
            ))
          )}
        </div>
      </SpotlightCard>

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
