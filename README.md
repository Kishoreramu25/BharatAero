# BharatAero Platform Workspace

Welcome to the BharatAero platform repository. This project is structured into a clean, production-grade, three-tier architecture separating the client interface, API services, and database schemas.

```
BharatAero/ (Workspace Root)
├── frontend/         <-- React + Vite Client with Capacitor Native Mobile Wrapper
├── backend/          <-- Express REST API (Controller ➔ Service ➔ Repository Pattern)
└── database/         <-- Database migrations, table initialization, and seeds
```

---

## Directory Overview

### 1. `/frontend`
The client-side Single Page Application (SPA) compiled with Vite and wrapped using Capacitor for native iOS/Android builds.
*   **Technologies:** React, Tailwind CSS, Leaflet Maps, Workbox PWA.
*   **Key Directories:**
    *   `src/screens/` — Page modules including Booking flows and Pilot dashboards.
    *   `src/components/` — Reusable elements (e.g. `ProgressiveImage` for skeleton loader views).
    *   `src/hooks/` — Custom behaviors (e.g. `useImageLoader` for lazy loading, `useRouterPrefetch` for predictive routing).
    *   `android/` & `ios/` — Native build wrapper project layers.

### 2. `/backend`
Node.js REST API service built with Express. It isolates business layer filters from route handlers and database queries.
*   **Technologies:** Node, Express, pg (PostgreSQL driver).
*   **Key Directories:**
    *   `src/controllers/` — Process route inputs and compile client response status codes.
    *   `src/services/` — Primary business transactions and filter logic calculations.
    *   `src/repositories/` — SQL builders querying database tables directly (Data Access Object pattern).

### 3. `/database`
System schemas, indices, seeding records, and versioned database upgrades.
*   **Key Directories:**
    *   `schemas/init.sql` — Relational database definition (DDL) with keys and triggers.
    *   `migrations/` — Database migrations for updating production tables.
    *   `seeds/` — Initial records to seed local databases for test routines.

---

## Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org) (v18+ recommended)
*   [npm](https://www.npmjs.com) (comes with Node.js)

### 1. Local Frontend Development
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install client dependencies:
    ```bash
    npm install
    ```
3.  Start the local development server:
    ```bash
    npm run dev
    ```
4.  Build and sync mobile platform assets:
    ```bash
    npm run build:mobile
    ```

### 2. Local Backend Service Development
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install backend dependencies:
    ```bash
    npm install
    ```
3.  Set up environment configurations:
    Create a `.env` file containing:
    ```env
    PORT=5000
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bharataero
    ```
4.  Run in development mode:
    ```bash
    npm run dev
    ```

### 3. Database Layer Setup
Create a PostgreSQL database and run the schema setup:
```bash
psql -U postgres -d bharataero -f database/schemas/init.sql
psql -U postgres -d bharataero -f database/seeds/pilot_seeds.sql
```
See [database/ERD.md](file:///database/ERD.md) for full descriptions of table entity relationships.
