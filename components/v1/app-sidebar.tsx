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
import { ChevronRight, LogOut, XIcon, icons, type LucideIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Logout, SidebarData } from '@/apis/auth.api';
import { useAuthStore } from '@/store/auth.store';

// --- Helper Functions ---
const getIconComponent = (iconName: string): LucideIcon => {
  // Fix for common non-standard icon names from API
  const iconMap: Record<string, string> = {
    IdCardLanyard: 'IdCard',
    'Couponse & Offers': 'BadgeIndianRupee', // Handled if the icon field is literal
  };

  const name = iconMap[iconName] || iconName;
  const toPascalCase = (str: string) =>
    str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

  const componentName = toPascalCase(name) as keyof typeof icons;
  return (icons[componentName] as LucideIcon) || ChevronRight;
};

const normalizePath = (p: string) => `/${p.replace(/^\/+/, '')}`;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openMobile, isMobile, state } = useSidebar();
  const logout = useAuthStore((s) => s.logout);

  // 1. Initial State matching your API structure
  const [sidebarData, setSidebarData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const showFullLogo = isMobile ? openMobile : state === 'expanded';

  // 2. Fetching from LocalStorage with payload check
   useEffect(() => {
    const fetchData = async () => {
      try {
        const sidebardata = await SidebarData();
        setSidebarData(sidebardata.payload);
        setIsLoaded(true);
      } catch (err) {
        console.log('Error fetching sidebar data:', err);
      }
    };
    fetchData();
  }, []);
  

 

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(label) ? newSet.delete(label) : newSet.add(label);
      return newSet;
    });
  };

  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await Logout();
      logout();
      localStorage.clear();
      router.replace('/login');
      toast.success('Logged out');
    } catch (error) {
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router]);
  console.log('Sidebar Data:', sidebarData);
 
  if (!isLoaded || !sidebarData) {
    return (
      <>
      <div className="text-muted-foreground flex h-screen items-center justify-center text-sm">Loading sidebar...</div>
      
      </>
    );
  }

  return (
    <Sidebar collapsible="icon" className="z-40">
      <header className="bg-background flex h-14 items-center border-b px-2">
        {showFullLogo ? <LogoFull /> : <Image src={LogoCompact} alt="Logo" width={28} height={28} />}
        <SidebarTrigger className="bg-background ml-auto md:hidden" icon={XIcon} />
      </header>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarData.menus?.map((menu: any) => {
                const menuPath = normalizePath(menu.path || '');
                const isOpen = openMenus.has(menu.label);
                const hasSubItems = menu.menuItems && menu.menuItems.length > 0;
                const MenuIcon = getIconComponent(menu.icon);

                const isActive = hasSubItems
                  ? menu.menuItems.some((s: any) => pathname.startsWith(normalizePath(s.path)))
                  : pathname === menuPath;

                return (
                  <Collapsible key={menu.label} open={isOpen} onOpenChange={() => toggleMenu(menu.label)}>
                    <SidebarMenuItem>
                      {hasSubItems ? (
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={isActive} tooltip={menu.label}>
                            <MenuIcon size={20} />
                            <span>{menu.label}</span>
                            <ChevronRight
                              className={`ml-auto h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      ) : (
                        <SidebarMenuButton asChild isActive={isActive} tooltip={menu.label}>
                          <Link href={menuPath}>
                            <MenuIcon size={20} />
                            <span>{menu.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}

                      {hasSubItems && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {menu.menuItems.map((sub: any) => {
                              const SubIcon = getIconComponent(sub.icon);
                              const subPath = normalizePath(sub.path);
                              return (
                                <SidebarMenuSubItem key={sub.label}>
                                  <SidebarMenuSubButton asChild isActive={pathname.startsWith(subPath)}>
                                    <Link href={subPath}>
                                      <SubIcon size={16} />
                                      <span>{sub.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <footer className="bg-background border-t p-2">
        <SidebarMenuButton onClick={() => setShowLogoutConfirm(true)} className="w-full">
          <LogOut size={16} />
          <span>Logout</span>
        </SidebarMenuButton>
      </footer>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background w-full max-w-sm rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold">Logout?</h2>
            <p className="text-muted-foreground mt-2">Are you sure you want to end your session?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2">
                Cancel
              </button>
              <button onClick={handleLogoutConfirm} className="rounded bg-red-600 px-4 py-2 text-white">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
