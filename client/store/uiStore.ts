import { create } from 'zustand';
import type { ModalType, Task, User } from '@/types';

interface UIStore {
  // Modals
  activeModal: ModalType;
  modalData: Record<string, unknown>;
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Task detail drawer
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;

  // Presence
  onlineUsers: User[];
  setOnlineUsers: (users: User[]) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeModal: null,
  modalData: {},
  openModal: (modal, data = {}) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),

  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
