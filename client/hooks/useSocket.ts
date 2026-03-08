'use client';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, joinProjectRoom, leaveProjectRoom } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { taskKeys } from './useTasks';
import type { Task, PresenceUpdate } from '../types';

export function useProjectSocket(projectId: string) {
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setOnlineUsers, selectedTask, setSelectedTask } = useUIStore();
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !projectId) return;

    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      return;
    }

    if (!joinedRef.current) {
      joinProjectRoom(projectId);
      joinedRef.current = true;
    }

    // ── Task Events ───────────────────────────────────────────────────────────
    const onTaskCreated = (_task: Task) => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    };

    const onTaskUpdated = (task: Task) => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      // Keep drawer in sync if this task is open
      if (selectedTask?._id === task._id) setSelectedTask(task);
    };

    const onTaskDeleted = ({ taskId }: { taskId: string }) => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      if (selectedTask?._id === taskId) setSelectedTask(null);
    };

    const onTaskCommented = (task: Task) => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      if (selectedTask?._id === task._id) setSelectedTask(task);
    };

    // ── Presence ──────────────────────────────────────────────────────────────
    const onPresenceUpdate = ({ users }: PresenceUpdate) => {
      setOnlineUsers(users);
    };

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('task:commented', onTaskCommented);
    socket.on('presence:update', onPresenceUpdate);

    return () => {
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('task:commented', onTaskCommented);
      socket.off('presence:update', onPresenceUpdate);

      leaveProjectRoom(projectId);
      joinedRef.current = false;
      setOnlineUsers([]);
    };
  }, [projectId, isAuthenticated]);
}
