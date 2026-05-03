# 🚦 Traffic Violation System - Frontend

This is the frontend portion of the Traffic Violation Management System, built with React and Tailwind CSS. It features a modern, production-grade UI with dynamic animations, dark/light mode, and full responsiveness.

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

## 🗂 Project Structure Overview

```text
frontend/
├── public/                     # Static HTML and icons
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Admin dashboard components
│   │   ├── auth/               # Login and registration forms
│   │   ├── citizen/            # Citizen report components
│   │   ├── ui/                 # Reusable primitives (Buttons, Badges, etc.)
│   │   └── shared/             # Headers, Sidebars, Filters
│   ├── context/                # React Context for global state
│   ├── pages/                  # Top-level route pages
│   ├── styles/                 # Global CSS and Tailwind directives
│   └── utils/                  # Helper functions and Axios configuration
└── package.json
```

---

## 🎨 UI & Effects

The application heavily utilizes modern web design principles to create an engaging experience:
* **Tailwind CSS**: For utility-first, rapid styling.
* **Dynamic Animations**: Including shimmering loaders, animated counters, and interactive buttons.
* **Dark / Light Mode**: Toggled seamlessly across the application.
* **Responsive Breakpoints**: Fully optimized for mobile, tablet, and desktop viewing.

---

## 🔌 Backend Integration

This frontend is configured to communicate with the Spring Boot backend located in the parent directory (`../traffic-violation-api`). 

API calls are managed using `axios` (configured in `src/axiosConfig.js`). 
* **Authentication**: Token-based UUIDs are stored in local storage and passed in the `Authorization` header for protected routes.
* **OAuth**: Supports Google OAuth verification.

*Ensure the backend is running (typically on `http://localhost:8080`) before attempting to log in or fetch real data.*

---

## 🚀 Build for Production

```bash
npm run build
```
This will output an optimized production build in the `/build` folder, ready to be deployed on any static hosting provider.
