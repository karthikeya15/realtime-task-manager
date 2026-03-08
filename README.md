# Synctask — Real-Time Collaborative Task Manager

A full-stack, production-grade task management system. Multiple users can create projects, manage tasks, assign teammates, and communicate via comments — with instant real-time synchronisation powered by WebSockets.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js 18+ |
| Backend Framework | Express.js |
| Frontend Framework | Next.js 14 (App Router) |
| Database | MongoDB 6 + Mongoose |
| Real-Time | Socket.IO 4 |
| Authentication | JSON Web Tokens (JWT) |
| API Validation | Joi |
| UI Validation | React Hook Form + Zod |
| Server State | TanStack Query v5 |
| Global State | Zustand + persist middleware |
| HTTP Client | Axios (with auto-refresh interceptor) |
| Styling | Tailwind CSS |
| Logging | Winston + daily-rotate-file |
| Testing | Jest + mongodb-memory-server |

---

## Project Structure

### Backend — `task-manager-api/`

```
src/
├── config/         # DB connection pool, env config
├── models/         # Mongoose schemas: User, Project, Task
├── validators/     # Joi schemas for every request body
├── middleware/     # authenticate, authorize, validate, errorHandler
├── services/       # Business logic: auth, project, task
├── controllers/    # Thin route handlers (call service → emit socket → respond)
├── routes/         # Express routers (auth, projects, tasks)
├── sockets/        # Socket.IO init, JWT auth middleware, presence store
├── utils/          # ApiError, ApiResponse, catchAsync, logger
├── app.js
└── server.js
tests/
├── setup.js                  # MongoMemoryServer lifecycle
├── auth.service.test.js
└── task.service.test.js
```

### Frontend — `task-manager-frontend/`

```
app/
├── auth/login|register/      # Auth pages
├── dashboard/                # Projects overview + stats
└── projects/[projectId]/     # Kanban + list board + members panel
components/
├── ui/             # Button, Input, Badge, Avatar, Modal, Skeleton
├── layout/         # AppShell, Sidebar, Header (search + presence)
├── tasks/          # KanbanBoard, TaskCard, TaskListView, TaskDetailDrawer
└── projects/       # ProjectCard, CreateProjectModal, MembersPanel
hooks/              # useAuth, useProjects, useTasks, useSocket, useDebounce
lib/                # api.ts, socket.ts, queryClient.ts, utils.ts
store/              # authStore (Zustand+persist), uiStore
types/              # 30+ shared TypeScript interfaces
```

---

## Setup & Installation

### Prerequisites

- Node.js ≥ 18
- MongoDB ≥ 6 (local or Atlas)

---

### Backend

**1. Install dependencies**

```bash
cd task-manager-api
npm install
```

**2. Configure environment**

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | `development` / `production` / `test` | `development` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | Access token signing secret | — |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |

**3. Run**

```bash
npm run dev       # Development with hot reload
npm start         # Production
npm test          # Unit tests
npm run test:coverage  # Coverage report
```

---

### Frontend

**1. Install dependencies**

```bash
cd task-manager-frontend
npm install
```

**2. Configure environment**

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL (e.g. `http://localhost:5000/api/v1`) |
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.IO server URL (e.g. `http://localhost:5000`) |

**3. Run**

```bash
npm run dev          # Development on port 3000
npm run build        # Production build
npm start            # Serve production build
npm run type-check   # TypeScript strict validation
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

Authenticated routes require: `Authorization: Bearer <access_token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register → returns access + refresh tokens |
| POST | `/auth/login` | — | Login → returns access + refresh tokens |
| POST | `/auth/refresh` | — | Exchange refresh token for new access token |
| GET | `/auth/me` | ✓ | Return current user profile |

### Projects

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| GET | `/projects` | member | List all projects where user is a member |
| POST | `/projects` | any | Create project — creator becomes owner |
| GET | `/projects/:id` | member | Get project with populated members |
| PATCH | `/projects/:id` | admin | Update name, description, color |
| DELETE | `/projects/:id` | owner | Delete project + cascade-delete all tasks |
| POST | `/projects/:id/members` | admin | Add member by userId + role |
| DELETE | `/projects/:id/members/:userId` | admin | Remove a member |

### Tasks

