import { useState, useMemo } from "react";
import { AlertTriangle, Calendar, Check, CheckCircle2, ClipboardList, IndianRupee, Hourglass, MapPin, RefreshCcw, Search, X, XCircle } from "lucide-react/dist/cjs/lucide-react";
import { useTheme }          from "../context/ThemeContext";
import { useReports }        from "../context/ReportsContext";
import GlitchText            from "../components/ui/GlitchText";
import SpotlightCard         from "../components/ui/SpotlightCard";
import AnimCounter           from "../components/ui/AnimCounter";
import StatusBadge           from "../components/ui/StatusBadge";
import UserDetailModal       from "../components/admin/UserDetailModal";

export default function ViolationsPage() {
  const { c }                               = useTheme();
  const { reports, updateStatus, pendingCount } = useReports();

  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [timeFilter,   setTimeFilter]   = useState("All");
  const [areaSearch,   setAreaSearch]   = useState("");
  const [search,       setSearch]       = useState("");
  const [selectedRow,  setSelectedRow]  = useState(null);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { bulkUpdateStatus } = useReports();

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchStatus = statusFilter === "All" || r.status === statusFilter.toUpperCase();
      const matchType   = typeFilter   === "All" || r.type === typeFilter;
      const matchArea   = areaSearch === "" || r.location?.toLowerCase().includes(areaSearch.toLowerCase());
      const matchSearch = search === "" ||
        r.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
        r.type?.toLowerCase().includes(search.toLowerCase());

      let matchTime = true;
      if (timeFilter !== "All" && r.time && r.time !== "N/A" && r.time !== "Just now") {
        try {
          const rDate = new Date(r.time);
          const today = new Date();
          if (timeFilter === "Today") {
            matchTime = rDate.toDateString() === today.toDateString();
          } else if (timeFilter === "This Week") {
            const diffTime = Math.abs(today - rDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            matchTime = diffDays <= 7;
          }
        } catch {
          matchTime = false;
        }
      }

      return matchStatus && matchType && matchArea && matchSearch && matchTime;
    });
  }, [reports, statusFilter, typeFilter, areaSearch, search, timeFilter]);

  const totalFine     = reports.reduce((s, r) => s + (r.fine || 0), 0);
  const approvedCount = reports.filter(r => r.status === "APPROVED").length;
  const rejectedCount = reports.filter(r => r.status === "REJECTED").length;
  const fineIssued    = reports.filter(r => r.status === "FINE ISSUED").length;

  const violationTypes = ["All", ...new Set(reports.map(r => r.type).filter(Boolean))];
  const statusOptions  = ["All", "PENDING", "APPROVED", "REJECTED", "FINE ISSUED"];

  const inp = {
    padding: "9px 14px", borderRadius: 8, fontSize: 12,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  const handleAction = (e, id, status, updatedRow) => {
    e.stopPropagation();
    updateStatus(id, status);
    setSelectedRow(updatedRow ? { ...updatedRow, status: status.replace("_", " ") } : null);
  };

  const handleBulkAction = async (status) => {
    if (selectedIds.size === 0) return;
    await bulkUpdateStatus(Array.from(selectedIds), status);
    setSelectedIds(new Set());
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = (e) => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <GlitchText text="Violation Queue" color={c.text} size={21} />
          <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
            {pendingCount} pending · {reports.length} total
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { l: "Total",       v: reports.length,  icon: <ClipboardList size={22} color={c.accent} />, col: "accent"  },
          { l: "Pending",     v: pendingCount,     icon: <Hourglass size={22} color={c.yellow} />, col: "yellow"  },
          { l: "Approved",    v: approvedCount,    icon: <CheckCircle2 size={22} color={c.green} />, col: "green"   },
          { l: "Fine Issued", v: fineIssued,       icon: <IndianRupee size={22} color={c.purple} />, col: "purple"  },
        ].map((s, i) => (
          <SpotlightCard key={i} style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>{s.icon}</div>
            <AnimCounter value={s.v} color={c[s.col]} size={22} />
            <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{s.l}</div>
          </SpotlightCard>
        ))}
      </div>

      {/* Total Fine Banner */}
      <SpotlightCard style={{ padding: "16px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: c.muted, marginBottom: 4 }}>TOTAL SYSTEM FINE COLLECTED</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: c.accent, fontFamily: "monospace" }}>
              ₹{totalFine.toLocaleString("en-IN")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: c.muted }}>Approved</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.green }}>{approvedCount}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: c.muted }}>Rejected</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.red }}>{rejectedCount}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: c.muted }}>Fine Issued</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.purple }}>{fineIssued}</div>
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Search + Filters */}
      <SpotlightCard style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 150px" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: c.muted }} />
            <input
              style={{ ...inp, paddingLeft: 34, width: "100%" }}
              placeholder="Search plate or type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: "relative", flex: "1 1 150px" }}>
            <MapPin size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: c.muted }} />
            <input
              style={{ ...inp, paddingLeft: 34, width: "100%" }}
              placeholder="Search area..."
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
            />
          </div>
          <select style={{ ...inp, cursor: "pointer" }} value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
            <option>All</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
          <select style={{ ...inp, cursor: "pointer" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={{ ...inp, cursor: "pointer" }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {violationTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          {(search || areaSearch || statusFilter !== "All" || typeFilter !== "All" || timeFilter !== "All") && (
            <button onClick={() => { setSearch(""); setAreaSearch(""); setStatusFilter("All"); setTypeFilter("All"); setTimeFilter("All"); }} style={{
              ...inp, cursor: "pointer", color: c.red,
              border: `1px solid ${c.red}44`, background: c.redDim,
              display: "flex", alignItems: "center", gap: 6,
            }}><XCircle size={14} /> Clear</button>
          )}
          <div style={{ fontSize: 12, color: c.muted, marginLeft: "auto" }}>
            {filtered.length} results
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 13, color: c.text, fontWeight: 600, display: "flex", alignItems: "center" }}>
              {selectedIds.size} selected
            </div>
            <button onClick={() => handleBulkAction("APPROVED")} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${c.green}55`, background: c.greenDim,
              color: c.green, fontWeight: 700, fontSize: 12, fontFamily: "inherit",
            }}>✓ Bulk Approve</button>
            <button onClick={() => handleBulkAction("REJECTED")} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${c.red}55`, background: c.redDim,
              color: c.red, fontWeight: 700, fontSize: 12, fontFamily: "inherit",
            }}>✕ Bulk Reject</button>
            <button onClick={() => handleBulkAction("FINE_ISSUED")} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${c.purple}55`, background: c.purpleDim,
              color: c.purple, fontWeight: 700, fontSize: 12, fontFamily: "inherit",
            }}>₹ Bulk Issue Fine</button>
          </div>
        )}
      </SpotlightCard>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div style={{
          padding: "13px 16px",
          background: c.yellowDim, border: `1px solid ${c.yellow}44`,
          borderRadius: 12, display: "flex", alignItems: "center", gap: 10,
          color: c.yellow, fontSize: 13,
        }}>
          <AlertTriangle size={16} /> <strong>{pendingCount} violations</strong> require your review
        </div>
      )}

      {/* Violations List */}
      <SpotlightCard style={{ padding: 18 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px", color: c.muted }}>
            <Search size={44} style={{ marginBottom: 12 }} />
            No violations found
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", padding: "0 15px 10px 15px", borderBottom: `1px solid ${c.border}`, marginBottom: 4 }}>
              <input 
                type="checkbox" 
                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                onChange={toggleSelectAll}
                style={{ marginRight: 12, cursor: "pointer" }}
              />
              <div style={{ fontSize: 11, color: c.muted }}>Select All</div>
            </div>
            {filtered.map((r, i) => (
              <div key={r.id}>

                {/* Row */}
                <div
                  onClick={() => setSelectedRow(selectedRow?.id === r.id ? null : r)}
                  style={{
                    display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
                    padding: "13px 15px",
                    border: `1px solid ${selectedRow?.id === r.id ? c.accent : c.border}`,
                    borderRadius: selectedRow?.id === r.id ? "12px 12px 0 0" : 12,
                    background: selectedRow?.id === r.id ? c.accentDim : "transparent",
                    cursor: "pointer", transition: "all 0.2s",
                    animationDelay: `${i * 0.04}s`,
                  }} className="slide-in hover-lift">

                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(r.id)}
                    onChange={(e) => toggleSelect(e, r.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginRight: 4, cursor: "pointer" }}
                  />

                  <div style={{ fontFamily: "monospace", fontSize: 12, color: c.accent, fontWeight: 700, minWidth: 28 }}>
                    {r.id}
                  </div>

                  <div style={{ flex: "2 1 130px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                      {r.vehicleNumber || "N/A"}
                    </div>
                    <div style={{ fontSize: 11, color: c.muted, marginTop: 1 }}>{r.type}</div>
                  </div>

                  <div style={{ flex: "1 1 100px", fontSize: 11, color: c.muted, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={12} /> {r.location || "N/A"}
                  </div>

                  <div style={{ fontSize: 13, color: c.green, fontFamily: "monospace", fontWeight: 700 }}>
                    ₹{(r.fine || 0).toLocaleString("en-IN")}
                  </div>

                  <StatusBadge status={r.status} />

                  <div style={{ fontSize: 11, color: c.dim, marginLeft: "auto" }}>
                    {r.time}
                  </div>
                </div>

                {/* Detail Panel */}
                {selectedRow?.id === r.id && (
                  <div style={{
                    padding: "18px", border: `1px solid ${c.accent}`,
                    borderTop: "none", borderRadius: "0 0 12px 12px",
                    background: c.hi,
                  }}>

                    {/* Detail Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>VEHICLE</div>
                        <div style={{ fontFamily: "monospace", fontWeight: 700, color: c.accent }}>
                          {r.vehicleNumber}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>VIOLATION</div>
                        <div style={{ fontWeight: 600, color: c.text }}>{r.type}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>FINE</div>
                        <div style={{ fontFamily: "monospace", fontWeight: 700, color: c.red }}>
                          ₹{(r.fine || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>LOCATION</div>
                        <div style={{ color: c.text, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><MapPin size={12} /> {r.location || "N/A"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>DATE & TIME</div>
                        <div style={{ color: c.text, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><Calendar size={12} /> {r.time}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>STATUS</div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>REPORTED BY</div>
                        <div 
                          style={{ 
                            color: r.reporterId ? c.accent : c.text, 
                            fontSize: 12, 
                            cursor: r.reporterId ? "pointer" : "default", 
                            textDecoration: r.reporterId ? "underline" : "none" 
                          }}
                          onClick={() => {
                            if (r.reporterId) {
                              setSelectedUserId(r.reporterId);
                            }
                          }}
                        >
                          {r.reporterName || "Unknown"}
                        </div>
                      </div>
                    </div>

                    {/* Evidence Image */}
                    {r.imageUrl && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 6 }}>EVIDENCE PHOTO</div>
                        <img
                          src={r.imageUrl}
                          alt="evidence"
                          style={{
                            maxHeight: 200, maxWidth: "100%",
                            borderRadius: 8, objectFit: "cover",
                            border: `1px solid ${c.border}`,
                            cursor: "pointer",
                          }}
                          onClick={() => window.open(r.imageUrl, "_blank")}
                        />
                      </div>
                    )}



                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>

                      {/* PENDING → Approve or Reject */}
                      {r.status === "PENDING" && (
                        <>
                          <button onClick={(e) => handleAction(e, r.id, "APPROVED", r)} style={{
                            padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                            border: `1px solid ${c.green}55`, background: c.greenDim,
                            color: c.green, fontWeight: 700, fontFamily: "inherit", fontSize: 12,
                            display: "flex", alignItems: "center", gap: 6,
                          }}><Check size={14} /> Approve</button>

                          <button onClick={(e) => handleAction(e, r.id, "REJECTED", r)} style={{
                            padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                            border: `1px solid ${c.red}55`, background: c.redDim,
                            color: c.red, fontWeight: 700, fontFamily: "inherit", fontSize: 12,
                            display: "flex", alignItems: "center", gap: 6,
                          }}><X size={14} /> Reject</button>
                        </>
                      )}

                      {/* APPROVED → Issue Fine + Revert to Pending */}
                      {r.status === "APPROVED" && (
                        <>
                          <button onClick={(e) => handleAction(e, r.id, "FINE_ISSUED", r)} style={{
                            padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                            border: `1px solid ${c.purple}55`, background: c.purpleDim,
                            color: c.purple, fontWeight: 700, fontFamily: "inherit", fontSize: 13,
                            display: "flex", alignItems: "center", gap: 6,
                          }}><IndianRupee size={14} /> Issue Fine — ₹{(r.fine || 0).toLocaleString("en-IN")}</button>

                          <button onClick={(e) => handleAction(e, r.id, "PENDING", r)} style={{
                            padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                            border: `1px solid ${c.yellow}55`, background: c.yellowDim,
                            color: c.yellow, fontWeight: 700, fontFamily: "inherit", fontSize: 12,
                            display: "flex", alignItems: "center", gap: 6,
                          }}><RefreshCcw size={14} /> Revert to Pending</button>
                        </>
                      )}

                      {/* FINE ISSUED → Revert to Approved */}
                      {r.status === "FINE ISSUED" && (
                        <>
                          <div style={{
                            padding: "8px 16px", borderRadius: 8,
                            background: c.purpleDim, border: `1px solid ${c.purple}44`,
                            color: c.purple, fontSize: 12, fontWeight: 600,
                            display: "inline-flex", alignItems: "center", gap: 6,
                          }}>
                            <IndianRupee size={14} /> Fine of ₹{(r.fine || 0).toLocaleString("en-IN")} issued
                          </div>

                          <button onClick={(e) => handleAction(e, r.id, "APPROVED", r)} style={{
                            padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                            border: `1px solid ${c.yellow}55`, background: c.yellowDim,
                            color: c.yellow, fontWeight: 700, fontFamily: "inherit", fontSize: 12,
                            display: "flex", alignItems: "center", gap: 6,
                          }}><RefreshCcw size={14} /> Revert to Approved</button>
                        </>
                      )}

                      {/* REJECTED → Revert to Pending */}
                      {r.status === "REJECTED" && (
                        <>
                          <div style={{
                            padding: "8px 16px", borderRadius: 8,
                            background: c.redDim, border: `1px solid ${c.red}44`,
                            color: c.red, fontSize: 12, fontWeight: 600,
                            display: "inline-flex", alignItems: "center", gap: 6,
                          }}>
                            <X size={14} /> Violation Rejected
                          </div>

                          <button onClick={(e) => handleAction(e, r.id, "PENDING", r)} style={{
                            padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                            border: `1px solid ${c.yellow}55`, background: c.yellowDim,
                            color: c.yellow, fontWeight: 700, fontFamily: "inherit", fontSize: 12,
                            display: "flex", alignItems: "center", gap: 6,
                          }}><RefreshCcw size={14} /> Revert to Pending</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SpotlightCard>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}