// ═══════════════════════════════════════════
//  Utility helpers
// ═══════════════════════════════════════════

/** Generate next report ID from current list */
export const nextReportId = (reports) =>
  `RPT-${String(reports.length + 1).padStart(3, "0")}`;

/** Format currency in Indian style */
export const formatINR = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

/** Clamp a number between min and max */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/** Simulate OCR extraction delay */
export const simulateOCR = (callback, delay = 2200) =>
  setTimeout(() => callback("MH12AB1234"), delay);

/** Simple email validator */
export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

/** Get violation stats from report list */
export const getViolationStats = (reports) => {
  const map = {};
  reports.forEach(r => {
    map[r.type] = (map[r.type] || 0) + 1;
  });
  return Object.entries(map)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
};

/** Sum all fines */
export const totalFines = (reports) =>
  reports.filter(r => r.fine > 0).reduce((s, r) => s + r.fine, 0);
