# Falooda OS — Technical Handover Document
*(Frozen Snapshot: Phase 1 Completion - April 9, 2026)*

## 1. Project Overview
**Falooda OS** is an enterprise-grade Restaurant Operating System custom-built for Falooda & Co. It acts as both the customer-facing digital menu/ordering platform and the internal Kitchen Display System (KDS) + Point of Sale (POS) management dashboard.

## 2. Architecture & Technology Stack
*   **Frontend:** React (TypeScript) built with Vite and styled using pure CSS / Tailwind. 
*   **Backend:** Go (Golang) REST API providing high-performance routing and webhook management.
*   **Database & Realtime:** Google Firebase (Firestore for data storage, Firebase Auth).
*   **Concurrency:** WebSocket architecture (`socketService`) for instant order popping on the KDS.
*   **Infrastructure:** Google Cloud Platform (Cloud Run for backend compute, Firebase Hosting for frontend).
*   **CI/CD:** Automated GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) deploys the React app to Firebase on every `main` branch push.

---

## 3. Key Modules & Features Deployed
We have successfully built and locked down the core foundation of the application. The objective going forward is strict refinement of these existing systems.

### A. Ordering & KDS
*   **Dynamic POS Menu:** The POS tablet automatically imports and categorizes exactly what is defined in the frontend `constants.ts` `MENU_ITEMS` array.
*   **Order Streaming:** WebSockets push live tickets to the KDS with precise date/time stamps (e.g., `Apr 8, 10:19 PM`) and visual delays calculated for wait times.

### B. Security & Access (RBAC)
*   **Admin Lockdown:** The `/admin` dashboard is cryptographically locked behind Firebase Custom Claims. Only authenticated manager emails (`manager@faloodaandco.co.uk`) can view orders.
*   **Firestore Rules:** The database rules explicitly prevent unauthorized reads of orders or staff data unless the user token contains `isAdmin()`.

### C. Staff Management
*   **PIN Rota System:** Staff members use a 4-digit numeric PIN terminal on the POS to "Clock In".
*   **Data Model:** Shift tracking securely writes to the `shifts` Firebase collection for payroll extraction.

### D. CRM & Analytics Engine
*   **Zero-Latency Intelligence:** Instead of complex backend microservices, the frontend natively digests the live order streams to calculate daily revenue, popular items, lifetime customer value (£), and categorize customers into "Loyal Fans" and "At-Risk".

---

## 4. Setting up a New Developer Machine
If work is delegated to a new device or developer, they must complete these precise setup steps to avoid database blocking errors.

1.  **Clone the Repository:** Pull from GitHub `Tekrenewed/Falooda-Co`.
2.  **Google Cloud Authentication (ADC):** You cannot run the Go backend without administrative keys.
    *   Install the Google Cloud SDK.
    *   Run exactly: `gcloud auth application-default login`
    *   Target Project: `faloodaandco`
3.  **Local Frontend Start:**
    *   `cd frontend`
    *   `npm install`
    *   `npm run dev`
4.  **Local Backend Start:**
    *   `cd restaurant-os`
    *   `go run cmd/api/main.go`

> **Note on Adding New Admins:** 
> Do not try to manual-edit the database. You MUST use the local command line utility built in the backend:
> `cd restaurant-os/cmd/setadmin` 
> `go run main.go -email=new.staff@faloodaandco.co.uk`

---

## 5. Development Roadmap (Refinement Over Creation)
Before adding radically new features, our explicit mandate is to perfectly polish the existing architecture. 

**Immediate Refinement Priorities:**
1.  **Staff Payload Reporting:** Expand the Rota PIN module to export shift hours gracefully into an Excel/CSV format at the end of the week.
2.  **Legacy POS Webhook Integration:** Coordinate with the vendor of the physical Android POS to hit our open `/api/v1/orders` endpoint from their cloud, rendering physical iPad data inside Falooda OS directly.
3.  **Live Marketing Actions:** Ensure the CRM "Simulate Call" and "Quick Automation" buttons hook into active marketing sequences (e.g., automated WhatsApp nudges).
