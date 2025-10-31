'use client';

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { ThemeSwitcher } from '../common/theme-switcher';

const Navbar = () => {
  const user = {
    name: 'Gaurav',
    profileUrl: '/images/profile.jpg', // Replace with actual path or fetched URL
  };

  return (
    <nav className="bg-background fixed flex h-14 w-full items-center justify-between border-b px-3">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="bg-background cursor-pointer rounded-xs" />
      </div>

      {/* Right Section (Theme + User Info) */}
      <div className="flex items-center gap-4 md:mr-15">
        {/* Theme Switcher */}
        <ThemeSwitcher  />

        {/* User Info */}
        <div className="flex items-center gap-3">
          
           <img
            src={user.profileUrl}
            alt="Profile"
            className="h-9 w-9 rounded-full border border-gray-300 object-cover"
          />
          <span className=" sm:inline text-sm font-medium text-foreground">
            {user.name}
          </span>
         
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
