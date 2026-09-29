# NutriPlan — Viva Questions, Resume Description & Demo Script

## Resume-ready project description

**NutriPlan – Personalized Diet Planner (MERN)** — A full-stack nutrition planning platform where users build a health profile, receive a calorie target calculated with the Mifflin-St Jeor equation, generate diet- and allergy-aware daily meal plans, track meals eaten and log weight progress on interactive charts. Built with React 19, Context API, Node.js, Express 5, MongoDB/Mongoose and JWT authentication with role-based access, and deployed on Vercel, Render and MongoDB Atlas.

**Resume bullets**

- Built a full-stack MERN nutrition planner with **30+ RESTful endpoints** (Express 5, MongoDB/Mongoose) covering profiles, meals, diet plans, progress tracking and admin analytics, backed by **24 automated integration tests** (node:test + Supertest).
- Implemented **JWT authentication with bcrypt hashing and role-based authorization** (user/admin), ownership checks, request validation, rate-limited auth routes and a centralized error handler returning consistent HTTP status codes.
- Designed a **personalized plan generator** that converts BMI/BMR/TDEE calculations into calorie-balanced daily meal plans filtered by dietary preference and allergens, with automatic recalculation of nutrition totals.
- Architected a **React 19 SPA** using Context API + `useReducer` for auth, profile and plan state, an Axios service layer with interceptors, code-split routes and **Recharts** dashboards, fully responsive from desktop to mobile.
- Deployed with **environment-based configuration** across Vercel (frontend), Render (API) and MongoDB Atlas (database), including health checks, CORS allow-listing and SPA routing.

---

## 5-minute demo script (for evaluation)

1. **Landing page** → *Get Started* → register a new account (show validation + toast).
2. **Onboarding** → fill 3 steps; point out the live BMI/calorie preview → *Finish* (plan auto-generated).
3. **Dashboard** → cards, calorie ring, tick a meal as eaten → "Consumed" updates (PATCH request).
4. **Diet Planner** → change date, *Generate*, add a meal from the picker, change servings, remove one.
5. **Meals** → search/filter/sort, create a custom meal.
6. **Progress** → log a weight → chart + profile target update (show Network tab: POST `/api/progress`).
7. **Admin** → log in as admin → stats, users table; show a normal user gets 403 on `/api/dashboard/admin`.
8. **Code tour** → `server.js`, `app.js`, a route → controller → model; `AuthContext`, `services/api.js`; README experiment table.

---

## Experiment 1 — Node.js

**Q1. What is Node.js and why use it for the backend?**
Node.js is a JavaScript runtime built on Chrome's V8 engine that runs JS outside the browser. It uses an event-driven, non-blocking I/O model, which suits I/O-heavy APIs like ours (database reads/writes). Using JavaScript on both frontend and backend also means one language across the stack.

**Q2. What is the event loop?**
The mechanism that lets single-threaded Node handle many concurrent operations. Slow I/O (DB queries, bcrypt hashing on the libuv thread pool) is delegated; when it finishes, its callback / resolved promise is queued and executed by the event loop, so the main thread is never blocked waiting.

**Q3. Where do you use asynchronous code?**
Every Mongoose query (`await User.findOne(...)`), password hashing (`bcrypt.hash`), and parallel queries with `Promise.all` in the dashboard controller. `server.js` awaits the DB connection before starting the HTTP server.

**Q4. What is npm and what does package.json contain?**
npm is Node's package manager. `package.json` lists metadata, dependencies (`express`, `mongoose` …), devDependencies (`supertest`) and scripts (`npm run dev`, `npm start`, `npm run seed`, `npm test`). `package-lock.json` pins exact versions.

**Q5. How are environment variables handled?**
`dotenv` loads `backend/.env` into `process.env`; `config/env.js` validates required ones (`MONGODB_URI`, `JWT_SECRET`) and exports a frozen config object. Secrets stay out of source control via `.gitignore`; `.env.example` documents them.

**Q6. CommonJS vs ES modules?**
CommonJS uses `require`/`module.exports`; ES modules use `import`/`export`. NutriPlan uses ES modules (`"type": "module"`), the modern standard shared with the React code.

**Q7. Why separate `app.js` and `server.js`?**
`app.js` builds and exports the Express app; `server.js` connects to MongoDB and calls `listen()`. Tests import `app.js` directly with Supertest without opening a real port.

## Experiment 2 — Express.js

