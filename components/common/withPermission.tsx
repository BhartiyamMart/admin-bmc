import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ComponentType, FC } from 'react';

export function withPermission<P extends object>(
  Component: ComponentType<P>,
  requiredPermission: string
): FC<P> {
  const ProtectedPage: FC<P> = (props) => {
    const router = useRouter();

    const permissions: string[] = JSON.parse(
      (typeof window !== 'undefined'
        ? localStorage.getItem('permissions')
        : '[]') || '[]'
    );

    useEffect(() => {
      if (!permissions.includes(requiredPermission)) {
        router.replace('/access-denied');
      }
      
    }, [permissions, router]);

    return <Component {...props} />;
  };

  return ProtectedPage;
}
