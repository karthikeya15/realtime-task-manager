// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  lastSeen: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ── Projects ──────────────────────────────────────────────────────────────────
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface ProjectMember {
  user: User;
  role: MemberRole;
  joinedAt: string;
}

export interface Project {
  id: string;
  _id: string;
  name: string;
  description: string;
  owner: User;
  members: ProjectMember[];
  color: string;
  isArchived: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Comment {
  _id: string;
  author: User;
  content: string;
  createdAt: string;
  editedAt: string | null;
}

export interface Task {
  _id: string;
  id: string;
  title: string;
  description: string;
  project: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: User[];
  createdBy: User;
  dueDate: string | null;
  tags: string[];
  position: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// ── Pagination ─────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  hasNextPage: boolean;
  nextCursor: string | null;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { pagination: PaginationMeta };
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { pagination?: PaginationMeta };
}

export interface ApiError {
  success: false;
  message: string;
  details?: { field: string; message: string }[];
}

// ── Socket ────────────────────────────────────────────────────────────────────
export interface PresenceUpdate {
  projectId: string;
  users: User[];
}

// ── Forms ─────────────────────────────────────────────────────────────────────
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface CreateProjectForm {
  name: string;
  description: string;
  color: string;
}

export interface CreateTaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
}

export interface UpdateTaskForm extends Partial<CreateTaskForm> {}

// ── UI State ─────────────────────────────────────────────────────────────────
export type ModalType =
  | 'create-project'
  | 'edit-project'
  | 'create-task'
  | 'edit-task'
  | 'task-detail'
  | 'add-member'
  | null;

export interface KanbanColumn {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
}
