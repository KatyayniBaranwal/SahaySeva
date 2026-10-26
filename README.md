# SahaySeva — Community Support Service Platform

A college full-stack prototype built with the **MERN** stack (MongoDB, Express, React, Node.js).
SahaySeva connects people who need help with people who can help: free community support, paid
local services, volunteering, NGOs, colleges and verifiable service certificates.

> ⚠️ **This is a college prototype.** Everything runs on demo/sample data — no real NGOs, users or
> partnerships are required. Fictional external organizations are clearly labelled
> **"Demo Organization"**.

---

## ✨ Features

- **6 roles with separate dashboards** — Community User, Service Provider, Volunteer, NGO/Organization, College/Institute, Admin
- **Free vs Paid clearly labelled everywhere** (FREE SERVICE / PAID SERVICE badges)
- Help requests with status flow: `Pending → Accepted → In Progress → Completed`
- Services marketplace with search, category/location/free-paid filters, sorting, saved services
- Volunteer opportunities by organizations, with application management (`Applied → Accepted → Completed`)
- College community-service programs with student participation
- **Service-hour tracking** and **verified certificates** (e.g. `SS-2026-0001`) with a public
  verification page — only for structured, verified programs (never for ordinary help)
- Ratings & reviews (only allowed after completion)
- JWT authentication, bcrypt password hashing, role-based authorization middleware
- Admin panel: verify organizations/institutes, manage users, monitor requests & certificates
- Fully responsive (desktop / tablet / mobile)

## 🗂 Project structure

```
├── backend/
│   ├── server.js            # Express app entry
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # 13 Mongoose models (User, Service, HelpRequest, Organization, …)
│   ├── controllers/         # Business logic per domain
│   ├── routes/              # REST API routes mounted under /api
│   ├── middleware/          # auth (JWT + roles), error handler
│   ├── utils/               # helpers (validation, token, error class)
│   ├── seed/seeder.js       # Demo data seeder (npm run seed)
│   ├── scripts/smoke.js     # 48 automated API smoke tests (node scripts/smoke.js)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios instance with JWT interceptor
│   │   ├── context/         # AuthContext (login/register/logout state)
│   │   ├── components/      # Navbar, cards, badges, ratings, guards…
│   │   ├── pages/           # Home, Services, Requests, Organizations, Colleges, Verify…
│   │   │   └── dashboards/  # 6 role-based dashboards
│   │   └── styles.css       # Hand-written responsive CSS design system
│   └── vite.config.js       # Dev proxy: /api → http://localhost:5000
└── start.bat                # One-click launcher for Windows (uses bundled runtimes)
```

## 🚀 Quick start (Windows, one click)

Double-click **`start.bat`**. It:

1. Uses the **bundled portable Node.js + MongoDB** in `.tools/` (no installation needed), if present
2. Installs npm dependencies on first run
3. Starts MongoDB (data stored in `.data/mongodb`)
4. Seeds the demo data (first run only)
5. Starts the API (`:5000`) and the web app (`:5173`), then opens your browser

Stop everything by closing the opened windows.

> If you delete `.data/` you reset the database; run `backend\npm run seed` to re-seed demo data
> any time (it also resets everything to the demo state on purpose).

## 🚀 Manual setup (any OS)

**Prerequisites:** Node.js 18+ and MongoDB (local `mongod` or a MongoDB Atlas cluster).

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env        # then edit MONGO_URI / JWT_SECRET
   npm run seed                # loads demo data (also resets the DB)
   npm start                   # API on http://localhost:5000
   ```
2. **Frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev                 # Web app on http://localhost:5173
   ```

**MongoDB Atlas:** set `MONGO_URI=mongodb+srv://<user>:<password>@cluster…` in `backend/.env`.

### .env (backend)

| Variable         | Example                             | Notes                              |
| ---------------- | ----------------------------------- | ---------------------------------- |
| `PORT`           | `5000`                              | API port                           |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/sahayseva` | local or Atlas connection string |
| `JWT_SECRET`     | any long random string              | **change in production**           |
| `JWT_EXPIRES_IN` | `7d`                                | token lifetime                     |
| `CLIENT_URL`     | `http://localhost:5173`             | used for CORS + certificate URLs   |

