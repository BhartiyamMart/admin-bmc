'use client';

import React from 'react';
import { SidebarTrigger, useSidebar } from '../ui/sidebar';
import { ThemeSwitcher } from '../common/theme-switcher';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store'; // Import the auth store

const Navbar = () => {
  const { state, isMobile } = useSidebar();
  const { user } = useAuthStore(); // Get user from Zustand store

  // Safely extract profile photo with fallback
  const profilePhoto = user?.profile?.photo || '/images/favicon.webp';
  const userName = user?.profile?.name || 'User';

  // Calculate navbar positioning based on sidebar state
  const isExpanded = state === 'expanded' && !isMobile;

  return (
    <nav
      className={`bg-background fixed flex h-14 min-w-[72%] items-center justify-between border-b px-3 transition duration-150 md:z-10 ${
        isExpanded ? 'left-(--sidebar-width) w-[calc(100vw-var(--sidebar-width))]' : 'left-0 w-full md:left-10'
      } `}
      style={
        {
          '--sidebar-width': '18rem',
          top: '0',
        } as React.CSSProperties
      }
    >
      {/* Left Section - Always show sidebar trigger */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="bg-background cursor-pointer rounded" />
      </div>

      {/* Right Section (Theme + User Info) */}
      <div className={`flex items-center gap-4 ${isExpanded ? 'md:mr-10 lg:mr-0' : 'md:mr-10'}`}>
        <ThemeSwitcher />
        <div className="flex h-10 w-10 items-center rounded-full border">
          <Image
            src={profilePhoto}
            alt={userName}
            height={40}
            width={40}
            className="h-full w-full rounded-full object-contain object-center"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
