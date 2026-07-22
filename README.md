# Unified Commerce Hub

Unified Commerce Hub is a multi-channel e-commerce orchestration layer that aggregates inventory and order management between a master ERP (**Logo İşbaşı**), an e-invoice integrator (**EDM Fatura**), and multiple marketplace channels (Shopify, Trendyol, Hepsiburada, Amazon, N11, Pazarama, Beymen, Defacto, Hipicon, LCW).

## Architecture

- **Frontend**: Vite + React, styled using custom modern CSS with glassmorphic cards, vibrant statuses, responsive grids, and detailed modals.
- **Backend**: Node.js + Express.js with a Sequelize ORM.
- **Database**: PostgreSQL (configured via `.env` variables) with an automatic SQLite fallback (`backend/unified-commerce-db.sqlite`) for seamless local development.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)

### 2. Set Up Active Workspace
Ensure that your editor is opened in `/unified-commerce-hub` or run the commands within that path.

### 3. Backend Setup
1. Open a terminal and navigate to `/backend`.
2. Copy `.env.example` to `.env` (this is automatically created for you with SQLite configurations).
3. If using PostgreSQL, fill out `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASS`. If left empty, the server will default to SQLite out of the box.
4. Run the development server:
   ```bash
   npm run start
   ```
   The backend server runs on `http://localhost:3001`.

### 4. Frontend Setup
1. Open a terminal and navigate to `/frontend`.
2. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend UI runs on `http://localhost:3000`.

## Features
- **Dashboard**: Channel API statuses, sales counts, and real-time synchronization log feeds.
- **Stok (Inventory)**: Master inventory levels, reserved stocks, available calculation, and manual adjustments that propagate to all active channels in parallel.
- **Siparişler (Orders)**: Real-time aggregated order import from webhooks, details breakdown, and automatic billing routing.
- **Faturalar (Invoices)**: Tracking page for approved e-invoices across EDM Fatura and Logo İşbaşı.
- **Kanallar (Channels)**: Configuration page to toggle integrations active/inactive and edit API credentials.
- **Sync Log**: Complete transactional logging history with JSON payload inspectors for debugging and loops tracking.
