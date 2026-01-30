'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Get auth state from Zustand store
  const { bmctoken, employee, user } = useAuthStore();

  // Handle hydration - wait for component to mount on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check auth and redirect after hydration is complete
  useEffect(() => {
    if (!isClient) return;

    // Check if user is authenticated (has both token and employee data)
    const isAuthenticated = Boolean(bmctoken && employee && user);

    if (!isAuthenticated) {
      console.log('❌ Redirecting to /login');
      router.push('/login');
      return;
    }
  }, [isClient, bmctoken, employee, router, user]);

  // Show nothing during SSR and initial hydration
  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}
