'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN!);
        const sessionToken = sessionStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN!);

        // If either token exists, authorize
        if (token || sessionToken) {
          setIsAuthorized(true);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);
  if (!isAuthorized) {
    return null;
  }
  return <>{children}</>;
}