## 👤 Demo accounts

All demo accounts are created by the seeder. Passwords: `Password@123` (most),
`Student@123` (students), `Admin@123` (admin).

| Role            | Email                  | Password       |
| --------------- | ---------------------- | -------------- |
| Admin           | admin@sahayseva.com    | Admin@123      |
| Community User  | ravi@sahayseva.com     | Password@123   |
| Community User  | priya@sahayseva.com    | Password@123   |
| Service Provider| anita@sahayseva.com    | Password@123   |
| Service Provider| sunil@sahayseva.com    | Password@123   |
| Volunteer       | arjun@sahayseva.com    | Password@123   |
| Volunteer       | kavya@sahayseva.com    | Password@123   |
| NGO             | seva@sahayseva.com     | Password@123   |
| NGO             | green@sahayseva.com    | Password@123   |
| College         | college@sahayseva.com  | Password@123   |
| Student         | sneha@sahayseva.com    | Student@123    |

The Login page also has **one-click demo-account fill** buttons.

Sample certificates to verify on `/verify-certificate`: `SS-2026-0001`, `SS-2026-0002`, `SS-2026-0003`.

## 🔌 REST API overview (all under `/api`)

| Area             | Endpoints (examples)                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| Auth             | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`                          |
| Users            | `GET /users`, `PUT /users/profile`, `DELETE /users/:id` (admin)                    |
| Providers        | `GET /providers`, `GET/PUT /providers/me/profile`                                  |
| Services         | `GET /services?q&category&location&pricingType&sort`, `GET/POST/PUT/DELETE /services/:id`, `PUT /services/:id/save`, `GET /services/saved` |
| Help requests    | `GET /requests?scope=mine|open|assigned`, `POST /requests`, `PUT /requests/:id/status` |
| Organizations    | `GET /organizations?type=sahayseva|external`, `GET /organizations/:id`, `POST /organizations/:id/verify` (admin) |
| Opportunities    | `GET /opportunities`, `POST /opportunities`, `POST /opportunities/:id/apply`       |
| Applications     | `GET /applications/mine`, `GET /applications`, `PUT /applications/:id`             |
| Institutes       | `GET /institutes`, `POST /institutes/:id/students`, `POST /institutes/:id/verify`  |
| Programs         | `GET /programs`, `POST /programs`, `POST /programs/:id/join`                       |
| Participations   | `GET /participations/mine`, `PUT /participations/:id` (verify hours)               |
| Reviews          | `GET /reviews?targetId=`, `GET /reviews/mine`, `POST /reviews`                     |
| Certificates     | `GET /certificates/verify/:certificateId` (public), `POST /certificates/generate/application|participation`, `GET /certificates/mine` |
| Stats            | `GET /stats/dashboard` (role-aware aggregates)                                     |

Validation, proper HTTP status codes and centralized error handling are implemented in
`middleware/errorHandler.js` + `utils/helpers.js`.

## 🧪 Verification

`backend/scripts/smoke.js` runs 48 end-to-end API checks (auth, RBAC, request lifecycle, reviews,
applications, certificates, participation, saved services, stats):

```bash
cd backend
node scripts/smoke.js
```

## 🎓 CAPP concepts demonstrated

CRUD, database management (MongoDB/Mongoose), searching, filtering, sorting, JWT authentication,
authorization & role-based access, REST API design, form handling, input validation, error
handling, dynamic rendering, state management, user interaction, responsive design.

## ⚠️ Honest-labels policy

- **SahaySeva Organization** — registered & managed inside the platform (some demo-verified).
- **External Organization – Not a SahaySeva Partner** — public resource listing only (a few use
  real NGOs' public info with links to their official sites; several are labelled
  **Demo Organization** and are fictional).
- **Demo Data** banners are shown on the homepage and in the footer.
- Certificates are **only** issued for structured NGO/college programs — never for ordinary help.
