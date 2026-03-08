# Real-Time Collaborative Task Manager API

A production-grade Node.js/Express backend for a collaborative task management system with real-time WebSocket updates, JWT authentication, and MongoDB persistence.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.IO |
| Auth | JSON Web Tokens (JWT) |
| Validation | Joi |
| Logging | Winston |
| Testing | Jest + mongodb-memory-server |

---

## Project Structure

```
src/
├── config/          # DB connection, env config
├── controllers/     # Route handlers (thin — delegate to services)
├── middleware/      # Auth, validation, error handler
├── models/          # Mongoose schemas + indexes
├── routes/          # Express routers
├── services/        # Business logic layer
├── sockets/         # Socket.IO setup + presence tracking
├── utils/           # ApiError, ApiResponse, catchAsync, logger
├── validators/      # Joi schemas per domain
├── app.js           # Express app setup
└── server.js        # HTTP server + graceful shutdown
tests/
├── setup.js                # MongoMemoryServer lifecycle
├── auth.service.test.js
└── task.service.test.js
```

---

## Setup

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB ≥ 6 (local or Atlas)

### 2. Clone & Install

```bash
git clone <repo-url>
cd collaborative-task-manager-api
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | `development` / `production` / `test` | `development` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | Access token signing key | — |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token signing key | — |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |

### 4. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

### 5. Tests

```bash
npm test
npm run test:coverage
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive tokens |
| POST | `/auth/refresh` | Exchange refresh token for new access token |
| GET | `/auth/me` | Get current user profile |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/projects` | ✓ | List user's projects |
| POST | `/projects` | ✓ | Create a project |
| GET | `/projects/:id` | ✓ member | Get project details |
| PATCH | `/projects/:id` | ✓ admin | Update project |
| DELETE | `/projects/:id` | ✓ owner | Delete project + all tasks |
| POST | `/projects/:id/members` | ✓ admin | Add a member |
| DELETE | `/projects/:id/members/:userId` | ✓ admin | Remove a member |

### Tasks

All task endpoints are nested under `/projects/:projectId/tasks/`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List tasks (cursor-paginated, filterable) |
| GET | `/search?search=…` | Full-text search across title, description, comments |
| POST | `/` | Create a task |
| GET | `/:taskId` | Get a task |
| PATCH | `/:taskId` | Update a task |
| DELETE | `/:taskId` | Delete a task |
| POST | `/:taskId/assign` | Assign users to a task |
| POST | `/:taskId/unassign` | Unassign users from a task |
| POST | `/:taskId/comments` | Add a comment |
| DELETE | `/:taskId/comments/:commentId` | Delete your own comment |

#### Task List Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by: `backlog`, `todo`, `in_progress`, `in_review`, `done` |
| `assignee` | ObjectId | Filter by assigned user |
| `priority` | string | Filter by: `low`, `medium`, `high`, `urgent` |
| `cursor` | string | Opaque cursor from previous page's `nextCursor` |
| `limit` | number | Page size (1–100, default 20) |

---

## Real-Time Events (Socket.IO)

### Authentication

Pass the JWT access token when connecting:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: '<access_token>' }
});
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `project:join` | `projectId` | Join a project room (enables real-time updates) |
| `project:leave` | `projectId` | Leave a project room |
| `task:typing` | `{ projectId, taskId }` | Broadcast typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `task:created` | Task object | New task created |
| `task:updated` | Task object | Task modified |
| `task:deleted` | `{ taskId, projectId }` | Task deleted |
| `task:commented` | Task object | New comment added |
| `presence:update` | `{ projectId, users[] }` | Online user list changed |

---

## Design Decisions

### 1. Cursor-Based Pagination (vs Offset)

**Choice:** Cursor pagination anchored on `_id`.

**Why:** MongoDB's `SKIP` degrades linearly with offset because it must scan all skipped documents before returning results. A cursor-based approach uses the indexed `_id` field (`$lt: cursor`) to jump directly — O(log n) regardless of page depth.

**Tradeoff:** You cannot jump to an arbitrary page number. For a dashboard with infinite-scroll or "load more" UX, this is a non-issue.

### 2. Embedded Comments (vs Referenced)

**Choice:** Comments are embedded sub-documents inside `Task`.

**Why:** Comments are virtually always fetched alongside their parent task. Embedding avoids a second database round-trip and allows atomic updates. The `$text` index on `comments.content` also works naturally with embedded documents.

**Tradeoff:** Very active tasks with hundreds of comments will grow the document. MongoDB's 16MB document limit is unlikely to be hit (200 comments × 2KB each = ~400KB), and we cap comment length at 2000 chars.

### 3. Service Layer Architecture

Controllers are kept thin — they only parse requests and call services. Business logic lives in `services/`. This makes unit-testing straightforward (no HTTP scaffolding needed), and isolates framework concerns from domain logic.

### 4. Single-Instance Presence

The `presenceStore` is an in-memory `Map`. For a multi-instance deployment behind a load balancer, replace it with a Redis adapter for Socket.IO (`@socket.io/redis-adapter`) so all nodes share the same presence state.

---

## MongoDB Indexes

| Collection | Index | Purpose |
|------------|-------|---------|
| users | `email` (unique) | Auth lookups |
| projects | `members.user` | Member queries |
| projects | `owner` | Owner queries |
| tasks | `{ project, createdAt }` | Dashboard list |
| tasks | `{ project, status }` | Status filter |
| tasks | `{ project, assignees }` | Assignee filter |
| tasks | `{ project, _id }` | Cursor pagination |
| tasks | Text index on `title, description, comments.content` | Full-text search |