All task endpoints are nested under `/projects/:projectId/tasks/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List tasks (cursor-paginated, filterable) |
| GET | `/search?search=…` | Full-text search across title, description, comments |
| POST | `/` | Create a task |
| GET | `/:taskId` | Get a single task |
| PATCH | `/:taskId` | Update status, priority, title, assignees, etc. |
| DELETE | `/:taskId` | Delete task |
| POST | `/:taskId/assign` | Add users to assignees |
| POST | `/:taskId/unassign` | Remove users from assignees |
| POST | `/:taskId/comments` | Add a comment |
| DELETE | `/:taskId/comments/:commentId` | Delete your own comment |

#### Task List Query Parameters

| Param | Type | Description |
|---|---|---|
| `status` | string | `backlog` / `todo` / `in_progress` / `in_review` / `done` |
| `assignee` | ObjectId | Filter by assigned user |
| `priority` | string | `low` / `medium` / `high` / `urgent` |
| `cursor` | string | Opaque base64 cursor from previous page's `nextCursor` |
| `limit` | number | Page size, 1–100, default 20 |

#### Pagination Response Envelope

```json
{
  "success": true,
  "data": [ "...tasks" ],
  "meta": {
    "pagination": {
      "hasNextPage": true,
      "nextCursor": "NjY0Y2...",
      "limit": 20
    }
  }
}
```

---

## Real-Time Events (Socket.IO)

### Connection

```js
const socket = io("http://localhost:5000", {
  auth: { token: "<access_token>" }
});
```

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `project:join` | `projectId` | Join project room — receive real-time updates |
| `project:leave` | `projectId` | Leave project room |
| `task:typing` | `{ projectId, taskId }` | Broadcast typing indicator |

### Server → Client

| Event | Payload | Trigger |
|---|---|---|
| `task:created` | Full Task object | POST /tasks |
| `task:updated` | Full Task object | PATCH /tasks/:id |
| `task:deleted` | `{ taskId, projectId }` | DELETE /tasks/:id |
| `task:commented` | Full Task object | POST /tasks/:id/comments |
| `presence:update` | `{ projectId, users[] }` | User joins or leaves room |

---

## MongoDB Indexing Strategy

| Collection | Index | Purpose |
|---|---|---|
| users | `email` (unique) | Auth lookups |
| projects | `members.user` | Find projects by member |
| projects | `owner` | Find projects by owner |
| tasks | `{ project, createdAt }` | Dashboard list |
| tasks | `{ project, status }` | Kanban column filter |
| tasks | `{ project, assignees }` | Assignee filter |
| tasks | `{ project, _id }` | Cursor pagination anchor |
| tasks | Text: title, description, comments.content | Full-text search |

---

## Design Decisions

### 1. Cursor-Based Pagination (vs Offset)

**Choice:** Cursor pagination anchored on MongoDB `_id`.

MongoDB's `SKIP` degrades linearly: to reach page 1000, it must scan all prior documents. A cursor-based approach uses the indexed `_id` field with a `$lt: decodedCursor` query — O(log n) regardless of depth.

The tradeoff is that you cannot jump to an arbitrary page number. For an infinite-scroll or "load more" dashboard UX this is a non-issue, and the performance and consistency benefits (new inserts don't shift pages) make it the right choice for a collaborative tool.

### 2. Embedded Comments (vs Referenced)

**Choice:** Comments are embedded sub-documents inside the Task document.

Comments are virtually always read alongside their parent task. Embedding avoids a second database round-trip and enables atomic updates via `task.save()`. The MongoDB `$text` index on `comments.content` also works naturally with embedded documents.

The tradeoff is document growth. With a 2,000-character cap per comment and a realistic maximum of ~200 comments per task, documents stay well under MongoDB's 16 MB limit (~400 KB worst case).

### 3. Service Layer Architecture

Controllers are intentionally thin — they parse the validated request, call a service, optionally emit a socket event, and respond. All business logic lives in service modules. This makes unit-testing straightforward (no HTTP scaffolding or mocking required) and decouples domain logic from the framework.

### 4. Per-Column Cursor Pagination in Kanban

Each Kanban column is an independent React component that owns its own `useInfiniteTasks({ status })` query. This ensures each column loads 20 tasks of its specific status rather than 20 tasks mixed across all statuses. An `IntersectionObserver` sentinel at the bottom of each column auto-fetches the next cursor page when scrolled into view.

### 5. Single-Instance Presence

Presence tracking uses an in-memory `Map<projectId, Map<socketId, user>>` on the Node.js process — fast, zero dependencies, correct for a single instance. For horizontal scaling behind a load balancer, replace with `@socket.io/redis-adapter` so all instances share the same room membership.

---

## Testing

Tests use **Jest** with **mongodb-memory-server** — an in-process MongoDB instance that requires no external database.

```bash
npm test                   # Run all tests
npm run test:coverage      # Coverage report
```

### auth.service.test.js
- `register()` — creates user, bcrypt-hashes password, returns tokens, rejects duplicate email (409)
- `login()` — validates credentials, rejects wrong password (401), rejects unknown email (401)
- `refreshAccessToken()` — issues new token for valid refresh token, rejects invalid token (401)

### task.service.test.js
- Cursor pagination — correct page size, second page, status filter, empty result
- Comment ownership — add comment, author can delete, non-author receives 403
- CRUD operations — create, read (404 for missing), update, delete

---

## Security

| Concern | Mitigation |
|---|---|
| Brute-force login | `express-rate-limit`: 100 req / 15 min per IP |
| Password storage | `bcryptjs` cost factor 12 |
| JWT secret exposure | Secrets loaded from `.env`, validated on startup |
| Large payload attacks | Body parser limited to 10 KB |
| XSS / clickjacking | `helmet` middleware on all responses |
| CORS misconfiguration | Strict allowlist via `CLIENT_URL` env var |
| MongoDB injection | Mongoose ODM + Joi `stripUnknown: true` |
| Privilege escalation | Role checked on every project mutation |
