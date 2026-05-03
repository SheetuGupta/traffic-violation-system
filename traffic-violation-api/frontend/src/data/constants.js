// ═══════════════════════════════════════════
//  TrafficWatch — App-wide Constants & Data
// ═══════════════════════════════════════════

import { Clock, Check, X, IndianRupee } from "lucide-react/dist/cjs/lucide-react";

export const VIOLATION_TYPES = [
  "Red Light Jump",
  "No Helmet",
  "Speeding",
  "Wrong Side",
  "Overloading",
  "No Seatbelt",
  "Triple Riding",
  "Drunk Driving",
];

// Fine mapping — violation type ke hisaab se automatic fine
export const VIOLATION_FINES = {
  "Red Light Jump":  1000,
  "No Helmet":        500,
  "Speeding":        2000,
  "Wrong Side":      1500,
  "Overloading":     2000,
  "No Seatbelt":      500,
  "Triple Riding":    500,
  "Drunk Driving":   5000,
};

export const STATUS_CONFIG = {
  Pending:      { col: "yellow", icon: <Clock size={12} />, label: "Pending" },
  Approved:     { col: "green",  icon: <Check size={12} />,  label: "Approved" },
  Rejected:     { col: "red",    icon: <X size={12} />,  label: "Rejected" },
  "Fine Issued":{ col: "purple", icon: <IndianRupee size={12} />,  label: "Fine Issued" },
};

export const FILTER_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Fine Issued"];

export const INITIAL_REPORTS = [
  { id:"RPT-001", vehicle:"MH12AB1234", type:"Red Light Jump", area:"Connaught Place", status:"Approved",    fine:1000, time:"2h ago" },
  { id:"RPT-002", vehicle:"DL5S9876",   type:"No Helmet",      area:"Cyber City",      status:"Pending",     fine:0,    time:"5h ago" },
  { id:"RPT-003", vehicle:"KA01MX5432", type:"Speeding",        area:"MG Road",         status:"Fine Issued", fine:2000, time:"1d ago" },
  { id:"RPT-004", vehicle:"TN09AK3210", type:"Wrong Side",      area:"Anna Nagar",      status:"Rejected",    fine:0,    time:"2d ago" },
  { id:"RPT-005", vehicle:"MH04CX7788", type:"Overloading",     area:"Bandra",          status:"Pending",     fine:0,    time:"3d ago" },
  { id:"RPT-006", vehicle:"UP32GH4455", type:"No Seatbelt",     area:"Hazratganj",      status:"Approved",    fine:500,  time:"4d ago" },
];

export const ANALYTICS_DATA = {
  monthly: [42, 58, 45, 71, 63, 89, 74, 95, 82, 108, 97, 115],
  months:  ["J","F","M","A","M","J","J","A","S","O","N","D"],
  areas: [
    { name:"Connaught Place", count:47 },
    { name:"Cyber City",      count:38 },
    { name:"MG Road",         count:29 },
    { name:"Anna Nagar",      count:24 },
    { name:"Bandra",          count:21 },
  ],
};

export const TYPED_WORDS = ["Protect Lives.", "Ensure Safety.", "Build Trust.", "Save Cities."];

export const HERO_STRIP_STATS = [
  { l:"Reports Today", v:"23" },
  { l:"Zones Active",  v:"47" },
  { l:"Avg Response",  v:"4.2h" },
  { l:"Fine Rate",     v:"68%" },
];
