# 🍱 RouteX — Society HomeChef Platform

## 📋 Table of Contents

- [🍱 RouteX — Society HomeChef Platform](#-routex--society-homechef-platform)
  - [📋 Table of Contents](#-table-of-contents)
  - [🎯 Overview](#-overview)
  - [🛠 Tech Stack](#-tech-stack)
    - [Server](#server)
    - [Client](#client)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Quick Start](#-quick-start)
    - [Prerequisites](#prerequisites)
    - [1. Clone \& install](#1-clone--install)
    - [2. Configure environment](#2-configure-environment)
    - [3. Run database migrations](#3-run-database-migrations)
    - [4. Start both servers](#4-start-both-servers)
  - [🔑 Environment Variables](#-environment-variables)
  - [📡 API Reference](#-api-reference)
    - [Auth — `/api/v1/auth`](#auth--apiv1auth)
    - [Users — `/api/v1/users`](#users--apiv1users)
    - [Societies — `/api/v1/societies`](#societies--apiv1societies)
    - [Dishes — `/api/v1/dishes`](#dishes--apiv1dishes)
    - [Feed — `/api/v1/feed`](#feed--apiv1feed)
    - [Orders — `/api/v1/orders`](#orders--apiv1orders)
    - [Rider — `/api/v1/rider`](#rider--apiv1rider)
  - [🗄 Data Model](#-data-model)
  - [🧠 AI Nutrition Pipeline](#-ai-nutrition-pipeline)
    - [How it works](#how-it-works)
    - [What Gemini analyses](#what-gemini-analyses)
    - [Output fields](#output-fields)
    - [Available tags](#available-tags)
    - [Reliability](#reliability)
  - [🔐 Auth Architecture](#-auth-architecture)
  - [🗺 Rider Matching Algorithm](#-rider-matching-algorithm)
  - [🔄 Order State Machine](#-order-state-machine)
  - [🛡 Role-Based Access](#-role-based-access)
  - [📈 Scalability Notes](#-scalability-notes)
  - [⚠️ Assumptions](#️-assumptions)

---

## 🎯 Overview

RouteX is a **3-sided marketplace** scoped to a single housing society. Every piece of data — users, dishes, orders — is isolated by `societyId`, so there is no cross-society data leakage.

| Role | Core capabilities |
|------|-------------------|
| 👨‍🍳 **Chef** | Create / update dishes with name, price, quantity, image URL, meal slot · Mark sold-out · Restock · View analytics dashboard |
| 🛒 **Resident** | Browse society feed with filters (Veg / High Protein / Low Calorie / Meal Slot) · See AI-generated nutrition info · Place orders · Cancel pending orders · Track order status |
| 🛵 **Rider** | Toggle availability · Accept assigned deliveries · Mark Picked Up · Mark Delivered |

---

## 🛠 Tech Stack

### Server
| Concern | Choice |
|---------|--------|
| Runtime | Node.js ≥ 18 (ESM) |
| Framework | Express.js v5 + TypeScript |
| ORM | Prisma v6 |
| Database | PostgreSQL |
| Auth | JWT (argon2id password hashing + PEPPER + cookie-based tokens) |
| AI | Google Gemini 2.0 Flash (multimodal — dish name + image) |
| Validation | Zod (env schema) |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Security | helmet, cors, express-rate-limit, cookie-parser |
| Dev | tsx watch, nodemon, morgan |

### Client
| Concern | Choice |
|---------|--------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| HTTP | Native `fetch` with typed wrapper |
| State | React Context (AuthContext) + local state |
| Compiler | babel-plugin-react-compiler |

---

## 📁 Project Structure

```
routex/
├── README.md
├── client/                          ← React + Vite frontend
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx                 # Entry point
│       ├── app.tsx                  # Role-based router (Chef / Resident / Rider)
│       ├── index.css
│       ├── api/
│       │   ├── client.ts            # Typed fetch wrapper (get/post/patch/delete)
│       │   └── endpoints.ts         # All API call functions grouped by domain
│       ├── components/              # Shared UI primitives
│       │   ├── Badge.tsx
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   ├── EmptyState.tsx
│       │   ├── Input.tsx
│       │   ├── Layout.tsx
│       │   └── Spinner.tsx
│       ├── contexts/
│       │   └── AuthContext.tsx      # login / logout / refresh / profile
│       ├── hooks/
│       │   └── useAsync.ts          # Generic async state hook
│       ├── modules/
│       │   ├── auth/
│       │   │   └── AuthPage.tsx     # Login + register (with role picker & society selector)
│       │   ├── chef/
│       │   │   ├── ChefDashboard.tsx
│       │   │   ├── CreateDishForm.tsx
│       │   │   └── DishCardChef.tsx
│       │   ├── resident/
│       │   │   ├── ResidentDashboard.tsx
│       │   │   ├── DishCardResident.tsx
│       │   │   └── OrderCard.tsx
│       │   └── rider/
│       │       ├── RiderDashboard.tsx
│       │       └── RiderOrderCard.tsx
│       └── types/
│           └── index.ts             # Shared TS interfaces (User, Dish, Order, etc.)
│
└── server/                          ← Express.js backend
    ├── .env
    ├── .env.example
    ├── express.d.ts                 # Augments req.user type
    ├── nodemon.json
    ├── prisma/
    │   ├── schema.prisma            # Data model
    │   └── migrations/
    └── src/
        ├── index.ts                 # App bootstrap, middleware, Swagger mount
        ├── config/
        │   ├── config.ts            # Zod env validation
        │   └── swagger.ts           # OpenAPI 3.0 spec + schema definitions
        ├── routes/
        │   └── v1/index.ts          # Mounts all module routers under /api/v1
        ├── modules/
        │   ├── ai/
        │   │   ├── ai.service.ts    # estimateNutrition() — Gemini multimodal call
        │   │   ├── ai.controller.ts
        │   │   └── ai.routes.ts
        │   ├── auth/
        │   │   ├── auth.service.ts  # register, login, refresh, logout, requireActiveUser
        │   │   ├── auth.controller.ts
        │   │   └── auth.routes.ts
        │   ├── dish/
        │   │   ├── dish.service.ts  # CRUD + analytics (calls estimateNutrition)
        │   │   ├── dish.controller.ts
        │   │   └── dish.routes.ts
        │   ├── feed/
        │   │   ├── feed.service.ts  # Filtered society feed query
        │   │   ├── feed.controller.ts
        │   │   └── feed.routes.ts
        │   ├── matching/
        │   │   ├── matching.service.ts  # Haversine nearest-rider assignment
        │   │   ├── matching.controller.ts
        │   │   └── matching.routes.ts
        │   ├── order/
        │   │   ├── order.service.ts # place (tx), cancel (tx), getMyOrders
        │   │   ├── order.controller.ts
        │   │   └── order.routes.ts
        │   ├── rider/
        │   │   ├── rider.service.ts # toggleAvailability, accept, updateStatus
        │   │   ├── rider.controller.ts
        │   │   └── rider.routes.ts
        │   ├── society/
        │   │   ├── society.service.ts
        │   │   ├── society.controller.ts
        │   │   └── society.routes.ts
        │   └── user/
        │       ├── user.service.ts
        │       ├── user.controller.ts
        │       └── user.routes.ts
        ├── middlewares/
        │   ├── require-authenticated-user.middleware.ts  # JWT cookie → req.user
        │   ├── role.middleware.ts                        # requireRole(...roles)
        │   ├── rate-limiter.middleware.ts                # createRateLimiter()
        │   └── validate.middleware.ts
        ├── shared/
        │   ├── api-response.ts      # sendSuccess / sendError helpers
        │   ├── app-error.ts         # AppError class with statusCode
        │   ├── async-handler.ts     # asyncHandler wrapper
        │   └── http-status-code.ts  # StatusCodes enum
        └── utils/
            ├── argon2.ts            # hashPassword / verifyPassword (argon2id + PEPPER)
            ├── db.ts                # Prisma client singleton
            ├── distance.ts          # Euclidean distance helper
            └── jwt.ts               # generate / verify access & refresh tokens
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- PostgreSQL running locally (or a remote connection string)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd routex

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Fill in the required values — see Environment Variables section below
```

### 3. Run database migrations

```bash
cd server
npx prisma migrate deploy

# Optionally: open Prisma Studio to inspect the database
npx prisma studio
```

### 4. Start both servers

```bash
# Terminal 1 — backend (http://localhost:4000)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client && npm run dev
```

| URL | What |
|-----|------|
| `http://localhost:5173` | React app |
| `http://localhost:4000/api/v1` | REST API |
| `http://localhost:4000/api-docs` | Swagger UI (interactive docs) |
| `http://localhost:4000/api-docs.json` | Raw OpenAPI JSON spec |

---

## 🔑 Environment Variables

Create `server/.env` from the provided `.env.example`:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/routex"

# JWT secrets — must each be at least 32 random characters
ACCESS_SECRET=your_access_secret_min_32_chars
REFRESH_SECRET=your_refresh_secret_min_32_chars

# Password hashing pepper — must be at least 32 random characters
PEPPER=your_pepper_min_32_chars

# Google Gemini API key (for AI nutrition estimation)
GEMINI_API_KEY=your_gemini_api_key_here
```

All variables are validated at startup via Zod — the server exits immediately with a descriptive error if any are missing or malformed.

---

## 📡 API Reference

All endpoints live under `/api/v1`. The full interactive documentation is available at **`http://localhost:4000/api-docs`** when the server is running.

### Auth — `/api/v1/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | ✗ | Create account (CHEF / RESIDENT / RIDER) |
| `POST` | `/login` | ✗ | Login — sets `__auth_at` + `__auth_rt` cookies |
| `POST` | `/refresh` | ✗ | Rotate tokens using `__auth_rt` cookie |
| `POST` | `/logout` | ✓ | Invalidate refresh token + clear cookies |
| `GET` | `/profile` | ✓ | Get profile from JWT context |

### Users — `/api/v1/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/me` | ✓ | Full profile from DB |
| `PATCH` | `/me` | ✓ | Update name |
| `PATCH` | `/me/location` | ✓ | Store GPS coordinates (`lat`, `lng`) |

### Societies — `/api/v1/societies`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | ✗ | List all societies |
| `GET` | `/:id` | ✗ | Get society by ID |
| `POST` | `/` | ✓ | Create a society |

### Dishes — `/api/v1/dishes`
| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/` | CHEF | Create dish — triggers Gemini AI nutrition analysis |
| `GET` | `/my` | CHEF | List own dishes |
| `GET` | `/analytics` | CHEF | Aggregate stats (orders, revenue, top dish) |
| `GET` | `/:id` | Any | Get dish by ID |
| `PATCH` | `/:id` | CHEF | Update dish — re-runs AI if name or image changes |
| `PATCH` | `/:id/sold-out` | CHEF | Mark dish as sold out |
| `PATCH` | `/:id/restock` | CHEF | Restock with new quantity |

### Feed — `/api/v1/feed`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | ✓ | Filtered society dish feed |

Query params: `veg=true`, `highProtein=true`, `lowCalorie=true`, `mealSlot=BREAKFAST\|LUNCH\|DINNER`

### Orders — `/api/v1/orders`
| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/` | RESIDENT | Place order — decrements stock, triggers rider matching |
| `GET` | `/my` | Any | Role-scoped order list (resident / chef / rider view) |
| `DELETE` | `/:id` | RESIDENT | Cancel PENDING or ASSIGNED order — restores stock + frees rider |

### Rider — `/api/v1/rider`
| Method | Path | Role | Description |
|--------|------|------|-------------|
| `PATCH` | `/availability` | RIDER | Toggle `isAvailable` flag |
| `GET` | `/orders` | RIDER | View assigned orders |
| `POST` | `/orders/:orderId/accept` | RIDER | Accept → sets status to `ACCEPTED`, marks rider unavailable |
| `PATCH` | `/orders/:orderId/status` | RIDER | Advance status: `PICKED_UP` or `DELIVERED` |

---

## 🗄 Data Model

```
Society ─────────────────────────────────────────────────────┐
  │ id, name, createdAt                                       │
  │                                                           │
  ├── User[]                                                  │
  │     id, name, email, password (argon2id), role            │
  │     societyId, isAvailable, lat?, lng?                    │
  │                                                           │
  ├── Dish[]  ←─── created by User(CHEF)                     │
  │     id, name, price, quantity, mediaUrl?                  │
  │     calories?, healthScore?, isVeg, tags[]                │
  │     isSoldOut, mealSlot, chefId, societyId                │
  │                                                           │
  └── Order[] ←─── Dish + User(RESIDENT) + User?(RIDER)      │
        id, status, dishId, customerId, riderId?, societyId   │
        createdAt, updatedAt                                   │
```

**Enums:**
- `Role`: `CHEF` | `RESIDENT` | `RIDER`
- `OrderStatus`: `PENDING` → `ASSIGNED` → `ACCEPTED` → `PICKED_UP` → `DELIVERED` | `CANCELLED`
- `MealSlot`: `BREAKFAST` | `LUNCH` | `DINNER` | `ANY`

---

## 🧠 AI Nutrition Pipeline

Every dish created or updated (when name or image changes) is automatically enriched with nutrition data by calling **Google Gemini 2.0 Flash** — a multimodal model that can analyse both text and images.

### How it works

```
Chef submits dish name + optional image URL
            │
            ▼
  fetchImageAsBase64(mediaUrl)  ← fetches image, converts to base64
            │
            ▼
  Build Gemini request:
    parts = [inline_data (image), text (prompt)]
            │
            ▼
  POST gemini-2.0-flash-latest:generateContent
  (responseMimeType: "application/json", temperature: 0.2)
            │
            ▼
  Parse & validate JSON response:
    { calories, healthScore, isVeg, tags }
            │
            ▼
  Store alongside dish in PostgreSQL
```

### What Gemini analyses

The prompt instructs the model to account for **all** ingredients in a dish — not just the primary ingredient in the name:

- Base carbohydrates (rice, roti, bread, pasta)
- Proteins (meat, paneer, dal, eggs)
- Cooking medium (oil, ghee, butter, cream)
- Gravy base (onion, tomato, spices)
- Garnishes and toppings

Example: `"Chicken Biryani"` → Gemini considers basmati rice + chicken + ghee + whole spices + fried onions + yoghurt marinade → accurate calorie estimate for one full serving.

### Output fields

| Field | Type | Description |
|-------|------|-------------|
| `calories` | `integer` | Total kcal for one standard serving |
| `healthScore` | `number` | 1–10 scale (10 = most healthy) |
| `isVeg` | `boolean` | Whether the dish is vegetarian |
| `tags` | `string[]` | Subset of allowed tags (see below) |

### Available tags

`Veg` · `Non-Veg` · `High Protein` · `Low Calorie` · `Keto` · `Healthy` · `High Carb` · `Spicy` · `Indulgent`

### Reliability

- **Image included** → Gemini sees the actual dish, identifies visible ingredients and cooking method
- **No image** → Gemini uses culinary knowledge from the dish name alone
- **Gemini unreachable / parse error** → deterministic keyword fallback kicks in (never hard-fails)
- Timeout: 20 seconds per call; image fetch timeout: 8 seconds

---

## 🔐 Auth Architecture

Token-based auth using two short-lived HTTP-only cookies:

| Cookie | Lifetime | Purpose |
|--------|----------|---------|
| `__auth_at` | 15 minutes | Access token — sent with every authenticated request |
| `__auth_rt` | 7 days | Refresh token — only used to rotate tokens at `/auth/refresh` |

**Password storage:** argon2id + server-side PEPPER. The PEPPER is mixed in at hash time and never stored in the database, so a full DB dump alone is insufficient to crack passwords.

**Token flow:**
```
Login → __auth_at (15m) + __auth_rt (7d) set as cookies
      ↓
Authenticated requests read __auth_at → verify JWT → attach req.user
      ↓
Access token expires → client calls POST /auth/refresh
      → __auth_rt validated → new __auth_at + new __auth_rt issued (rotation)
      ↓
Logout → refresh token invalidated in DB + both cookies cleared
```

---

## 🗺 Rider Matching Algorithm

When an order is placed the system immediately tries to find the nearest available rider in the same society:

```typescript
// 1. Query all available riders in the same societyId
const riders = await prisma.user.findMany({
  where: { role: "RIDER", isAvailable: true, societyId }
});

// 2. If customer has GPS coordinates, find nearest within 2 km
for (const rider of riders) {
  const distance = calculateDistance(customerLat, customerLng, rider.lat, rider.lng);
  if (distance < minDistance && distance <= MAX_RIDER_DISTANCE_KM) {
    nearestRider = rider;
  }
}

// 3. Fallback: if no rider within 2 km, assign first available rider in society
// 4. If no riders at all, order stays PENDING until one becomes available
```

Distance is calculated using a simple Euclidean formula on degree coordinates (suitable for intra-society distances of < 2 km). A PostGIS `ST_DWithin` with a spatial index would be the production upgrade.

---

## 🔄 Order State Machine

```
                    ┌─────────┐
       order placed │ PENDING │ ──── rider found ────────────────┐
                    └─────────┘                                   │
                         │ cancelled by resident                  ▼
                         ▼                                  ┌──────────┐
                   ┌───────────┐     rider accepts          │ ASSIGNED │
                   │ CANCELLED │ ◄── (PENDING/ASSIGNED)     └──────────┘
                   └───────────┘                                  │
                                                           rider.accept()
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │   ACCEPTED   │
                                                          └──────────────┘
                                                                  │
                                                        rider marks picked up
                                                                  │
                                                                  ▼
                                                          ┌───────────────┐
                                                          │   PICKED_UP   │
                                                          └───────────────┘
                                                                  │
                                                        rider marks delivered
                                                                  │
                                                                  ▼
                                                          ┌───────────────┐
                                                          │   DELIVERED   │
                                                          └───────────────┘
```

Side effects:
- **ASSIGNED** → rider's `isAvailable` stays true until they explicitly accept
- **ACCEPTED** → rider's `isAvailable` set to `false` (they're on a job)
- **DELIVERED** → rider's `isAvailable` reset to `true`
- **CANCELLED** (from PENDING/ASSIGNED) → dish quantity restored + 1, rider freed if assigned

---

## 🛡 Role-Based Access

Every protected route uses two stacked middlewares:

```
requireAuthenticatedUser   →   requireRole("CHEF" | "RESIDENT" | "RIDER")
```

`requireAuthenticatedUser` reads the `__auth_at` cookie, verifies the JWT, fetches the user from DB, and attaches it to `req.user`. `requireRole` then checks `req.user.role` against the allowed roles for that route.

Rate limiting is applied to all auth endpoints (10 requests per 15-minute window per IP).

---

## 📈 Scalability Notes

At ~500 concurrent users, these are the likely bottlenecks in order of impact:

| Bottleneck | Current | Fix |
|------------|---------|-----|
| Rider matching | O(n) scan per order | PostGIS `ST_DWithin` with spatial index |
| Inventory contention | Prisma transaction | `SELECT FOR UPDATE` or Redis atomic decrement |
| Feed queries | No caching | Redis with 30–60 s TTL, cache bust on dish update |
| Order status updates | Client polls | WebSocket / SSE for real-time push |
| DB connections | Prisma default pool | PgBouncer connection pooler |
| Gemini latency | ~1–3 s per dish create | Background job queue (BullMQ) — create dish instantly, enrich async |

---

## ⚠️ Assumptions

- **One society per user** — users don't switch societies after registration.
- **One dish per order** — MVP simplification; a cart system would require an `OrderItems` join table.
- **Image upload** — chefs provide a publicly accessible URL (e.g. Imgur, Cloudinary direct link). A production build would add Cloudinary / S3 direct upload using the same `mediaUrl` column.
- **Rider GPS** — coordinates are stored manually (via `PATCH /users/me/location`) rather than via live device GPS. This is sufficient for the matching algorithm and is explicitly allowed by the spec.
- **Payment** — assumed cash on delivery; no payment gateway is integrated.
- **No rider within range** — if no rider is within 2 km, the system falls back to the first available rider in the society. If no riders are available at all, the order stays `PENDING`.
- **Gemini API availability** — if the Gemini API is unreachable or returns an error, a deterministic keyword-based fallback is used so dish creation always succeeds.
