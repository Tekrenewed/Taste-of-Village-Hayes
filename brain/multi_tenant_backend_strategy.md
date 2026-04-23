# Multi-Tenant Backend Strategy (Go + Postgres + Firestore)

## Overview
Falooda OS uses a **Logical Multi-Tenant** architecture. A single Go backend (`restaurant-os`) serves multiple restaurants using the same code and database. The backend lives in its own repository: [`Tekrenewed/Restaurant-OS-Go`](https://github.com/Tekrenewed/Restaurant-OS-Go).

## Architecture Highlights
- **Single Source of Truth**: PostgreSQL handles financial records, CRM, and permanent order history.
- **REST Polling Architecture (New in Phase 2)**: POS, Waiter Pad, and KDS synchronization now happens via stateless REST polling (5-second intervals) to the Go backend, drastically reducing cloud dependencies and Firestore costs.
- **Stateless Print Bridge**: A local daemon (`epson-print-bridge`) pulls pending print jobs (`needs_printing = true`) via REST from the Go backend, completely bypassing locked printer credentials and local network blocks on iPads.
- **Shared Database + RLS**: One PostgreSQL database, all tenants share tables. Row-Level Security (RLS) is enforced at the database level via `app.current_store_id` session variable. Even if Go code forgets `WHERE store_id = ?`, PostgreSQL silently filters. See migration `005_row_level_security.sql`.
- **Future Separation Path**: Can migrate to separate databases in future if needed by simply creating new DBs and disabling RLS. No code changes required — just update connection strings.

## Tenant Isolation
| Layer | Mechanism |
|---|---|
| **PostgreSQL** | Every tenant-scoped table has `store_id` (UUID). RLS policies + `FORCE ROW LEVEL SECURITY` ensure isolation even for superuser connections. |
| **Firestore (Legacy/Secondary)** | Previously the primary real-time layer, now functioning as a secondary sync mechanism for backwards compatibility during the REST transition. Requests route to specific Firebase projects based on `TENANT_CONFIGS` env var. |
| **API Security** | JWT tokens are verified against all registered tenant Auth clients (`VerifyTokenAndResolveTenant`). Public requests use `X-Store-ID` header. |

## Registered Tenants

| Brand | `store_id` (UUID) | GCP Project | Status |
|---|---|---|---|
| Falooda & Co | `f4100da2-1111-1111-1111-000000000001` | `faloodaandco` | ✅ Production |
| Azmos Peri Peri | `a2200da2-2222-2222-2222-000000000002` | `hotdrop-482712` | 🔧 Integrating |
| Taste of Village Hayes | `tov00da2-4444-4444-4444-000000000004` | `hootsnkeks-36451` | 🔧 Integrating |
| Yum Sing | `yum00da2-5555-5555-5555-000000000005` | `yumsing` | 🔧 Integrating |
| Taste of Village Slough | TBD | TBD (future GCP project) | ⏳ Planned |

## Deployment Configuration
- **Environment Variable**: `TENANT_CONFIGS`
- **Format**: `projectID|credFile|storeID|displayName` (semicolon-separated for multiple)
- **Current Value**:
  ```
  TENANT_CONFIGS=faloodaandco|falooda-key.json|f4100da2-1111-1111-1111-000000000001|Falooda & Co
  ```
- **When all tenants are configured**:
  ```
  TENANT_CONFIGS=faloodaandco|falooda-key.json|f4100da2-1111-1111-1111-000000000001|Falooda & Co;hotdrop-482712|azmos-key.json|a2200da2-2222-2222-2222-000000000002|Azmos Peri Peri;hootsnkeks-36451|tov-key.json|tov00da2-4444-4444-4444-000000000004|TOV Hayes;yumsing|yumsing-key.json|yum00da2-5555-5555-5555-000000000005|Yum Sing
  ```

## Repository Structure
```
Desktop/
├── Restaurant-OS-Go/          ← Go backend (Tekrenewed/Restaurant-OS-Go)
├── Faloodaandco/              ← Falooda frontend (Tekrenewed/Falooda-Co)
├── azmos-peri-peri/           ← Azmos frontend (Tekrenewed/azmos-peri-peri)
├── Taste-of-Village-Hayes/    ← TOV Hayes (Tekrenewed/Taste-of-Village-OS)
├── Taste-of-Village-Slough/   ← TOV Slough (Tekrenewed/Taste-of-Village-Slough)
├── Yum-Sing/                  ← Yumsing (Tekrenewed/Yum-Sing)
├── Pathaans/                  ← Archive
├── Hotdrop/                   ← Archive
└── Falooda-Group.code-workspace
```

## CORS Whitelist (main.go)
All brand domains are registered in `allowedOrigins`:
- `faloodaandco.co.uk`, `faloodaandco.web.app`
- `azmos-peri-peri.vercel.app`, `azomsgrill.co.uk`
- `hootsnkeks-36451.web.app`, `tasteofvillagehayes.co.uk`
- `tasteofvillageslough.web.app`
- `yumsing.web.app`
- `localhost:5173-5176`, `localhost:3000`

## Future-Proofing
- Adding a new restaurant = update `TENANT_CONFIGS` env var + add Firebase service account key + add domain to CORS whitelist.
- The architecture supports 100+ restaurants on the same database with zero performance degradation.
- Separate databases can be created per tenant in future if regulatory/contractual requirements demand it.

## Notes
- **Hotdrop repos** (`Tekrenewed/Hot-Drop`, `Tekrenewed/HotDrop`, `Tekrenewed/Pathaans-Restaurant`) returned 404 — likely private or deleted. Local archive folders exist at `Desktop/Hotdrop/` and `Desktop/Pathaans/` (both currently empty).
- **TOV Slough** will get its own GCP project in future. Do NOT forget to assign it when created.
