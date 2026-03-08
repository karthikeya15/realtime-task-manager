import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import type { Task, CreateTaskForm, TaskStatus, PaginationMeta } from '../types';

export const taskKeys = {
  all: (projectId: string) => ['tasks', projectId] as const,
  detail: (projectId: string, taskId: string) => ['tasks', projectId, taskId] as const,
  search: (projectId: string, q: string) => ['tasks', projectId, 'search', q] as const,
};

interface TasksPage {
  tasks: Task[];
  pagination: PaginationMeta;
}

interface TaskFilters {
  status?: TaskStatus;
  assignee?: string;
  priority?: string;
}

export function useInfiniteTasks(projectId: string, filters: TaskFilters = {}) {
  return useInfiniteQuery<TasksPage>({
    queryKey: [...taskKeys.all(projectId), filters],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam as string);
      if (filters.status) params.set('status', filters.status);
      if (filters.assignee) params.set('assignee', filters.assignee);
      if (filters.priority) params.set('priority', filters.priority);
      params.set('limit', '20');

      const res = await api.get(`/projects/${projectId}/tasks?${params}`);
      return { tasks: res.data.data, pagination: res.data.meta.pagination };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.nextCursor : undefined,
    initialPageParam: undefined,
    enabled: !!projectId,
  });
}

export function useSearchTasks(projectId: string, query: string) {
  return useQuery<Task[]>({
    queryKey: taskKeys.search(projectId, query),
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/tasks/search?search=${encodeURIComponent(query)}`);
      return res.data.data;
    },
    enabled: !!projectId && query.trim().length > 1,
    staleTime: 10 * 1000,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaskForm) => {
      const res = await api.post(`/projects/${projectId}/tasks`, data);
      return res.data.data as Task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      toast.success('Task created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<CreateTaskForm> }) => {
      const res = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
      return res.data.data as Task;
    },
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(projectId, task._id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      return taskId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      toast.success('Task deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });
}

export function useAssignUsers(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, userIds }: { taskId: string; userIds: string[] }) => {
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/assign`, { userIds });
      return res.data.data as Task;
    },
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

export function useAddComment(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content });
      return res.data.data as Task;
    },
    onSuccess: (task) => {
      qc.setQueryData(taskKeys.detail(projectId, task._id), task);
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });
}

export function useDeleteComment(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, commentId }: { taskId: string; commentId: string }) => {
      const res = await api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
      return res.data.data as Task;
    },
    onSuccess: (task) => {
      qc.setQueryData(taskKeys.detail(projectId, task._id), task);
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      toast.success('Comment deleted');
    },
  });
}
