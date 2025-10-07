// components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store'; // Import your Zustand store

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Get token from Zustand store
  const { token,  } = useAuthStore();

  useEffect(() => {
    const checkAuth = () => {
      // First check Zustand store
      if (token) {
        setIsLoading(false);
        return;
      }

      // Fallback: Check cookies if Zustand store is empty (page refresh)
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (cookieToken) {
        // If token exists in cookies but not in store, redirect to re-initialize
        window.location.reload();
        return;
      }

      // No token found, redirect to login
      router.push('/login');
    };

    // Add small delay to prevent flash
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [token, router]);

  // Show loading spinner while checking authentication
  if (isLoading || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF8C00]"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return <>{children}</>;
}
