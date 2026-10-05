# 🚁 BharatAero — Frontend Client & Mobile App

The frontend for **BharatAero** is a high-performance, responsive Single-Page Application (SPA) built with **React 19**, **Vite**, and **TailwindCSS**, designed to compile seamlessly as both a web client and native mobile apps (**iOS** & **Android**) powered by **Capacitor**.

---

## 🏗️ Architecture Overview

The frontend follows a domain-driven, screen-based directory structure:

```
frontend/
├── android/               # Native Android Capacitor wrapper project
├── ios/                   # Native iOS Capacitor wrapper project
├── assets/                # App icon & splash screen masters for Capacitor
├── public/                # Vite static assets (logo, manifest, service worker)
│   └── icons/             # PWA app icons (48px through 512px)
├── scripts/               # Developer helper scripts (asset converter, test utils)
│   ├── check-files.js     # Supabase storage verification utility
│   ├── check-storage.js   # Bucket permission and listing verification
│   └── convert-logo.js    # Sharp-based icon & splash generator
├── src/
│   ├── components/        # Reusable UI widgets & frames
│   │   ├── BottomNav.jsx         # Mobile navigation bar
│   │   ├── ImageCropper.jsx      # Profile/License photo crop modal
│   │   ├── ProgressiveImage.jsx  # Blur-up image placeholder component
│   │   └── SimulatorFrame.jsx    # Desktop-to-mobile view container
│   ├── context/           # Global application state
│   │   └── AppContext.jsx        # Auth, active role, current user, booking state
│   ├── hooks/             # Custom React lifecycle & performance hooks
│   │   ├── useImageLoader.js     # Progressive image caching hook
│   │   └── useRouterPrefetch.js  # Low-latency route prefetching
│   ├── screens/           # Application views and role dashboards
│   │   ├── AboutScreen.jsx               # Platform info & developer credentials
│   │   ├── AuthenticationFlow.jsx        # Unified OTP & Google OAuth handler
│   │   ├── AvailabilityManagement.jsx    # Pilot calendar slot selector
│   │   ├── BookingConfirmed.jsx          # Success screen with reservation summary
│   │   ├── BookPilot.jsx                 # Farm survey/spraying order configuration
│   │   ├── BrowsePilots.jsx              # Pilot discovery & search catalog
│   │   ├── ClientDashboard.jsx           # Landowner/Client home view
│   │   ├── EarningsOverview.jsx          # Pilot revenue, payouts, and metrics
│   │   ├── LoginScreen.jsx               # Mobile-optimized login interface
│   │   ├── MyBookings.jsx                # Client booking history & live status
│   │   ├── NotificationsScreen.jsx       # Real-time alerts & status changes
│   │   ├── OnboardingCarousel.jsx        # Welcome walk-through cards
│   │   ├── PilotDashboard.jsx            # Pilot live mission board & telemetry
│   │   ├── PilotProfile.jsx              # Public drone pilot profile & equipment
│   │   ├── PrivacyPolicy.jsx             # Compliance & privacy disclosures
│   │   ├── RoleSelection.jsx             # Switch between Landowner & Pilot roles
│   │   ├── SettingsScreen.jsx            # Profile, theme, language, and docs
│   │   └── TermsOfService.jsx            # Terms & legal agreement
│   ├── utils/             # Helper utilities & data constants
│   │   ├── SecureStorage.js      # Encrypted local storage wrapper
│   │   ├── authLogic.js          # Authentication business rules
│   │   ├── perfMonitor.js        # Core Web Vitals logging
│   │   └── translations.js       # Multi-language localization dictionary
│   ├── App.jsx            # Root application router & screen switcher
│   ├── App.css            # Component-level styles
│   ├── index.css          # Tailwind utilities, design tokens, and keyframes
│   ├── main.jsx           # React DOM mounting entry point
│   ├── supabase.js        # Supabase JS Client initialization
│   ├── supabaseQueries.ts # Type-safe database queries & mutations
│   └── useBharatAero.ts   # Custom hook uniting Supabase queries with AppContext
├── capacitor.config.json  # Capacitor mobile configuration & app IDs
├── index.html             # HTML entry shell with fonts & Google Sign-In SDK
├── package.json           # Dependencies and build scripts
└── vite.config.js         # Vite configuration with chunk splitting & compression
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create or verify the `.env` file in `frontend/`:
```env
VITE_SUPABASE_URL=https://ujecqxyphgeurhclitwb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_jKZJC-AvjoDq2OKy5YSyBQ_kJsIoSHH
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile Compilation (Capacitor)

BharatAero is configured for native compilation on **Android** and **iOS**:

```bash
# 1. Build the production web bundle and sync to native projects
npm run build:mobile

# 2. Open in Android Studio
npm run cap:open:android

# 3. Open in Xcode (macOS only)
npm run cap:open:ios
```

---

## 🛠️ Key Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches Vite dev server at port 3000 with HMR |
| `npm run build` | Builds optimized production bundle with Brotli/Gzip compression |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs ESLint against all source files |
| `node scripts/convert-logo.js` | Generates mobile app icons & splash screens |
