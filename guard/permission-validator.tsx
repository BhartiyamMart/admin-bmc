'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '@/store/useSidebar.store';

interface PermissionValidatorProps {
  children: React.ReactNode;
  permissions: string | string[]; // Required permissions to access this component
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission is enough
  onUnauthorized?: () => void;
  redirectTo?: string;
}

export default function PermissionValidator({
  children,
  permissions,
  requireAll = true,
  onUnauthorized,
  redirectTo = '/403',
}: PermissionValidatorProps) {
  const router = useRouter();
  const { userPermissions } = useSidebarStore();

  useEffect(() => {
    // Check if user has required permissions
    const hasAccess = checkUserPermissions(permissions, userPermissions, requireAll);

    if (!hasAccess) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      router.replace(redirectTo);
    }
  }, [permissions, userPermissions, requireAll, router, redirectTo, onUnauthorized]);

  return <>{children}</>;
}

/**
 * Check if user has required permissions
 */
export function checkUserPermissions(
  requiredPermissions: string | string[],
  userPermissions: string[],
  requireAll: boolean = true
): boolean {
  // If no permissions loaded yet, allow access temporarily (prevent blocking during hydration)
  if (!userPermissions || userPermissions.length === 0) {
    return true;
  }

  // Convert single permission to array
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  // If no permissions required, allow access
  if (required.length === 0) {
    return true;
  }

  if (requireAll) {
    // User must have ALL required permissions
    return required.every((permission) => userPermissions.includes(permission));
  } else {
    // User must have AT LEAST ONE of the required permissions
    return required.some((permission) => userPermissions.includes(permission));
  }
}