**Q1. What is Express?**
A minimal web framework for Node.js providing routing, middleware and request/response helpers on top of Node's `http` module.

**Q2. What is middleware? Give examples from the project.**
A function `(req, res, next)` that runs in the request pipeline. Ours: `helmet` (security headers), `cors`, `express.json()` (body parsing), `morgan` (logging), `authLimiter` (rate limiting), `validate()` (input validation), `protect` (JWT auth), `authorize('admin')` (roles), `notFound` and `errorHandler`.

**Q3. How is routing organised?**
One `Router` per resource in `routes/` (auth, users, profile, meals, diet-plans, progress, dashboard), all mounted under `/api` in `routes/index.js`. Routes map to controller functions; `router.route('/:id').get().put().delete()` groups verbs.

**Q4. How are errors handled?**
Controllers throw `AppError(message, statusCode)`. Express 5 forwards errors from async handlers automatically to the 4-argument `errorHandler`, which also converts Mongoose `CastError` → 400, `ValidationError` → 422, duplicate key → 409 and JWT errors → 401, returning `{ success: false, message, details }`.

**Q5. What does CORS do and how did you configure it?**
Browsers block cross-origin requests unless the server allows them. The React app (Vercel / :5173) and API (Render / :5000) are different origins, so `cors()` allows only origins listed in `CLIENT_URL`, plus the `Authorization` and `Content-Type` headers.

**Q6. Difference between `app.use` and `app.get`?**
`app.use` mounts middleware/routers for all methods on a path prefix; `app.get` handles only GET requests on an exact path.

## Experiment 3 — MongoDB

**Q1. What is MongoDB and how is it different from SQL databases?**
A document-oriented NoSQL database storing BSON documents in collections. Schemas are flexible, documents can nest arrays/sub-documents (our plan slots), and it scales horizontally. SQL databases use fixed tables, rows and joins.

**Q2. What is Mongoose?**
An ODM (Object Data Modeling) library that adds schemas, validation, middleware (hooks), relationships via `ref` + `populate()`, and a query API on top of the MongoDB driver.

**Q3. Explain your schemas and relationships.**
`User` 1–1 `Profile` (`Profile.user` unique ref); `User` 1–many `DietPlan` and `Progress`; `DietPlan` has four arrays of entries, each referencing a `Meal`; `Meal.createdBy` references a `User` (custom meals).

**Q4. What indexes did you create and why?**
Unique `email`; unique `Profile.user`; unique compound `{user, date}` on DietPlan and Progress (one per day + fast lookup); `{category, dietaryType}` and a text index on meals for filtering/search.

**Q5. What is `populate()`?**
It replaces stored ObjectIds with the referenced documents — `plan.populate('breakfast.meal')` returns full meal details so the plan screen can show names and calories.

**Q6. Where do you use Mongoose middleware?**
`User.pre('save')` hashes the password when modified; `Profile.pre('save')` recalculates BMI, BMR, TDEE, calorie target and macro targets.

**Q7. How do you connect to MongoDB Atlas?**
Create a cluster, database user and network rule, then set `MONGODB_URI=mongodb+srv://...` — `mongoose.connect()` in `config/db.js` uses it unchanged.

## Experiment 4 — RESTful APIs

**Q1. What is REST?**
An architectural style where resources are identified by URLs and manipulated with standard HTTP methods; requests are stateless and responses are representations (JSON).

**Q2. Map HTTP methods to CRUD in your project.**
GET `/api/meals` (read), POST `/api/meals` (create), PUT `/api/meals/:id` (update/replace), PATCH `/api/diet-plans/:id/entries/:entryId` (partial update, e.g. mark eaten), DELETE `/api/meals/:id` (delete).

**Q3. PUT vs PATCH?**
PUT replaces/updates the resource with the sent representation (profile, meal); PATCH applies a partial change (only `consumed` or `servings` of one plan entry, a user's role).

**Q4. Which status codes do you return?**
200, 201 (created), 400 (bad input), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict — duplicate email / plan / check-in), 422 (validation), 429 (rate limited), 500.

**Q5. How is input validated?**
express-validator rule arrays in `validators/index.js` (types, ranges, enums, Mongo ids, date format) run by the `validate()` middleware before the controller; Mongoose schema validation is a second layer.

**Q6. Why is REST "stateless" here?**
The server keeps no session; each request carries its JWT, so any server instance can handle it.

## Experiment 5 — React.js

**Q1. What is React?**
A JavaScript library for building UIs from reusable components. It keeps a virtual DOM and efficiently updates only what changed when state changes.

