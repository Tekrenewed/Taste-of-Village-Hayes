# Falooda & Co — Product Roadmap & Architecture Vision

> This document defines the long-term product strategy. All future development
> sessions must reference this to ensure architectural decisions align with the
> multi-platform, multi-branch vision.

---

## 🏗️ Platform Overview

Falooda & Co is evolving from a single-location dessert shop website into a
**full restaurant technology ecosystem** spanning 4 distinct applications:

### 1. Public Website (LIVE ✅)
- **Stack:** React (Vite) + Firebase Hosting + Firestore
- **URL:** `https://faloodaandco.co.uk`
- **Purpose:** Customer-facing menu, booking, promotions, brand presence
- **Status:** Production — deployed via Firebase Hosting

### 2. POS System (Backend Restored ✅ — Frontend needs integration)
- **Stack:** Express + Prisma (PostgreSQL) + Mongoose (MongoDB) + Socket.io
- **Purpose:** In-store operations — orders, payments (Stripe), kitchen display (KDS), staff management, CRM, analytics, reporting
- **Key Files:** `backend/routes/`, `backend/prisma/`, `frontend/pages/AdminPOS.tsx`
- **Deployment:** Docker Compose (local) or GCP Cloud Run (cloud)
- **Status:** Code merged back in, needs wiring up for multi-branch

### 3. Driver / Delivery App (PLANNED 🔜)
- **Target:** Mobile app (React Native or Flutter)
- **Purpose:** Delivery drivers receive orders, navigate to customers, update delivery status in real-time
- **Key Features:**
  - Real-time order assignment via Socket.io / push notifications
  - GPS tracking & route optimization
  - Proof of delivery (photo/signature)
  - Driver earnings dashboard
  - Integration with the POS delivery-hub routes (`backend/routes/delivery-hub.js`)

### 4. Customer Mobile Ordering App (PLANNED 🔜)
- **Target:** Mobile app (React Native or Flutter) + potential PWA
- **Purpose:** Customers browse menu, place orders for delivery/pickup, track orders live, earn loyalty points
- **Key Features:**
  - Menu browsing with real-time availability
  - Cart & checkout (Stripe payments)
  - Order tracking (real-time status via Socket.io)
  - Push notifications (order updates)
  - Loyalty / rewards program
  - Multi-branch: select nearest location
  - Reorder history

---

## 🏢 Multi-Branch Architecture

The system must support **multiple Falooda & Co locations** from day one of the next phase:

### Database Design (Already Scaffolded)
- `prisma/schema.prisma` already has a **multi-tenant** schema
- Each branch = a `Tenant` with its own:
  - Menu (items, prices, availability can vary per branch)
  - Staff roster
  - Order queue
  - Analytics & reporting
  - Delivery zones

### Branch Management Features Needed
- Central admin dashboard to manage all branches
- Per-branch menu customization (some items may be branch-specific)
- Per-branch staff management
- Cross-branch analytics & consolidated reporting
- Branch-specific delivery zones & driver assignment
- Inventory tracking per branch

---

## 🔧 Shared Backend API Strategy

All 4 platforms (website, POS, driver app, customer app) should consume the
**same backend API**. Key principles:

1. **Single API server** — one Express backend serving all clients
2. **Role-based access control (RBAC):**
   - `customer` → menu, orders, bookings, tracking
   - `staff` → POS operations, order management
   - `driver` → delivery assignments, status updates
   - `admin` → full access, multi-branch management
   - `superadmin` → cross-tenant/platform administration
3. **Real-time layer** — Socket.io namespaces per role:
   - `/kitchen` — KDS live order feed
   - `/delivery` — driver tracking & order assignment
   - `/customer` — order status updates
4. **API versioning** — `/api/v1/` prefix for future-proofing

---

## 📱 Mobile App Technology Decision (TBD)

Options to evaluate when development begins:
| Option | Pros | Cons |
|---|---|---|
| **React Native** | Share logic with React web, large ecosystem | Performance overhead for maps/GPS |
| **Flutter** | Excellent performance, beautiful UI, single codebase | Different language (Dart), no code sharing with web |
| **PWA** | No app store, instant updates, works offline | Limited native API access, no push on iOS (improving) |

> **Recommendation:** React Native for maximum code sharing with the existing React web frontend, with Expo for rapid development.

---

## 🗓️ Phased Delivery Suggestion

| Phase | Focus | Dependencies |
|---|---|---|
| **Phase 1** (Current) | Public website launch + soft opening | ✅ DONE |
| **Phase 2** | POS system activation for in-store use | Docker setup, staff training |
| **Phase 3** | Multi-branch backend refactoring | Database migration, RBAC system |
| **Phase 4** | Customer mobile ordering app | Phase 3 API, Stripe checkout |
| **Phase 5** | Driver/delivery app | Phase 3 API, GPS integration |
| **Phase 6** | Consolidated admin dashboard | All phases complete |

---

## 📁 Current Workspace Structure (Post-Merge)

```
Faloodaandco/
├── frontend/           # React (Vite) — public website + admin
│   ├── components/     # Navbar, BookingPortal
│   ├── pages/          # Home, Menu, Book, Builder, GoldenTicket, Admin, AdminPOS
│   ├── services/       # Firebase services (auth, menu, booking, orders)
│   ├── context/        # StoreContext (state management)
│   └── lib/            # Socket.io client
├── backend/            # Express API server
│   ├── routes/         # 11 API modules (orders, payments, CRM, delivery, etc.)
│   ├── lib/            # DB connections (Prisma, Mongo, Socket.io)
│   ├── models/         # MongoDB schemas
│   ├── prisma/         # PostgreSQL schema + seed
│   └── server.js       # Main server (Vertex AI proxy)
├── brain/              # AI knowledge base
├── RAG/                # Raw source documents (PDF menu, images)
├── data/               # Docker volume data (Mongo + Postgres)
├── Dockerfile          # Multi-stage production build
├── docker-compose.yml  # Full stack orchestration
├── firebase.json       # Firebase Hosting config
└── .github/workflows/  # CI/CD pipeline
```
