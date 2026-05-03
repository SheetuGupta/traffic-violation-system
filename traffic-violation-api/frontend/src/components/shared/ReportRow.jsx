import { useTheme }  from "../../context/ThemeContext";
import StatusBadge   from "../ui/StatusBadge";

export default function ReportRow({ r, admin = false, onAction, delay = 0, onClick }) {
  const { c } = useTheme();

  return (
    <div
      className="slide-in hover-lift"
      onClick={onClick}
      style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
        padding: "13px 15px", border: "1px solid " + c.border, borderRadius: 12,
        marginBottom: 8, transition: "transform 0.2s, box-shadow 0.2s",
        animationDelay: delay + "s",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* ID */}
      <div style={{ fontFamily: "monospace", fontSize: 12, color: c.accent, fontWeight: 700, minWidth: 28 }}>
        {r.id}
      </div>

      {/* Vehicle number + type */}
      <div style={{ flex: "2 1 130px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
          {r.vehicleNumber || "N/A"}
        </div>
        <div style={{ fontSize: 11, color: c.muted, marginTop: 1 }}>{r.type}</div>
      </div>

      {/* Fine amount */}
      <div style={{ flex: "1 1 90px", fontSize: 13, color: c.green, fontFamily: "monospace", fontWeight: 700 }}>
        {r.fine != null ? "₹" + r.fine.toLocaleString("en-IN") : "—"}
      </div>

      {/* Status badge */}
      <div style={{ flex: "1 1 100px" }}>
        <StatusBadge status={r.status} />
      </div>

      {/* Time + Admin buttons */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: c.dim }}>{r.time}</span>

        {admin && r.status === "PENDING" && (
          <>
            <button
              onClick={e => { e.stopPropagation(); onAction(r.id, "APPROVED"); }}
              style={{
                padding: "5px 11px", borderRadius: 7,
                border: "1px solid " + c.green + "55", background: c.greenDim,
                color: c.green, cursor: "pointer", fontSize: 11,
                fontWeight: 800, fontFamily: "inherit",
              }}
            >✓ Approve</button>

            <button
              onClick={e => { e.stopPropagation(); onAction(r.id, "REJECTED"); }}
              style={{
                padding: "5px 11px", borderRadius: 7,
                border: "1px solid " + c.red + "55", background: c.redDim,
                color: c.red, cursor: "pointer", fontSize: 11,
                fontWeight: 800, fontFamily: "inherit",
              }}
            >✕ Reject</button>
          </>
        )}
      </div>
    </div>
  );
}