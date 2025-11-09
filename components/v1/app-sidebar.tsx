'use client';
import React, { useEffect, useState, useCallback } from 'react';
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import LogoFull from './logo-full';
import LogoCompact from '../../public/images/favicon.webp';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, LogOut, XIcon, type LucideIcon } from 'lucide-react';
import { icons } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Logout } from '@/apis/auth.api';
import { useAuthStore } from '@/store/auth.store';


interface SidebarMenuItem {
  label: string;
  path: string;
  icon: string;
  order: number;
  description?: string;
}


interface SidebarMenu {
  label: string;
  icon: string;
  path: string;
  order: number;
  menuItems: SidebarMenuItem[];
}


interface SidebarData {
  menus: SidebarMenu[];
  totalMenus: number;
  totalMenuItems: number;
  role: string;
}

// Helper function to get icon component by name
const getIconComponent = (iconName: string): LucideIcon => {
  type IconComponentName = keyof typeof icons;
  
  // Convert kebab-case to PascalCase if needed
  const toPascalCase = (str: string) =>
    str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

  const componentName = toPascalCase(iconName);

  // Check if it's a valid icon component
  if (componentName in icons) {
    return icons[componentName as IconComponentName] as LucideIcon;
  }

  // Return ChevronRight as fallback
  return ChevronRight;
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { openMobile, isMobile, state } = useSidebar();
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);


  const showFullLogo = isMobile ? openMobile : state === 'expanded';
  const logout = useAuthStore((s) => s.logout);


  useEffect(() => {
    try {
      const storedSidebar = localStorage.getItem('sidebar');
      if (storedSidebar) {
        const parsedSidebar: SidebarData = JSON.parse(storedSidebar);
        setSidebarData(parsedSidebar);
      }
    } catch (error) {
      console.error('Error reading sidebar from localStorage:', error);
    }
  }, []);


  const toggleMenu = (label: string): void => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };


  const isMenuOpen = (label: string): boolean => openMenus.has(label);


  // Auto-open parent menu if a child is active
  useEffect(() => {
    if (!sidebarData) return;
    const newOpenMenus = new Set<string>();


    sidebarData.menus.forEach((menu) => {
      const hasActiveSub = menu.menuItems.some((child) =>
        pathname.startsWith(`/${child.path}`)
      );
      if (hasActiveSub) {
        newOpenMenus.add(menu.label);
      }
    });


    setOpenMenus(newOpenMenus);
  }, [pathname, sidebarData]);


  const handleLogoutClick = useCallback(() => setShowLogoutConfirm(true), []);
  const handleLogoutCancel = useCallback(() => setShowLogoutConfirm(false), []);
  const performClientLogout = useCallback(() => {
    logout();
    useAuthStore.persist.clearStorage();
    localStorage.removeItem('sidebar');
    localStorage.removeItem('user');
    localStorage.removeItem('employee-role');
    useAuthStore.persist.rehydrate();
  }, [logout]);


  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await Logout();
      if (response?.error) toast.error(response.message);
      performClientLogout();
      toast.success('Logged out');
      router.replace('/login');
    } catch (error) {
      console.error(error);
      performClientLogout();
      toast.success('Logged out');
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  }, [performClientLogout, router]);


  if (!sidebarData) {
    return <div className="text-muted-foreground flex h-screen items-center justify-center text-sm">Loading sidebar...</div>;
  }


  return (
    <Sidebar collapsible="icon" className='z-100'>
      <header className="bg-background flex h-14 items-center border-b px-2 [@media(max-width:639px)]:justify-between">
        {showFullLogo ? (
          <LogoFull />
        ) : (
          <Image src={LogoCompact} alt="Logo" width={40} height={40} className="h-7 w-7 object-contain" />
        )}
        <SidebarTrigger className="bg-background cursor-pointer rounded-xs md:hidden" icon={XIcon} />
      </header>


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarData.menus.map((menu) => {
                const isOpen = isMenuOpen(menu.label);
                const hasSubItems = menu.menuItems && menu.menuItems.length > 0;


                const hasActiveSubItem = hasSubItems
                  ? menu.menuItems.some((child) => pathname.startsWith(`/${child.path}`))
                  : pathname === menu.path || pathname === `/${menu.path}`;


                const MenuIcon = getIconComponent(menu.icon);


                // If menuItems empty → direct link
                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={menu.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={hasActiveSubItem}
                        className={`w-full rounded-xs ${
                          hasActiveSubItem ? 'bg-border text-primary font-medium' : ''
                        }`}
                        tooltip={menu.label}
                      >
                        <Link href={menu.path || '#'} className="flex items-center gap-2">
                          <MenuIcon size={20} />
                          <span>{menu.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }


                // If has submenu → collapsible
                return (
                  <Collapsible key={menu.label} open={isOpen} onOpenChange={() => toggleMenu(menu.label)}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={hasActiveSubItem}
                          className={`w-full rounded-xs ${
                            hasActiveSubItem ? 'bg-border text-primary font-medium' : ''
                          }`}
                          tooltip={menu.label}
                        >
                          <MenuIcon size={20} />
                          <span>{menu.label}</span>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-transform ${
                              isOpen ? 'rotate-90' : ''
                            }`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>


                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {menu.menuItems.map((sub) => {
                            const isSubActive = pathname.startsWith(`/${sub.path}`);
                            const SubIcon = getIconComponent(sub.icon);


                            return (
                              <SidebarMenuSubItem key={sub.label}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                  className={`${
                                    isSubActive ? 'bg-border text-primary font-semibold' : ''
                                  }`}
                                >
                                  <Link href={`/${sub.path}`} className="flex items-center gap-2">
                                    <SubIcon size={16} />
                                    <span className="text-[13px]">{sub.label}</span>
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
          disabled={isLoggingOut}
          className="hover:bg-border flex w-full cursor-pointer items-center gap-2 rounded-xs px-2 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          tooltip="Logout"
        >
          <LogOut size={16} />
          <span className='cursor-pointer'>Logout</span>
        </SidebarMenuButton>
      </footer>


      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px] dark:bg-white/10"
            onClick={!isLoggingOut ? handleLogoutCancel : undefined}
          />
          <div className="bg-background relative w-full max-w-xl rounded-xs p-5 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold md:text-xl">Confirm Logout</h3>
            <p className="mb-8 text-sm">Are you sure you want to logout of your account?</p>
            <div className="flex justify-end gap-5">
              <button
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
                className="bg-secondary cursor-pointer rounded-xs px-3 py-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="flex cursor-pointer items-center gap-2 rounded-xs bg-red-500 px-3 py-2 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