**Q2. What is JSX?**
A syntax extension that lets you write HTML-like markup in JavaScript; Vite/Babel compiles it to `React.createElement` / JSX runtime calls.

**Q3. Props vs state?**
Props are read-only inputs passed from parent to child (e.g. `MealCard meal={...}`); state is data a component owns and can change (`useState`), triggering re-renders.

**Q4. How is routing done?**
React Router 7: `<BrowserRouter>` in `main.jsx`, `<Routes>`/`<Route>` in `App.jsx`, nested layouts with `<Outlet>` (`PublicLayout`, `AppLayout`), `NavLink` for active sidebar links, `useNavigate` for redirects, and a `*` route for the 404 page.

**Q5. Name some reusable components.**
`Navbar`, `Sidebar`, `DashboardCard`, `MealCard`, `DietPlanCard`, `ProgressChart`, `ProfileForm`, `BMIIndicator`, `CalorieCard`, `ProtectedRoute`, `LoadingSpinner`, `ErrorMessage`, `Modal`, `Toast`.

**Q6. What is code splitting?**
Pages are loaded with `React.lazy(() => import(...))` inside `<Suspense>`, so each page's JavaScript downloads only when visited, keeping the initial bundle small.

## Experiment 6 — Authentication & Authorization

**Q1. Authentication vs authorization?**
Authentication verifies *who* you are (login → JWT). Authorization decides *what* you may do (only admins can manage users; users can edit only their own custom meals and plans).

**Q2. What is a JWT and its structure?**
A JSON Web Token: `header.payload.signature`, Base64URL-encoded. Our payload holds `{ id, role, exp }`, signed with `JWT_SECRET` (HS256). The server verifies the signature — it can't be forged without the secret — but the payload is readable, so no secrets go in it.

**Q3. How are passwords stored?**
Hashed with bcrypt (12 salt rounds) in a `pre('save')` hook. Bcrypt is slow on purpose and salts each hash, resisting brute-force and rainbow-table attacks. The `password` field has `select: false` and is stripped from JSON.

**Q4. How does the protect middleware work?**
Reads `Authorization: Bearer <token>`, verifies it with `jwt.verify`, loads the user from MongoDB (rejecting deleted accounts), sets `req.user`, else responds 401.

**Q5. How is role-based access implemented?**
`authorize('admin')` checks `req.user.role` after `protect`, returning 403 otherwise. The frontend `ProtectedRoute roles={['admin']}` hides the admin page, but the server check is what actually protects the data.

**Q6. How does logout work with JWT?**
JWTs are stateless, so logout clears the token from `localStorage` and resets AuthContext; the token also expires after `JWT_EXPIRES_IN`. A token blacklist or short-lived access + refresh tokens would allow server-side revocation.

**Q7. How do you stop users accessing each other's data?**
Every query is scoped by owner: `DietPlan.findOne({ _id, user: req.user._id })` — another user's id returns 404. Custom meals are visible only to `createdBy`.

## Experiment 7 — React State Management

**Q1. `useState` vs `useReducer`?**
`useState` for independent simple values (form fields, modal open). `useReducer` when several values change together through named actions — DietContext moves `status`, `plan`, `error`, `mutating` via `LOAD_START`, `LOAD_SUCCESS`, `MUTATE_SUCCESS`, preventing inconsistent combinations.

**Q2. What does `useEffect` do? Give examples.**
Runs side effects after render: fetching the plan when `selectedDate` changes, restoring the session on first load, subscribing to the unauthorized event (with cleanup), locking scroll while a modal is open.

**Q3. What is lifting state up?**
Moving shared state to the nearest common parent (or a context) so siblings stay in sync — e.g. the profile lives in UserContext so Progress and Planner show the same calorie target.

**Q4. Why `useMemo` / `useCallback`?**
To keep object/function identities stable between renders so context consumers and effect dependencies don't re-run unnecessarily (e.g. memoised query params on the Meals page).

**Q5. What is a custom hook in your project?**
`useFetch` bundles `data / loading / error / refetch` for any API call and ignores stale responses; `useDebounce` delays search input; `useAuth`/`useUser`/`useDiet` wrap `useContext`.

## Experiment 8 — Context API

**Q1. What problem does Context solve?**
Prop drilling — passing data through many intermediate components that don't use it. Context makes a value available to any descendant.

