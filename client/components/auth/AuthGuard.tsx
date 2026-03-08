'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { initSocket } from '../../lib/socket';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    // Re-init socket on page load (token may have been restored from storage)
    if (accessToken) {
      try { initSocket(accessToken); } catch {}
    }
  }, [isAuthenticated, accessToken, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
