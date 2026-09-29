# NutriPlan – Personalized Diet Planner

**NutriPlan: Full-Stack Personalized Diet & Nutrition Management System** — a MERN application (MongoDB, Express, React, Node.js) that turns a user's profile into a daily calorie target and a personalised meal plan, then helps them track meals and weight over time.

> ⚠️ NutriPlan is for general wellness and planning only. It is **not** a substitute for professional medical or dietary advice.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [REST API Documentation](#rest-api-documentation)
- [Authentication Flow](#authentication-flow)
- [React Context API Implementation](#react-context-api-implementation)
- [State Management](#state-management)
- [Data Fetching](#data-fetching)
- [Node.js Implementation](#nodejs-implementation)
- [Express.js Implementation](#expressjs-implementation)
- [MongoDB Integration](#mongodb-integration)
- [React + Express Integration](#react--express-integration)
- [BMI & Calorie Calculation](#bmi--calorie-calculation)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [API Endpoints (quick reference)](#api-endpoints)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Academic Experiments Demonstrated](#academic-experiments-demonstrated)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)
- [Author](#author)

---

## Overview

Users sign up, complete a three-step onboarding (body measurements → activity & goal → dietary preference & allergies), and immediately get:

- their **BMI**, **BMR**, **TDEE** and a **goal-adjusted daily calorie target** with macro targets,
- a **generated meal plan** for the day (breakfast, lunch, snacks, dinner) built from a 50+ meal catalog that matches their diet and excludes their allergens,
- a **dashboard** showing calories consumed vs. remaining, macros, a 7-day chart and a weight trend.

They can edit the plan (add/remove meals, change servings, tick meals as eaten), manage their own custom meals, and log weigh-ins. Admins manage the shared meal catalog, users and view application statistics.

## Features

| Area | What it does |
| --- | --- |
| **Authentication** | Register, login, logout, JWT sessions, bcrypt-hashed passwords, rate-limited auth endpoints, show/hide password, password-strength meter |
| **Onboarding** | 3-step wizard with live BMI / calorie preview |
| **Dashboard** | Weight, BMI, daily goal, consumed/remaining calories, today's meals with "mark as eaten", calorie ring, macro bars, 7-day planned-vs-eaten chart, weight trend |
| **Diet Planner** | Date navigation, one-click plan generation, add meals from a searchable picker, change servings, mark eaten, remove, clear day; daily totals, macro donut chart |
| **Meals** | Search, filter by category / diet, "fits my diet & allergies" toggle, sort by calories/protein/name, pagination, add / edit / delete (custom meals for users, catalog meals for admins) |
| **Progress** | Log weight + calories + notes, "use plan total" prefill, weight chart with target line, history table, edit/delete; latest weigh-in syncs to profile |
| **Profile** | Edit all health details (recalculates targets), change display name, view server-calculated metrics |
| **BMI & Calorie Calculator** | Public tool + in-app "what-if" version |
| **Admin Panel** | User/meal/plan/progress counts, meals-by-category chart, users-by-diet breakdown, user search, promote/demote, delete user (cascades their data) |
| **UX** | Responsive (desktop → mobile), toast notifications, loading / empty / error states, confirmation dialogs, 404 page, code-split routes |

## Design System

Warm, food-inspired palette defined once as CSS tokens in `frontend/src/styles/base.css` (and mirrored for charts in `frontend/src/utils/theme.js`).

| Role | Colour | Used for |
| --- | --- | --- |
| Primary — Coral | `#FF6B4A` | Primary buttons, CTAs, active nav, calorie ring, logo |
| Secondary — Warm Yellow | `#FFC857` | Calorie/nutrition highlights, carbs, badges |
| Accent — Berry Purple | `#8B5CF6` | Secondary buttons, charts, BMI, fat, dinner |
| Accent 2 — Fresh Pink | `#F472B6` | Protein, snacks, small highlights |
| Support — Blue | `#3B8CF6` | Info states, hydration-style metrics |
| Background / Surface | `#FFF9F3` / `#FFFFFF` | Page / cards, forms, modals |
| Text / Secondary text | `#252525` / `#6B7280` | Headings & body / descriptions |

Meal slots: breakfast = yellow-orange, lunch = coral, snacks = pink, dinner = purple. Dashboard cards use tinted icon chips (`#FFF0EC`, `#F3EEFF`, `#FFF8DD`, `#FDF0F7`, `#EEF7FF`) plus a thin coloured top accent. Success states use teal; validation errors stay standard red.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | **Node.js** (ES modules) |
| API | **Express 5**, express-validator, helmet, cors, morgan, express-rate-limit |
| Database | **MongoDB** with **Mongoose** ODM (local or MongoDB Atlas) |
| Auth | **JSON Web Tokens** (jsonwebtoken), **bcryptjs** |
| Frontend | **React 19**, **React Router 7**, **Context API**, `useReducer` / `useState` / custom hooks |
| Data fetching | **Axios** (shared instance + interceptors) |
| Charts / icons | Recharts, lucide-react |
| Build | Vite |
| Testing | Node's built-in test runner + Supertest (24 API integration tests) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## System Architecture

```
┌──────────────────────────── Browser (React SPA on Vercel) ───────────────────────────┐
│  Pages  →  Context (Auth / User / Diet / Toast)  →  services/*.js  →  Axios instance  │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │  HTTPS  ·  JSON  ·  Authorization: Bearer <JWT>
┌──────────────────────────── Express API on Node.js (Render) ─────────────────────────┐
│  helmet → cors → express.json → routes → validate() → protect() → authorize()        │
│        → controllers → services (health, diet-plan, meal, profile) → Mongoose models  │
│  global errorHandler → { success:false, message, details }                            │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │  Mongoose
                                ┌──────────▼──────────┐
                                │   MongoDB Atlas     │
                                └─────────────────────┘
```

## Project Structure

```
nutriplan/
├── backend/
│   ├── config/            env.js (validated config), db.js (Mongoose connection)
│   ├── controllers/       auth, profile, meal, dietPlan, progress, dashboard, user
│   ├── data/              meals.js — 53-meal starter catalog
│   ├── middleware/        auth.js (protect/authorize), validate.js, error.js, rateLimiter.js
│   ├── models/            User, Profile, Meal, DietPlan, Progress
│   ├── routes/            one router per resource + index.js
│   ├── scripts/           seed.js
│   ├── services/          healthService, dietPlanService, mealService, profileService, tokenService
│   ├── tests/             api.test.js (integration tests)
│   ├── utils/             AppError, constants, date, helpers
│   ├── validators/        express-validator rule sets
│   ├── app.js             builds the Express app (importable by tests)
│   ├── server.js          connects to MongoDB, starts HTTP server, graceful shutdown
│   └── .env.example
├── frontend/
│   ├── public/            favicon.svg
│   ├── src/
│   │   ├── components/    Navbar, Sidebar, DashboardCard, MealCard, DietPlanCard, ProgressChart,
│   │   │                  WeeklyChart, ProfileForm, BMIIndicator, CalorieCard, MacroBreakdown,
│   │   │                  ProtectedRoute, LoadingSpinner, ErrorMessage, EmptyState, Modal,
│   │   │                  ConfirmDialog, Toast, MealForm, MealPickerModal, FormField, PasswordInput …
│   │   ├── context/       AuthContext, UserContext, DietContext, ToastContext
│   │   ├── hooks/         useAuth, useUser, useDiet, useToast, useFetch, useDebounce, useDocumentTitle
│   │   ├── layouts/       PublicLayout, AppLayout, AuthLayout
│   │   ├── pages/         Landing, Login, Register, Onboarding, Dashboard, DietPlanner, Meals,
│   │   │                  Progress, Profile, Calculator, NotFound, admin/AdminDashboard
│   │   ├── services/      api.js, authService, profileService, mealService, dietService,
│   │   │                  progressService, dashboardService, adminService
│   │   ├── styles/        base.css (tokens), components.css, layout.css, pages.css
│   │   ├── utils/         constants, date, format, health, validation
│   │   ├── App.jsx        routes
│   │   └── main.jsx       provider tree
│   ├── vercel.json        SPA rewrites
│   └── .env.example
├── render.yaml            Render blueprint for the API
├── package.json           root scripts (dev, seed, test, build)
└── README.md
```

## Database Schema

```
┌──────────────┐ 1      1 ┌────────────────┐
│    User      │──────────│    Profile     │
│──────────────│          │────────────────│
│ name         │          │ user (ref, uq) │
│ email (uq)   │          │ age, gender    │
│ password*    │          │ height, weight │
│ role         │          │ targetWeight   │
│ timestamps   │          │ activityLevel  │
└──────┬───────┘          │ goal           │
       │                  │ dietaryPref.   │
       │ 1                │ allergies[]    │
       │                  │ bmi, bmr, tdee │   (derived, recalculated on save)
       │                  │ calorieTarget  │
       │                  │ macroTargets   │
       │                  └────────────────┘
       │ 1      * ┌────────────────────────┐ *      1 ┌──────────────────┐
       ├──────────│       DietPlan         │──────────│      Meal        │
       │          │────────────────────────│  (via    │──────────────────│
       │          │ user (ref)             │  entries)│ name, category   │
       │          │ date                   │          │ calories         │
       │          │ breakfast[] ┐          │          │ protein, carbs,  │
       │          │ lunch[]     │ entry:   │          │ fats             │
       │          │ snacks[]    │ {meal ref│          │ ingredients[]    │
       │          │ dinner[]    ┘ servings,│          │ dietaryType      │
       │          │               consumed}│          │ allergens[]      │
       │          │ totalCalories, totals… │          │ isCustom         │
       │          │ consumedCalories       │          │ createdBy (ref)  │
       │          └────────────────────────┘          └──────────────────┘
       │ 1      * ┌────────────────────────┐
       └──────────│       Progress         │
                  │ user, date, weight,    │
                  │ caloriesConsumed, notes│
                  └────────────────────────┘
```

`password*` has `select: false` and is removed in `toJSON`, so it never leaves the server.

**Indexes**

| Collection | Index | Why |
| --- | --- | --- |
| users | `email` unique | login lookup, no duplicate accounts |
| profiles | `user` unique | enforce one profile per user |
| meals | `{category, dietaryType}`, `{isCustom, createdBy}`, text on `name, ingredients` | filter & visibility queries |
| dietplans | `{user, date}` unique | one plan per user per day; main lookup |
| progresses | `{user, date}` unique | one check-in per day; chart ordering |

All schemas use `timestamps: true` and field-level validation (required, enums, min/max).

## REST API Documentation

**Base URL:** `http://localhost:5000/api` (local) · `https://<your-api>.onrender.com/api` (production)

**Response envelope**

```json
// success
{ "success": true, "message": "Optional message", "data": { ... } }
// error
{ "success": false, "message": "Human-readable error", "details": [{ "field": "age", "message": "Age must be between 13 and 100" }] }
```

**Authentication:** send `Authorization: Bearer <token>` on every route marked 🔒. 🛡️ = admin only.

**Status codes used:** `200` OK · `201` Created · `400` bad input (e.g. invalid date) · `401` not logged in / bad token / wrong password · `403` not allowed (role or ownership) · `404` not found · `409` conflict (duplicate email, plan or check-in for a date) · `422` validation failed · `429` too many auth attempts · `500` server error.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| POST | `/register` | – | `{ name, email, password }` | Create account (role is always `user`). Returns `{ token, user, hasProfile }` · **201** |
| POST | `/login` | – | `{ email, password }` | Returns `{ token, user, hasProfile }` · **401** on bad credentials |
| GET | `/me` | 🔒 | – | Current user + `hasProfile` (used to restore the session) |
| POST | `/logout` | 🔒 | – | Stateless — client discards its token |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| PATCH | `/me` | 🔒 | Update own display name `{ name }` |
| GET | `/?search=` | 🛡️ | List users with a profile summary |
| PATCH | `/:id/role` | 🛡️ | `{ role: "user" \| "admin" }` (cannot change own role) |
| DELETE | `/:id` | 🛡️ | Delete user + profile, plans, progress, custom meals |

### Profile — `/api/profile`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | 🔒 | Own profile with derived metrics · **404** before onboarding |
| PUT | `/` | 🔒 | Create (**201**) or update (**200**) profile. Body: `age, gender, height, weight, targetWeight?, activityLevel, goal, dietaryPreference, allergies[]` |

Example response (`data.profile`):

```json
{ "age": 25, "gender": "female", "height": 165, "weight": 60, "activityLevel": "moderate", "goal": "weight_loss",
  "dietaryPreference": "vegetarian", "allergies": ["peanuts"],
  "bmi": 22, "bmiCategory": "Normal", "bmr": 1345, "tdee": 2085, "calorieTarget": 1590,
  "macroTargets": { "protein": 99, "carbohydrates": 199, "fats": 44 } }
```

### Meals — `/api/meals`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | 🔒 | Query: `search, category, dietaryType, sort (name\|calories_asc\|calories_desc\|protein_desc\|newest), scope (all\|catalog\|custom), compatible=true, page, limit`. Returns `{ meals, pagination }` |
| GET | `/:id` | 🔒 | One meal (catalog or own custom) |
| POST | `/` | 🔒 | Create meal — admins add to the **catalog**, users create a private **custom** meal |
| PUT | `/:id` | 🔒 | Update — owner of a custom meal, or admin (**403** otherwise) |
| DELETE | `/:id` | 🔒 | Delete — same rule; also removes the meal from any plans |

Meal body: `name, category (breakfast|lunch|snacks|dinner), calories, protein, carbohydrates, fats, dietaryType (vegan|vegetarian|eggetarian|non_vegetarian), ingredients[], allergens[], servingSize, description`.

### Diet plans — `/api/diet-plans`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/?from=&to=` | 🔒 | Plan summaries (default: last 30 days) |
| GET | `/date/:date` | 🔒 | Full plan for `YYYY-MM-DD` (meals populated) or `null` |
| GET | `/:id` | 🔒 | Full plan by id |
| POST | `/` | 🔒 | Create a manual plan `{ date, breakfast?: [{meal, servings}], lunch?, snacks?, dinner?, notes? }` · **409** if one exists |
| POST | `/generate` | 🔒 | `{ date }` — generate (or regenerate) a personalised plan from the profile |
| PUT | `/:id` | 🔒 | Replace slots / notes |
| DELETE | `/:id` | 🔒 | Delete the plan |
| POST | `/:id/entries` | 🔒 | Add a meal `{ slot, meal, servings }` · **201** |
| PATCH | `/:id/entries/:entryId` | 🔒 | Update `{ servings?, consumed?, slot? }` (mark eaten, change portion, move slot) |
| DELETE | `/:id/entries/:entryId` | 🔒 | Remove a meal from the plan |

Every mutation re-populates meals and recalculates `totalCalories`, `totalProtein`, `totalCarbohydrates`, `totalFats` and `consumedCalories`. Plans are always looked up by `{ _id, user }`, so another user's plan returns **404**.

### Progress — `/api/progress`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/?from=&to=` | 🔒 | Own entries, oldest first |
| POST | `/` | 🔒 | `{ date, weight, caloriesConsumed?, notes? }` · **409** if the date already has an entry |
| PUT | `/:id` | 🔒 | Update weight / calories / notes |
| DELETE | `/:id` | 🔒 | Delete entry |

Create/update/delete return the updated `profile` too: the most recent weigh-in becomes the profile weight, so BMI and calorie targets stay current.

### Dashboard — `/api/dashboard`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/?date=` | 🔒 | Profile, calorie summary `{target, planned, consumed, remaining}`, today's plan, progress summary, 7-day series |
| GET | `/admin` | 🛡️ | Totals, meals by category, users by diet, recent users |

### Health — `GET /api/health`

Returns API status, environment and database connection state (used by Render's health check).

## Authentication Flow

```
Register / Login form
   │  POST /api/auth/login { email, password }
   ▼
authController.login ── User.findOne(email).select('+password')
   │                    bcrypt.compare(password, hash)  ── mismatch → 401
   ▼
tokenService.signToken({ id, role }, JWT_SECRET, expiresIn 7d)
   │  { token, user, hasProfile }
   ▼
AuthContext stores token (localStorage) → dispatch AUTH_SUCCESS
   │
   ▼  every request: Axios interceptor adds  Authorization: Bearer <token>
protect middleware ── jwt.verify → User.findById → req.user   (else 401)
authorize('admin') ── req.user.role check                      (else 403)
   │
   ▼  any 401 → Axios interceptor fires "nutriplan:unauthorized" → AuthContext logs out
```

- Passwords are hashed with **bcrypt (12 salt rounds)** in a Mongoose `pre('save')` hook.
- The role is never read from the request body during registration.
- Login returns the same message for unknown email and wrong password.
- `/auth/login` and `/auth/register` are rate-limited (30 requests / 15 min per IP).
- **Why a Bearer header instead of a cookie?** The frontend (Vercel) and API (Render) live on different domains; a header avoids third-party-cookie and CSRF issues. The trade-off is that the token lives in `localStorage`, so the app avoids rendering untrusted HTML (React escapes output by default).
- Frontend guards: `ProtectedRoute` (logged in, optional `roles`, optional `requireProfile`) and `GuestRoute` (login/register only when logged out). The API enforces the same rules independently.

## React Context API Implementation

| Context | File | Holds | Used by |
| --- | --- | --- | --- |
| **AuthContext** | `src/context/AuthContext.jsx` | `user`, `status` (`checking` / `authenticated` / `guest`), `hasProfile`, `isAdmin`; `login()`, `register()`, `logout()`, `updateUser()` | Navbar, Sidebar, ProtectedRoute, GuestRoute, Login, Register, Onboarding, Profile, Admin |
| **UserContext** | `src/context/UserContext.jsx` | The signed-in user's health **profile** + derived metrics; `saveProfile()`, `refreshProfile()`, `setProfile()` | Onboarding, Planner, Progress, Profile, Calculator |
| **DietContext** | `src/context/DietContext.jsx` | `selectedDate`, `plan`, `status`, `error`, `mutating`; `setDate()`, `generatePlan()`, `addMeal()`, `updateEntry()`, `removeEntry()`, `clearPlan()` | Diet Planner (+ MealPickerModal) |
| **ToastContext** | `src/context/ToastContext.jsx` | Notification queue; `toast.success/error/info()` | Everywhere |

Provider tree (`src/main.jsx`):

```jsx
<BrowserRouter>
  <ToastProvider>
    <AuthProvider>
      <UserProvider>
        <App />            {/* DietProvider is mounted inside AppLayout */}
      </UserProvider>
    </AuthProvider>
  </ToastProvider>
</BrowserRouter>
```

**Why Context here?** Auth state is needed by nearly every component (navigation, guards, API error handling) — passing it through props would touch every level. The profile is read by five different pages; keeping it in one context means that when the Progress page logs a new weight, the Planner and Profile immediately show the recalculated calorie target. `DietProvider` is mounted inside `AppLayout`, so each signed-in session starts with fresh plan state and nothing leaks between users. Components consume contexts through small hooks (`useAuth`, `useUser`, `useDiet`, `useToast`) that throw a clear error if used outside their provider.

## State Management

| Technique | Where | Example |
| --- | --- | --- |
| `useReducer` | `AuthContext`, `DietContext` | `AUTH_SUCCESS / LOGOUT`; `LOAD_START → LOAD_SUCCESS / LOAD_FAILURE`, `MUTATE_START → MUTATE_SUCCESS` — related fields change together, so they can never become inconsistent |
| `useState` | forms and UI | Register/Login form values & errors, onboarding step, modal open/close, filters on the Meals page, selected chart range |
| `useEffect` | side effects | Restore session on load, reload plan when `selectedDate` changes, listen for the unauthorized event, lock scroll while a modal is open |
| `useMemo` / `useCallback` | contexts & Meals page | Stable context values and query params to avoid needless re-renders / re-fetches |
| Custom hooks | `hooks/` | `useFetch` (loading/error/data/refetch), `useDebounce` (search), `useDocumentTitle` |
| Derived state | pages | Remaining calories, BMI category, weight change — computed from state, never stored twice |

Components stay small: e.g. `DietPlanner` composes `DietPlanCard`, `MealPickerModal`, `MacroBreakdown` and `ConfirmDialog`, each owning only its own local state.

## Data Fetching

- **One Axios instance** (`src/services/api.js`) with `baseURL = import.meta.env.VITE_API_URL`, a 15 s timeout, a **request interceptor** that attaches the JWT and a **response interceptor** that unwraps `{ data }` and normalises errors into `{ status, message, details }`.
- **Service modules** per resource (`authService`, `profileService`, `mealService`, `dietService`, `progressService`, `dashboardService`, `adminService`) — components never build URLs themselves.
- **All HTTP verbs are used:** GET (dashboard, meals, plans, progress), POST (register, login, create meal, generate plan, add entry, log progress), PUT (profile, meal, plan, progress), PATCH (plan entries, user role, account name), DELETE (meal, plan, entry, progress, user).
- **Loading / error / empty states** everywhere via `useFetch`, `LoadingSpinner`, `ErrorMessage` (with Retry) and `EmptyState`.
- **Refreshing after changes:** mutations either return the updated resource (the plan, the profile) which is put straight into state, or call `refetch()`.
- **Race-safe:** `useFetch` ignores responses from outdated requests (fast typing in the search box can't show stale results); search input is debounced.

## Node.js Implementation

- Node.js is the backend runtime (`backend/server.js`), using **ES modules** (`"type": "module"`).
- `config/env.js` loads `.env` with **dotenv**, validates required variables at startup and exports a frozen config object.
- `server.js` **awaits** the MongoDB connection before calling `app.listen()`, handles `SIGINT`/`SIGTERM` for graceful shutdown and logs unhandled rejections.
- Asynchronous code throughout uses `async/await` (DB queries, bcrypt hashing, `Promise.all` for parallel queries in the dashboard).
- **npm** manages dependencies and scripts: `npm run dev` (`node --watch`), `npm start`, `npm run seed`, `npm test` (Node's built-in `node:test` runner).
- `app.js` (build the app) is separated from `server.js` (start it) so tests can import the app without opening a port.

## Express.js Implementation

- **Middleware pipeline** (`app.js`): `helmet` (security headers) → `cors` (allow-list from `CLIENT_URL`) → `express.json` (100 kB limit) → `morgan` logging → routers → `notFound` → `errorHandler`.
- **Routers** per resource in `routes/`, mounted under `/api` in `routes/index.js`.
- **Controllers** contain request handling only; business logic lives in **services** (`healthService` formulas, `dietPlanService` generator & totals, `mealService` visibility/permissions).
- **Validation middleware** `validate(rules)` runs express-validator chains and returns **422** with per-field details.
- **Auth middleware** `protect` (JWT) and `authorize(...roles)` (RBAC).
- **Express 5** forwards errors thrown in async handlers to the error middleware automatically, so controllers simply `throw new AppError('…', 404)`.
- **Global error handler** maps Mongoose `CastError` → 400, `ValidationError` → 422, duplicate key `11000` → 409, JWT errors → 401, malformed JSON → 400, and hides stack traces in production.

## MongoDB Integration

- Connected through **Mongoose** in `config/db.js` (`mongoose.connect(MONGODB_URI)`), works with a local MongoDB or **MongoDB Atlas**.
- Five models with references: `Profile.user → User`, `DietPlan.user → User`, `DietPlan.<slot>[].meal → Meal`, `Progress.user → User`, `Meal.createdBy → User`.
- Mongoose features used: schema validation, enums, `select: false`, `pre('save')` hooks (password hashing, metric recalculation), sub-document arrays with `.id()` / `.pull()`, `populate()`, `toJSON` transforms (hide password, format dates), aggregation pipelines (`$group`) for admin statistics, `bulkWrite` upserts in the seed script.
- Seed script: `npm run seed` loads a 53-meal catalog and an admin account; `npm run seed:demo` also creates a demo user with six weeks of progress and a week of plans.

## React + Express Integration

End-to-end example — **user logs a new weight on the Progress page**:

```
Progress page ─ ProgressForm submit
   │ progressService.create({ date, weight, caloriesConsumed, notes })
   ▼
Axios (adds Authorization: Bearer <JWT>) ── POST /api/progress
   ▼
Express: validate(progressRules) → protect (verify JWT, load user)
   ▼
progressController.createProgress → Progress.create(...)
   ▼
profileService.syncWeightFromProgress → Profile.save()  (pre-save recalculates BMI/BMR/TDEE/target)
   ▼
201 { success, data: { entry, profile } }
   ▼
UserContext.setProfile(profile) + refetch() → chart, cards, planner target update instantly
```

Other flows: onboarding `PUT /api/profile` → `POST /api/diet-plans/generate`; ticking a meal `PATCH /api/diet-plans/:id/entries/:entryId { consumed: true }` → dashboard calories update; admin deletes a meal → `DELETE /api/meals/:id` → removed from every plan.

## BMI & Calorie Calculation

Implemented in `backend/services/healthService.js` (mirrored in `frontend/src/utils/health.js` only for live previews — saved values come from the API).

**BMI** = weight (kg) ÷ height (m)²

| BMI | Category |
| --- | --- |
| < 18.5 | Underweight |
| 18.5 – 24.9 | Normal |
| 25 – 29.9 | Overweight |
| ≥ 30 | Obese |

BMI is a general screening metric — it doesn't account for muscle mass, age or body composition, and is not a diagnosis.

**BMR — Mifflin-St Jeor equation**

```
Male:   BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5
Female: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
Other:  average of the two constants (−78)
```

**Estimated daily energy (TDEE)** = BMR × activity multiplier

| Activity | Multiplier |
| --- | --- |
| Sedentary | 1.2 |
| Lightly active | 1.375 |
| Moderately active | 1.55 |
| Very active | 1.725 |

**Goal-adjusted target** = TDEE − 500 (weight loss) / + 0 (maintenance) / + 400 (weight gain), rounded to 10 kcal, never below **1,200 kcal**.

**Macro targets** = 25 % protein, 50 % carbohydrates, 25 % fat of the target (4 / 4 / 9 kcal per gram).

**Plan generator** (`dietPlanService.generatePlanEntries`): splits the target 25 % breakfast / 35 % lunch / 10 % snacks / 30 % dinner; for each slot it picks randomly among the 3 meals whose calories are closest to that budget (only diet-compatible, allergen-free meals), scales servings in 0.5 steps, and adds a side dish when ≥ 120 kcal of budget remains.

*Worked example:* female, 25 y, 165 cm, 60 kg, moderately active, weight loss → BMR = 600 + 1031.25 − 125 − 161 = **1,345** → TDEE = 1,345 × 1.55 = **2,085** → target = 2,085 − 500 = **1,590 kcal** (verified by the automated tests).

## Installation

**Prerequisites:** Node.js ≥ 18.18 (tested on 24), npm, and either MongoDB running locally or a free MongoDB Atlas cluster.

```bash
git clone https://github.com/<your-username>/nutriplan.git
cd nutriplan
npm install            # root helper (concurrently)
npm run install:all    # backend + frontend dependencies
```

**npm packages**

- Backend: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `helmet`, `morgan`, `express-validator`, `express-rate-limit` · dev: `supertest`
- Frontend: `react`, `react-dom`, `react-router-dom`, `axios`, `recharts`, `lucide-react` · dev: `vite`, `@vitejs/plugin-react`
- Root (dev): `concurrently`

### MongoDB setup

**Option A – local:** install MongoDB Community Server and keep the default `MONGODB_URI=mongodb://127.0.0.1:27017/nutriplan`.

**Option B – MongoDB Atlas (recommended for deployment):**
1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. *Database Access* → add a database user (username + password).
3. *Network Access* → allow your IP (and `0.0.0.0/0` for Render, since its IPs change).
4. *Connect → Drivers* → copy the connection string and add the database name:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/nutriplan?retryWrites=true&w=majority`
5. Put it in `backend/.env` as `MONGODB_URI`.

## Environment Variables

Copy the examples and fill them in — `.env` files are git-ignored and must never be committed.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**backend/.env**

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | no | `5000` | API port (Render sets it automatically) |
| `NODE_ENV` | no | `development` / `production` | Logging & error detail |
| `MONGODB_URI` | **yes** | `mongodb://127.0.0.1:27017/nutriplan` | Database connection |
| `JWT_SECRET` | **yes** | 64+ random chars | Signs tokens — generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime |
| `CLIENT_URL` | yes in prod | `http://localhost:5173` | CORS allow-list (comma-separated for several) |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | seed only | see `.env.example` | Admin account created by `npm run seed` — **change before seeding production** |
| `DEMO_EMAIL`, `DEMO_PASSWORD` | seed only | see `.env.example` | Demo user created by `npm run seed:demo` |

**frontend/.env**

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the Express API |

## Running Locally

```bash
npm run seed:demo      # meal catalog + admin + demo user (run once)
npm run dev            # API on :5000 and React on :5173 together
```

Or run them separately:

```bash
npm run dev --prefix backend     # http://localhost:5000/api/health
npm run dev --prefix frontend    # http://localhost:5173
```

Sign in with the admin or demo credentials from `backend/.env`, or register a new account.

## Testing

**Automated (backend):** 24 integration tests covering auth, validation, profile metrics, meal permissions, plan generation/entries, progress sync, admin authorization and 404s. They run against a separate `nutriplan_test` database (override with `MONGODB_URI_TEST`), which is dropped afterwards.

```bash
npm test
```

**Manual checklist**

| Area | Check |
| --- | --- |
| Auth | Register → redirected to onboarding · wrong password shows "Invalid email or password" · logout clears the session · visiting `/dashboard` logged-out redirects to `/login` |
| User | Onboarding creates the profile · Profile edits persist after refresh · new weight changes the calorie target |
| Diet | Generate plan · add a meal from the picker · change servings · tick as eaten (dashboard "Consumed" updates) · remove · clear day |
| Meals | Search / filter / sort · create, edit, delete a custom meal · another user can't see it |
| Progress | Log a weigh-in (duplicate date → error toast) · chart updates · edit / delete |
| Admin | Admin sees Admin Panel · normal user visiting `/admin` is redirected and `GET /api/dashboard/admin` returns 403 |
| Backend | `GET /api/health` shows `database: connected` · invalid input returns 422 with details |
| Frontend | Loading spinners, empty states, error + Retry (stop the API to see it), 404 page, mobile layout |

## API Endpoints

```
POST   /api/auth/register            POST   /api/diet-plans
POST   /api/auth/login               POST   /api/diet-plans/generate
GET    /api/auth/me                  GET    /api/diet-plans/date/:date
POST   /api/auth/logout              GET    /api/diet-plans/:id
PATCH  /api/users/me                 PUT    /api/diet-plans/:id
GET    /api/users               🛡️    DELETE /api/diet-plans/:id
PATCH  /api/users/:id/role      🛡️    POST   /api/diet-plans/:id/entries
DELETE /api/users/:id           🛡️    PATCH  /api/diet-plans/:id/entries/:entryId
GET    /api/profile                  DELETE /api/diet-plans/:id/entries/:entryId
PUT    /api/profile                  GET    /api/progress
GET    /api/meals                    POST   /api/progress
GET    /api/meals/:id                PUT    /api/progress/:id
POST   /api/meals                    DELETE /api/progress/:id
PUT    /api/meals/:id                GET    /api/dashboard
DELETE /api/meals/:id                GET    /api/dashboard/admin     🛡️
GET    /api/diet-plans               GET    /api/health
```

## Screenshots

Add screenshots to `docs/screenshots/` and they will render here:

| Landing | Dashboard |
| --- | --- |
| ![Landing](docs/screenshots/landing.png) | ![Dashboard](docs/screenshots/dashboard.png) |
| **Diet Planner** | **Progress** |
| ![Planner](docs/screenshots/planner.png) | ![Progress](docs/screenshots/progress.png) |
| **Onboarding** | **Admin Panel** |
| ![Onboarding](docs/screenshots/onboarding.png) | ![Admin](docs/screenshots/admin.png) |

## Deployment

```
React (Vercel)  ──HTTPS──▶  Express API (Render)  ──▶  MongoDB Atlas
```

### 1. Database — MongoDB Atlas
Follow [MongoDB setup](#mongodb-setup), allow network access from `0.0.0.0/0`, and copy the connection string.

### 2. Backend — Render
1. Push the repo to GitHub.
2. Render → **New → Blueprint** → select the repo (uses `render.yaml`), *or* **New → Web Service** with root directory `backend`, build `npm ci --omit=dev`, start `npm start`, health check `/api/health`.
3. Set environment variables: `NODE_ENV=production`, `MONGODB_URI=<Atlas URI>`, `JWT_SECRET=<long random>`, `CLIENT_URL=https://<your-app>.vercel.app`.
4. After the first deploy, open the Render **Shell** and run `npm run seed` (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars first) — or run the seed locally with `MONGODB_URI` pointing at Atlas.
5. Verify `https://<your-api>.onrender.com/api/health` → `"database": "connected"`.

*(Railway works the same way: root `backend`, start `npm start`, same variables.)*

### 3. Frontend — Vercel
1. Vercel → **Add New Project** → import the repo, **Root Directory = `frontend`** (framework preset: Vite).
2. Environment variable: `VITE_API_URL=https://<your-api>.onrender.com/api`.
3. Deploy. `vercel.json` rewrites all routes to `index.html` so deep links like `/dashboard` work.
4. Put the final Vercel URL in the backend's `CLIENT_URL` and redeploy the API (CORS).

> Render's free tier sleeps after inactivity; the first request can take ~30 s.

## Academic Experiments Demonstrated

| # | Experiment | Implementation in NutriPlan | Where to look |
| --- | --- | --- | --- |
| 1 | **Node.js** | Backend runtime and server: ES modules, dotenv config, async/await, graceful shutdown, npm scripts, `node --watch`, `node:test` | `backend/server.js`, `config/env.js`, `package.json` |
| 2 | **Express.js** | REST API server: middleware chain (helmet, cors, json, morgan, rate-limit), modular routers, controllers, validation, auth & global error middleware | `backend/app.js`, `routes/`, `middleware/`, `controllers/` |
| 3 | **MongoDB** | Persistent database via Mongoose: 5 related schemas, validation, indexes, hooks, populate, aggregation, seed script | `backend/models/`, `config/db.js`, `scripts/seed.js` |
| 4 | **REST APIs** | CRUD APIs with GET/POST/PUT/PATCH/DELETE, proper status codes, JSON envelope, request validation | `backend/routes/`, [API docs](#rest-api-documentation) |
| 5 | **React.js** | Component-based SPA: 20+ reusable components, 12 pages, layouts, React Router 7, lazy-loaded routes | `frontend/src/components/`, `pages/`, `App.jsx` |
| 6 | **Authentication & Authorization** | JWT + bcrypt, `protect` / `authorize('admin')` middleware, ownership checks, `ProtectedRoute` / `GuestRoute`, USER & ADMIN roles | `middleware/auth.js`, `controllers/authController.js`, `components/ProtectedRoute.jsx` |
| 7 | **React State Management** | `useReducer` (auth, diet plan), `useState` (forms, UI), `useEffect`, `useMemo`/`useCallback`, custom hooks | `context/DietContext.jsx`, `hooks/useFetch.js`, `pages/Meals.jsx` |
| 8 | **Context API** | AuthContext, UserContext, DietContext, ToastContext + `useAuth`/`useUser`/`useDiet`/`useToast` | `frontend/src/context/`, `main.jsx` |
| 9 | **Data Fetching** | Axios instance with interceptors, service layer, loading/error/empty states, refetch after mutations, env-based API URL | `frontend/src/services/`, `hooks/useFetch.js` |
| 10 | **React + Express** | Real end-to-end flows (profile, plans, meals, progress, admin) between the SPA and the API | [React + Express Integration](#react--express-integration) |
| 11 | **Full Stack Deployment** | Vercel (frontend) + Render (backend) + MongoDB Atlas, env-based config, `.env.example`, `vercel.json`, `render.yaml`, health check | [Deployment](#deployment) |

Viva questions & answers for every experiment: [`docs/VIVA.md`](docs/VIVA.md).

## Future Enhancements

- Weekly meal-plan templates and a grocery list generated from the plan
- Water intake and micronutrient (fibre, sodium, sugar) tracking
- Refresh tokens in HTTP-only cookies and email verification / password reset
- Recipe images via object storage (e.g. Cloudinary / S3)
- Dark mode and PWA offline support
- Barcode scanning / nutrition database integration for packaged foods

## Disclaimer

NutriPlan provides general wellness and planning information only. BMI, BMR and calorie targets are population-level estimates and may not suit everyone — for example during pregnancy, for athletes, or for people with medical conditions. Always consult a qualified healthcare professional or registered dietitian before making significant changes to your diet.

## Author

**Your Name** — Full-Stack Developer
GitHub: `https://github.com/<your-username>` · LinkedIn: `https://linkedin.com/in/<your-profile>`
