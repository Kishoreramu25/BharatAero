# BharatAero REST API Service Scaffolding

This directory contains the production-grade, Node.js + Express backend service layout for the BharatAero platform. It exposes REST API endpoints, applies validation and middleware pipelines, and interfaces with the database layer using the **Controller ➔ Service ➔ Repository** pattern.

## Architectural Layers

*   `app.js` — Bootstraps the Express application server, security middleware, and centralized error logs.
*   `routes/api.js` — Declares endpoint mapping rules and triggers parameter schema validation.
*   `middleware/` — Verifies authentication, intercepts parameters, and formats standard system logging.
*   `controllers/` — Sanitizes HTTP values, calls service functions, and maps status return codes.
*   `services/` — Enforces transaction rules, parses query calculations, and governs business models.
*   `repositories/` — Builds SQL parameters and directly queries tables in the database (Data Access Layer).

## Quickstart

### Prerequisites

Ensure you have [Node.js](https://nodejs.org) installed.

### Setup and Start

1.  Navigate to the directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure variables in a `.env` file at the backend root:
    ```env
    PORT=5000
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bharataero
    ```
4.  Run in development (auto-reload):
    ```bash
    npm run dev
    ```

## Endpoint Definitions

*   `GET /api/pilots` — Retrieve registered drone pilots (filter via query parameters: `specialty` or `location`).
*   `GET /api/pilots/:id` — Retrieve full detail properties for a specific pilot profile.
*   `POST /api/bookings` — Create a pilot scheduling request.
*   `GET /api/bookings` — Retrieve the historical log of client schedules.
*   `GET /health` — Check server status and uptime performance metrics.
