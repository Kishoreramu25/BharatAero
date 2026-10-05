# 🚁 BharatAero — Unified Platform

> **BharatAero** is an on-demand marketplace connecting agricultural landowners and enterprises with certified commercial drone pilots. Just like booking a ride, landowners can request crop spraying, aerial health surveys, and multispectral imaging in seconds, while licensed pilots receive broadcasts, accept missions, and get paid.

---

## 🏗️ Humanized Repository Structure

The project is structured as a clean, decoupled monorepo designed for instant developer onboarding:

```
BharatAero/
├── frontend/                  # React 19 + Vite + TailwindCSS Web & Mobile Client
│   ├── android/               # Native Android project (Capacitor)
│   ├── ios/                   # Native iOS project (Capacitor)
│   ├── assets/                # App icon & splash screen masters
│   ├── public/                # Vite static assets (logo, icons/, manifest.webmanifest)
│   ├── scripts/               # Frontend maintenance scripts (Sharp logo converter, storage verify)
│   ├── src/
│   │   ├── components/        # Reusable UI components (BottomNav, SimulatorFrame, ImageCropper)
│   │   ├── context/           # Global state management (AppContext)
│   │   ├── hooks/             # Custom React lifecycle hooks (useImageLoader, useRouterPrefetch)
│   │   ├── screens/           # 18 domain-driven screens (Login, Dashboards, Booking, Settings)
│   │   ├── utils/             # Utilities (authLogic, SecureStorage, translations, perfMonitor)
│   │   ├── App.jsx            # Screen routing & flow state machine
│   │   ├── supabase.js        # Supabase JS client configuration
│   │   └── useBharatAero.ts   # Unified data integration hook
│   ├── capacitor.config.json  # Mobile native wrapper configuration
│   ├── package.json           # Frontend dependencies & build commands
│   ├── vite.config.js         # Vite bundler, proxy configuration & compression plugins
│   └── README.md              # Dedicated frontend developer guide
│
├── backend/                   # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/            # Database pool & environment variables
│   │   ├── controllers/       # HTTP request sanitization & response mapping
│   │   ├── middleware/        # Security headers, JWT auth, and rate limiters
│   │   ├── repositories/      # Data access layer (PostgreSQL / Supabase queries)
│   │   ├── routes/            # REST API route declarations (/api/pilots, /api/bookings)
│   │   ├── services/          # Business logic, notifications, and transactions
│   │   ├── utils/             # Helper utilities
│   │   └── app.js             # Express application initialization & middleware pipeline
│   ├── scripts/               # Database management scripts (migrations, schema check, wipe_db)
│   ├── package.json           # Backend dependencies & scripts
│   └── README.md              # Dedicated backend developer guide
│
├── media/                     # Official demo recordings & generation tooling
│   ├── BharatAero_Official_Demo.mp4  # High-definition demo video (4.5 MB)
│   ├── BharatAero_Official_Demo.webm # Optimized WebM demo video (4.0 MB)
│   └── scripts/               # Automation scripts for recording & voiceover
│       ├── generate_audio.py  # Edge TTS multilingual voice synthesis pipeline
│       └── record_full_demo.py # Playwright headless dual-login recording engine
│
├── docs/                      # Documentation & design artifacts
│   ├── index.html             # Project landing page (hosted on GitHub Pages)
│   └── legacy_mockups/        # Archive of original HTML prototypes & UI design references
│
├── .github/                   # CI/CD automation workflows
├── package.json               # Root monorepo scripts & unified runner
├── run-dev.js                 # Dual-service concurrent dev server launcher
├── vercel.json                # Vercel deployment build configuration
└── README.md                  # This file
```

---

## ⚡ Quickstart (Get Running in 60 Seconds)

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 2. Install All Dependencies
Install both backend and frontend dependencies in one command:
```bash
npm run install-all
```

### 3. Launch Development Environment
Run the unified dev runner:
```bash
npm run dev
```

This single command boots both services simultaneously with color-coded terminal logs:
- 🌐 **Frontend Client:** [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend API:** [http://localhost:5000](http://localhost:5000) (Proxy accessible via `/api`)

---

## 👥 How the System Works: Dual-User Flows

BharatAero features two fully integrated personas:

### 1. Landowner Flow (e.g., Kumar)
1. **Login:** Selects **"I Need Drone Services"**, signs in via Phone OTP or Email.
2. **Browse:** Searches available pilots filtered by location, rating, and UAV equipment.
3. **Configure & Book:** Selects required service (e.g., *50-Acre Paddy Crop Spraying*), drops a GPS pin on the farm, selects flight date, and broadcasts the mission request.
4. **Track:** Monitors mission status in real time with automated notification updates.

### 2. Certified Pilot Flow (e.g., Kishore)
1. **Login:** Selects **"Certified Pilot"**, signs in to the pilot account.
2. **Mission Board:** Live mission board alerts the pilot to new flight broadcasts nearby.
3. **Accept & Fly:** Pilot inspects acreage, chemical payloads, and location, accepts the booking, and navigates to the field.
4. **Earnings & Analytics:** Tracks completed flight hours, customer ratings, and automated payouts via the Earnings Overview.

---

## 🛠️ Root Workspace Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts both Frontend (`:3000`) and Backend (`:5000`) in parallel |
| `npm run dev:frontend` | Runs only the Vite frontend dev server |
| `npm run dev:backend` | Runs only the Express backend dev server |
| `npm run install-all` | Installs dependencies for both `frontend/` and `backend/` |
| `npm run frontend:build` | Compiles optimized, compressed production build into `frontend/dist` |

---

## 📱 Mobile App (Capacitor)

The frontend is fully native-ready. To test or compile for iOS and Android:

```bash
cd frontend
npm run build:mobile       # Builds web bundle & synchronizes native assets
npm run cap:open:android   # Opens project in Android Studio
npm run cap:open:ios       # Opens project in Xcode
```

---

## 🎬 Product Demo Video

You can find the high-definition product walkthrough videos directly in the repository:
- **MP4 Format:** [media/BharatAero_Official_Demo.mp4](media/BharatAero_Official_Demo.mp4)
- **WebM Format:** [media/BharatAero_Official_Demo.webm](media/BharatAero_Official_Demo.webm)

To reproduce the automated live demo video recording with Playwright and Edge-TTS voice synthesis:
```bash
# Ensure frontend dev server is running on :3000
python media/scripts/record_full_demo.py
```

---

## 🔐 Security & Database

- **Data Isolation:** Enforced via PostgreSQL Row-Level Security (RLS) policies on Supabase.
- **Authentication:** Crypto-secure OTP validation, JWT session handling, and Google OAuth.
- **Layered Architecture:** Strict separation of concerns adhering to the Controller ➔ Service ➔ Repository pattern.

---

## 🤝 Contributing & Code Guidelines

1. Place all React UI, styles, and mobile features inside `frontend/src/`.
2. Place all server logic, database repositories, and endpoints inside `backend/src/`.
3. Keep root free of transient build artifacts or scratch files.
4. Run `npm run frontend:build` before pushing to verify bundle compilation.
