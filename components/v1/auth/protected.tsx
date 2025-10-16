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
  const { bmctoken, employee } = useAuthStore();

  // Handle hydration - wait for component to mount on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check auth and redirect after hydration is complete
  useEffect(() => {
    if (!isClient) return;

    // Check if user is authenticated (has both token and employee data)
    const isAuthenticated = Boolean(bmctoken && employee);

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isClient, bmctoken, employee, router]);

  // Show nothing during SSR and initial hydration
  if (!isClient) {
    return null;
  }

  // Show loading state while checking auth
  if (!bmctoken || !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}
