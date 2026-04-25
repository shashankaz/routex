# 🍱 RouteX — MVP

A hyperlocal food ordering platform for gated communities where home chefs can sell daily meals, residents can order, and riders handle delivery.

---

## 🚀 Live Links

* 🌐 Demo: <your-deployed-link>
* 📂 GitHub: <your-repo-link>

---

## 🎯 Problem Overview

This project implements a **3-sided marketplace** inside a gated society:

* 👩‍🍳 **Chef** → creates and publishes dishes
* 🧑‍💼 **Resident** → browses and places orders
* 🛵 **Rider** → accepts and delivers orders

The goal was to build a **complete end-to-end system**, not just UI screens.

---

## 🧩 Core Features

### 👩‍🍳 Chef

* Create profile (name + society)
* Publish “Dish of the Day”
* AI-generated:

  * Calories
  * Health Score
* View and mark dishes as sold out

---

### 🧑‍💼 Resident

* View feed of dishes in same society
* See:

  * Image
  * Chef name
  * Price
  * Calories
  * Health score
* Place order

---

### 🛵 Rider

* Toggle availability
* Accept assigned order
* Update delivery status:

  * Picked Up
  * Delivered

---

## 🔄 End-to-End Flow

Chef → Creates Dish → AI Enrichment → Stored in DB
↓
Resident → Views Feed → Places Order
↓
System → Assigns Nearest Rider
↓
Rider → Accepts → Picks Up → Delivers

---

## 🧠 AI Nutrition Pipeline

Instead of relying blindly on external APIs, a **heuristic-based pipeline** is used:

### Step 1: Input

* Dish name (e.g., “Paneer Butter Masala”)

### Step 2: Keyword Extraction

* Detect keywords:

  * “fried” → high fat
  * “paneer” → protein-rich
  * “butter/cream” → high calories

### Step 3: Scoring Logic

* Calories adjusted based on ingredients
* Health score derived using rule-based weighting

### Example:

Paneer Butter Masala →

* protein (paneer)
* fat (butter)
  → Calories: ~420 kcal
  → Health Score: ~6.5 / 10

### Why this approach?

* Transparent and explainable
* No dependency on external APIs
* Easy to extend (image-based AI later)

---

## 🏗️ System Architecture

### Tech Stack

| Layer    | Choice     | Reason             |
| -------- | ---------- | ------------------ |
| Frontend | Next.js    | Fast dev + routing |
| Backend  | Express.js | Simple, flexible   |
| Database | PostgreSQL | Structured data    |
| ORM      | Prisma     | Type safety        |
| Auth     | JWT        | Lightweight        |
| AI       | Heuristic  | Explainable        |

---

### Backend Architecture

```
modules/
  auth/
  user/
  society/
  dish/
  ai/
  feed/
  order/
  rider/
  matching/
```

### Key Design Decisions

* **Modular architecture** → separation of concerns
* **Single User table with roles** → avoids duplication
* **Society-based isolation** → prevents cross-access
* **Matching as separate module** → clean system design

---

## 📦 Data Model Overview

* **User** → role-based (Chef, Resident, Rider)
* **Society** → grouping entity
* **Dish** → daily listing
* **Order** → connects user, dish, rider

---

## 🚚 Rider Matching Logic

When an order is placed:

1. Fetch all available riders in same society
2. Filter by availability
3. Compute distance (simple Euclidean)
4. Assign nearest rider within 2 km

### Why simple distance?

* Meets MVP requirement
* Avoids GPS complexity
* Easily replaceable with real geo queries

---

## ⚠️ Assumptions

* Single society per user
* One dish per order (simplified MVP)
* Static/dummy location for riders
* No payment integration

---

## ⚡ Trade-offs & Decisions

### What I prioritized

* End-to-end working system
* Clear module separation
* Explainable AI

### What I intentionally skipped

* Real-time tracking
* Payment gateway
* Complex geo queries

---

## 📈 What breaks at scale?

At ~500 concurrent users:

* Rider matching becomes inefficient (O(n) scan)
* No queueing for orders
* No concurrency control on inventory

### Future improvements:

* Geo-indexing (PostGIS)
* Redis for caching & queues
* Event-driven architecture

---

## ✨ Possible Enhancements

* Meal subscriptions
* Chef analytics dashboard
* AI image-based nutrition
* Push notifications
* Inventory auto-decrement

---

## 🎥 Video Walkthrough

<your-loom-link>

---
