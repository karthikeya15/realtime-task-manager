# Synctask — Frontend

A production-grade Next.js 14 frontend for the Real-Time Collaborative Task Manager.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Zustand (global) + TanStack Query (server) |
| Forms | React Hook Form + Zod |
| Real-Time | Socket.IO client |
| Fonts | Playfair Display + DM Sans + JetBrains Mono |
| HTTP | Axios with auto-refresh interceptor |
| Toasts | react-hot-toast |
| Icons | lucide-react |

---

## Project Structure

```
app/
├── layout.tsx              # Root layout, fonts, providers, toaster
├── globals.css             # Tailwind base + custom scrollbar / animations
├── providers.tsx           # React Query provider
├── page.tsx                # Redirects / → /dashboard
├── auth/
│   ├── login/page.tsx      # Login page
│   └── register/page.tsx   # Registration page
├── dashboard/
│   └── page.tsx            # Project list + stats dashboard
└── projects/
    └── [projectId]/
        └── page.tsx        # Kanban / List board + members panel

components/
├── ui/                     # Design system primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx           # StatusBadge, PriorityBadge
│   ├── Avatar.tsx          # Avatar + AvatarGroup
│   ├── Modal.tsx           # Animated portal modal
│   └── Skeleton.tsx        # Loading skeletons
├── auth/
│   └── AuthGuard.tsx       # Route protection wrapper
├── layout/
│   ├── AppShell.tsx        # Sidebar + modal orchestration
│   ├── Sidebar.tsx         # Collapsible nav + project list
│   └── Header.tsx          # Top bar with search + presence
├── projects/
│   ├── ProjectCard.tsx     # Dashboard project card
│   ├── CreateProjectModal.tsx
│   └── MembersPanel.tsx    # Member management
└── tasks/
    ├── TaskCard.tsx         # Draggable task card
    ├── KanbanBoard.tsx      # 5-column drag-and-drop board
    ├── TaskListView.tsx     # Infinite-scroll list
    ├── TaskDetailDrawer.tsx # Side drawer with comments
    └── CreateTaskModal.tsx

hooks/
├── useAuth.ts              # Login / register / logout mutations
├── useProjects.ts          # Project CRUD + member management
├── useTasks.ts             # Task CRUD + infinite scroll + search
├── useSocket.ts            # Socket.IO event subscriptions
└── useDebounce.ts          # Debounce helper

lib/
├── api.ts                  # Axios instance + auto-refresh interceptor
├── socket.ts               # Socket.IO singleton + room helpers
├── queryClient.ts          # TanStack Query client configuration
└── utils.ts                # cn(), formatDate, STATUS_CONFIG, PRIORITY_CONFIG

store/
├── authStore.ts            # Auth state (Zustand + persist)
└── uiStore.ts              # Modal, sidebar, presence, search

types/
└── index.ts                # All shared TypeScript types
```

---

## Setup

### 1. Prerequisites

- Node.js ≥ 18
- Backend running (see backend README)

### 2. Install & Configure

```bash
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SOCKET_URL
npm install
```

### 3. Run

```bash
npm run dev        # Development
npm run build      # Production build
npm start          # Serve production build
npm run type-check # TypeScript validation
```

---

## Key Features

### Authentication
- JWT with auto-refresh — expired tokens are silently renewed via the Axios interceptor. On permanent failure, user is redirected to login.
- Zustand `persist` middleware keeps auth state across page reloads.

### Real-Time
- Socket.IO client connects once on login; the singleton is shared app-wide.
- `useProjectSocket` subscribes to `task:created`, `task:updated`, `task:deleted`, `task:commented`, and `presence:update` events, updating TanStack Query cache automatically — **no polling needed**.
- The presence indicator in the header shows live avatars of everyone viewing the same project.

### Kanban Board
- Drag-and-drop via native HTML5 drag API (no heavy library dependency).
- Dropping a card onto a column fires `PATCH /tasks/:id` with the new status — change is broadcast via WebSocket to all other open sessions instantly.

### Infinite Scroll
- `useInfiniteTasks` uses TanStack Query's `useInfiniteQuery` with cursor-based pagination.
- An `IntersectionObserver` sentinel at the bottom of the list auto-fetches the next page.

### Search
- Debounced search box calls `GET /tasks/search?search=…` against MongoDB's full-text index (title + description + comments).

### Performance
- Skeletons on every loading state.
- `staleTime: 30s` prevents waterfall refetches on navigation.
- Next.js App Router with server components where possible; `'use client'` only on interactive leaves.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.IO server URL |