**Q2. How do you create and use a context?**
`createContext()` → a Provider component holding state (`AuthProvider`) → wrap the app → consume with `useContext(AuthContext)` (wrapped in the `useAuth()` hook).

**Q3. Which contexts exist and why?**
AuthContext (session, login/logout), UserContext (health profile & metrics), DietContext (selected day's plan and actions), ToastContext (notifications).

**Q4. Why is DietProvider inside AppLayout rather than at the root?**
It is only needed on signed-in pages, and remounting per session guarantees one user's plan state never leaks to the next user who logs in on the same browser.

**Q5. Context vs Redux?**
Context is built into React and enough for a few well-scoped global values. Redux (or Zustand) adds devtools, middleware and fine-grained subscriptions — useful for large apps with frequent global updates.

## Experiment 9 — Data Fetching

**Q1. Axios vs Fetch?**
Both make HTTP requests. Axios adds automatic JSON parsing, interceptors, timeouts, and rejects on non-2xx statuses; Fetch is built-in but more manual.

**Q2. What are interceptors used for?**
The request interceptor attaches `Authorization: Bearer <token>`; the response interceptor unwraps `{ data }`, converts errors into `{ status, message, details }` and triggers logout on 401.

**Q3. Why a service layer?**
Components call `mealService.list(filters)` rather than building URLs — API details live in one place, are reusable, and easy to change.

**Q4. How do you show loading and error states?**
`useFetch` and DietContext expose `loading`/`status` and `error`; pages render `LoadingSpinner`, `ErrorMessage` with a Retry button, or `EmptyState` when there's no data.

**Q5. How does the UI refresh after a change?**
Mutations return the updated resource (e.g. the whole plan with new totals) which replaces state, or the page calls `refetch()`.

**Q6. How is the API URL configured per environment?**
`VITE_API_URL` in `frontend/.env`, read with `import.meta.env.VITE_API_URL` and baked in at build time (set in Vercel for production).

## Experiment 10 — Integrating React with Express

**Q1. Trace the request when a user ticks a meal as eaten.**
`DietPlanCard` → `updateEntry()` in DietContext → `dietService.updateEntry()` → Axios `PATCH /api/diet-plans/:id/entries/:entryId { consumed: true }` with JWT → Express `validate` → `protect` → `dietPlanController.updateEntry` → Mongoose updates the sub-document → `savePlan()` populates meals and recalculates totals → 200 JSON with the plan → reducer `MUTATE_SUCCESS` → UI re-renders with new consumed calories.

**Q2. How do the two apps talk in development and production?**
Dev: React on `localhost:5173`, API on `localhost:5000`, CORS allows the dev origin. Prod: React on Vercel calls `https://<api>.onrender.com/api`; `CLIENT_URL` on the API allows the Vercel origin.

**Q3. How are server validation errors shown in forms?**
The API returns `422` with `details: [{ field, message }]`; `fieldErrorsFrom(err)` maps them onto form fields and a toast shows the summary.

**Q4. What keeps client and server rules consistent?**
The server is the source of truth (validators + schema). The client mirrors key rules (password strength, ranges) for instant feedback, and its BMI/calorie preview uses the same formulas, but saved metrics always come from the API.

## Experiment 11 — Full Stack Deployment

**Q1. Describe the deployment architecture.**
React static build on **Vercel** (CDN), Express API on **Render** (Node web service), database on **MongoDB Atlas** — each configured with environment variables.

**Q2. Which environment variables are needed?**
Frontend: `VITE_API_URL`. Backend: `PORT` (set by Render), `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`.

**Q3. Why must `.env` not be committed?**
It contains secrets (DB credentials, JWT secret). Anyone with repo access could read the database or forge tokens. `.gitignore` excludes it; `.env.example` shows required keys with placeholders.

**Q4. Why is `vercel.json` needed?**
The SPA handles routes client-side. Without a rewrite, refreshing `/dashboard` asks Vercel for a file that doesn't exist (404); the rewrite serves `index.html` for every path.

**Q5. How do you verify the backend deployment?**
`GET /api/health` returns status and `database: "connected"`; Render uses it as the health check path.

**Q6. What changes between development and production?**
`NODE_ENV=production` hides stack traces and generic 500 messages, uses combined logs, the API URL points to Render, CORS allows only the Vercel domain, and the database is Atlas instead of local.

**Q7. What would you add for a real production launch?**
HTTPS-only cookies with refresh tokens, monitoring/log aggregation, CI running the test suite on every push, database backups, and a custom domain.
