'use client';

import type React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { DATA } from '@/lib/data';
import LogoFull from './logo-full';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// import { useAuthStore } from '@/store/auth.store';

// Define types for menu items
interface SubMenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: SubMenuItem[];
}

const LoadingSpinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export function AppSidebar() {
  const pathname = usePathname(); 
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  // const { logout } = useAuthStore();

  const toggleMenu = (title: string): void => {
    const newOpenMenus = new Set(openMenus);
    if (newOpenMenus.has(title)) {
      newOpenMenus.delete(title);
    } else {
      newOpenMenus.add(title);
    }
    setOpenMenus(newOpenMenus);
  };

  const isMenuOpen = (title: string): boolean => openMenus.has(title);

  const hasActiveChild = (children: SubMenuItem[] | undefined): boolean => {
    return children?.some((child) => pathname === child.url) ?? false;
  };

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);
const { setSignature, setUser, user, signature } = useUserStore();
  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      // logout();
      router.push('/login');
      setSignature("");
      setUser({});
       
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  }, [router]);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  return (
    <Sidebar collapsible="icon">
      <header className="bg-background flex h-14 items-center border-b px-2">
        <LogoFull />
      </header>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {DATA.sidebar.map((item: MenuItem) => {
                // Simple menu item (no children)
                if (!item.children) {
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title} className="mt-2">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={isActive ? 'bg-border rounded-xs' : ''}
                        tooltip={item.title}
                      >
                        <Link href={item.url!}>
                          <item.icon size={20} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Parent menu item (with children)
                const isOpen = isMenuOpen(item.title);
                const hasActiveSubItem = hasActiveChild(item.children);

                return (
                  <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleMenu(item.title)}>
                    <SidebarMenuItem className="mt-2">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={hasActiveSubItem}
                          className={`w-full rounded-xs ${hasActiveSubItem ? 'bg-border' : ''}`}
                          tooltip={item.title}
                        >
                          <item.icon size={20} />
                          <span>{item.title}</span>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((subItem: SubMenuItem) => {
                            const isSubActive = pathname === subItem.url;

                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                  className={isSubActive ? 'bg-border' : ''}
                                >
                                  <Link href={subItem.url}>
                                    <subItem.icon size={16} />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <footer className="bg-background border-t p-2">
        <SidebarMenuButton
          onClick={handleLogoutClick}
          className="hover:bg-border flex w-full cursor-pointer items-center gap-2 rounded-xs px-2 py-2 text-sm transition-colors"
          tooltip="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </SidebarMenuButton>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px] dark:bg-white/10"
            onClick={handleLogoutCancel}
          />

          {/* Modal */}
          <div className="bg-background relative w-full max-w-xl rounded-xs p-5 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold md:text-xl">Confirm Logout</h3>
            <p className="mb-8 text-sm">Are you sure you want to logout of your account?</p>
            <div className="flex justify-end gap-5">
              <button
                onClick={handleLogoutCancel} // Use isLoggingOut from store
                className="bg-secondary cursor-pointer rounded-xs px-3 py-2 font-semibold transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm} // Use isLoggingOut from store
                className="flex cursor-pointer items-center gap-2 rounded-xs bg-secondary disabled:cursor-not-allowed disabled:opacity-50 px-3 py-2 font-semibold"
              >
                {isLoggingOut && <LoadingSpinner />}
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
