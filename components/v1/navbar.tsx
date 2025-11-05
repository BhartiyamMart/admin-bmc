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
            profileUrl: parsed.profileImage || '/images/logo.png',
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
      className={`
        bg-background fixed flex h-14 items-center justify-between border-b px-3 transition duration-150  z-10 md:z-0
        ${isExpanded 
          ? 'left-[var(--sidebar-width)] w-[calc(100vw-var(--sidebar-width))]' 
          : 'left-0 md:left-10 w-full'
        }
      `}
      style={{
        '--sidebar-width': '18rem',
        top: '0',
      } as React.CSSProperties}
    >
      {/* Left Section - Always show sidebar trigger */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="bg-background cursor-pointer rounded-xs" />
      </div>

      {/* Right Section (Theme + User Info) */}
      <div className="flex items-center gap-4 md:mr-13 lg:mr-13">
        <ThemeSwitcher />
        <div className="flex items-center ">
          <Image
            height={10000}
            width={10000}
            src={user.profileUrl}
            alt="Profile"
            className="h-9 w-9 rounded-full border border-gray-300 object-cover"
          />
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
