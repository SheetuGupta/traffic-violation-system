# 🚦 TrafficWatch — Smart Violation Reporting System

Production-grade React frontend with Reactbits-style UI effects, dark/light mode, and full responsiveness.

---

## 📦 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start

# 3. Open browser
http://localhost:3000
```

---

## 🗂 Project Structure

```
trafficwatch/
├── public/
│   └── index.html                  # HTML entry point
│
├── src/
│   ├── index.js                    # React DOM root
│   ├── App.jsx                     # Root app + context providers
│   │
│   ├── styles/
│   │   └── global.css              # Global styles, animations, breakpoints
│   │
│   ├── context/                    # React Context (global state)
│   │   ├── ThemeContext.js         # Dark/light theme tokens
│   │   ├── AuthContext.js          # Login/logout, user role
│   │   └── ReportsContext.js       # CRUD for violation reports
│   │
│   ├── data/
│   │   └── constants.js            # Mock data, violation types, analytics
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAnimCounter.js       # Animated number counter
│   │   ├── useTypedText.js         # Typewriter effect
│   │   └── useGlitch.js            # Glitch text trigger
│   │
│   ├── utils/
│   │   └── helpers.js              # formatINR, simulateOCR, validators
│   │
│   ├── components/
│   │   ├── ui/                     # Reactbits-style primitives
│   │   │   ├── AuroraBG.jsx        # Animated aurora gradient background
│   │   │   ├── ParticleGrid.jsx    # Mouse-reactive particle canvas
│   │   │   ├── SpotlightCard.jsx   # Card with mouse-following spotlight
│   │   │   ├── MagneticButton.jsx  # Button that leans toward cursor
│   │   │   ├── GlitchText.jsx      # RGB-split glitch text effect
│   │   │   ├── AnimCounter.jsx     # Number counter animation
│   │   │   ├── Shimmer.jsx         # Skeleton shimmer placeholder
│   │   │   ├── Chip.jsx            # Small badge/tag
│   │   │   ├── NoiseOverlay.jsx    # Film-grain noise texture
│   │   │   ├── StatusBadge.jsx     # Colored status pill
│   │   │   ├── Globe3D.jsx         # Rotating 3D dot globe (Canvas)
│   │   │   └── TypedText.jsx       # Typewriter cycling text
│   │   │
│   │   ├── auth/
│   │   │   └── LoginPage.jsx       # Full login screen with particle BG
│   │   │
│   │   ├── citizen/
│   │   │   ├── UploadZone.jsx      # Drag & drop + OCR simulation
│   │   │   └── ReportForm.jsx      # Full report submission form
│   │   │
│   │   ├── admin/                  # (extendable for admin-specific widgets)
│   │   │
│   │   ├── analytics/
│   │   │   ├── DonutChart.jsx      # SVG donut chart
│   │   │   └── BarChart.jsx        # Monthly bar chart
│   │   │
│   │   └── shared/
│   │       ├── Header.jsx          # Sticky header + mobile drawer nav
│   │       ├── ReportRow.jsx       # Single report list row
│   │       └── FilterBar.jsx       # Status filter buttons
│   │
│   ├── pages/                      # Top-level page views
│   │   ├── DashboardPage.jsx       # Hero + stats + recent activity
│   │   ├── ReportPage.jsx          # Upload & submit violation
│   │   ├── MyReportsPage.jsx       # Citizen: view own reports
│   │   ├── ViolationsPage.jsx      # Admin: approve/reject violations
│   │   └── AnalyticsPage.jsx       # Charts and statistics
│   │
│   └── assets/                     # Images, icons (add yours here)
│
└── package.json
```

---

## 🎨 Reactbits-Style Effects

| Component | Effect |
|---|---|
| `AuroraBG` | Drifting radial gradient blobs |
| `ParticleGrid` | Interactive dot grid — repels from mouse |
| `SpotlightCard` | Radial light follows cursor inside card |
| `MagneticButton` | Button physically leans toward cursor |
| `GlitchText` | RGB-split chromatic aberration glitch |
| `AnimCounter` | Numbers count up from 0 on load |
| `Shimmer` | Skeleton loading shimmer block |
| `Globe3D` | Canvas 3D rotating dot globe |
| `TypedText` | Typewriter cycling effect |
| `NoiseOverlay` | Subtle film grain texture |

---

## 🌗 Dark / Light Mode
Toggled via `ThemeContext`. All colors are tokens — never hardcoded.

## 📱 Responsive Breakpoints
- `< 900px` — Mobile nav drawer, globe hidden
- `< 680px` — 2-column grids collapse
- `< 420px` — Single column layout

---

## 🔌 Connecting to Backend

Replace mock data in `src/data/constants.js` and context files with real API calls:

```js
// Example: replace in ReportsContext.js
const res = await fetch("/api/reports", { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();
setReports(data);
```

Backend API endpoints to implement:
- `POST /auth/register`
- `POST /auth/login`
- `GET  /reports`
- `POST /reports`
- `PATCH /reports/:id/status`
- `GET  /analytics/summary`

---

## 🚀 Build for Production

```bash
npm run build
# Output: /build folder — ready to deploy on Vercel, Netlify, or any static host
```
