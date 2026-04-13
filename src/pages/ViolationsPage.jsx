import { useState }   from "react";
import { useTheme }   from "../context/ThemeContext";
import { useReports } from "../context/ReportsContext";
import GlitchText     from "../components/ui/GlitchText";
import SpotlightCard  from "../components/ui/SpotlightCard";
import FilterBar      from "../components/shared/FilterBar";
import ReportRow      from "../components/shared/ReportRow";

export default function ViolationsPage() {
  const { c }                         = useTheme();
  const { reports, updateStatus, pendingCount } = useReports();
  const [filter, setFilter]           = useState("All");

  const filtered = filter === "All" ? reports : reports.filter(r => r.status === filter);

  return (
    <div>
      <div className="fade-up" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 22 }}>
        <div>
          <GlitchText text="Violation Queue" color={c.text} size={21} />
          <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
            {pendingCount} pending · {reports.length} total
          </div>
        </div>
        <FilterBar filter={filter} setFilter={setFilter} />
      </div>

      {pendingCount > 0 && (
        <div style={{
          marginBottom: 14, padding: "13px 16px",
          background: c.yellowDim, border: `1px solid ${c.yellow}44`,
          borderRadius: 12, display: "flex", alignItems: "center", gap: 10,
          color: c.yellow, fontSize: 13,
        }}>
          ⚠️ <strong>{pendingCount} violations</strong> require your review
        </div>
      )}

      <SpotlightCard style={{ padding: 18 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px", color: c.muted }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            No violations with status: <strong>{filter}</strong>
          </div>
        ) : (
          filtered.map((r, i) => (
            <ReportRow key={r.id} r={r} admin onAction={updateStatus} delay={i * 0.04} />
          ))
        )}
      </SpotlightCard>
    </div>
  );
}
