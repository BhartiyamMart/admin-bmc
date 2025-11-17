'use client';

import React from 'react';
import { SidebarTrigger, useSidebar } from '../ui/sidebar';
import { ThemeSwitcher } from '../common/theme-switcher';
import Image from 'next/image';

const Navbar = () => {
  const { state, isMobile } = useSidebar();
  const storedUser = localStorage.getItem('user');
  const user = storedUser
    ? (() => {
        try {
          const parsed = JSON.parse(storedUser);
          return {
            name: parsed.firstName || 'User',
            email: parsed.email || '',
            profileUrl: parsed.profileImage || '/images/favicon.webp',
          };
        } catch {
          return {
            name: 'User',
            email: '',
            profileUrl: '/images/profile.jpg',
          };
        }
      })()
    : {
        name: 'User',
        email: '',
        profileUrl: '/images/profile.jpg',
      };

  // Calculate navbar positioning based on sidebar state
  const isExpanded = state === 'expanded' && !isMobile;

  return (
    <nav
      className={`bg-background fixed z-10 flex h-14 min-w-[73%] items-center justify-between border-b px-3 transition duration-150 md:z-10 ${
        isExpanded ? 'left-[var(--sidebar-width)] w-[calc(100vw-var(--sidebar-width))]' : 'left-0 w-full md:left-10'
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
        <SidebarTrigger className="bg-background cursor-pointer rounded-xs" />
      </div>

      {/* Right Section (Theme + User Info) */}
      <div className={`flex items-center gap-4 ${isExpanded ? '' : 'md:mr-10'}`}>
        <ThemeSwitcher />
        <div className="flex h-10 w-10 items-center overflow-hidden rounded-full border">
          <Image src={user.profileUrl} alt="Profile" height={40} width={40} className="rounded-full object-cover" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
