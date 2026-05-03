import { createContext, useContext, useState } from "react";

// ═══════════════════════════════════════════
//  Theme tokens — dark & light
// ═══════════════════════════════════════════
export const THEMES = {
  dark: {
    bg:         "#070C14",
    surface:    "#0C1522",
    hi:         "#101E30",
    border:     "#162236",
    text:       "#E4EFFF",
    muted:      "#5E7A9E",
    dim:        "#2E4060",
    accent:     "#00CFFF",
    accentDim:  "#071E2A",
    accentGlow: "rgba(0,207,255,0.2)",
    red:        "#FF3355",
    redDim:     "#2A0810",
    green:      "#00E8A0",
    greenDim:   "#062A1A",
    yellow:     "#FFBE00",
    yellowDim:  "#2A1E00",
    purple:     "#AA80FF",
    purpleDim:  "#160E30",
    shadow:     "0 8px 40px rgba(0,0,0,0.5)",
    glow:       "0 0 40px rgba(0,207,255,0.1)",
  },
  light: {
    bg:         "#EEF3FA",
    surface:    "#FFFFFF",
    hi:         "#F4F8FF",
    border:     "#D0DDED",
    text:       "#0C1A2E",
    muted:      "#4A6280",
    dim:        "#90A8C0",
    accent:     "#0070D8",
    accentDim:  "#D4EBFF",
    accentGlow: "rgba(0,112,216,0.15)",
    red:        "#D8003A",
    redDim:     "#FFE0EA",
    green:      "#007A52",
    greenDim:   "#D0F5E8",
    yellow:     "#A06000",
    yellowDim:  "#FFF3D0",
    purple:     "#5530CC",
    purpleDim:  "#EAE4FF",
    shadow:     "0 4px 24px rgba(0,40,100,0.08)",
    glow:       "0 0 30px rgba(0,112,216,0.07)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("dark");
  const toggle = () => setMode(m => (m === "dark" ? "light" : "dark"));
  const c = THEMES[mode];
  const dark = mode === "dark";

  return (
    <ThemeContext.Provider value={{ mode, toggle, c, dark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
