'use client';

import React from 'react';

import { SidebarTrigger } from '../ui/sidebar';
import { ThemeSwitcher } from '../common/theme-switcher';

const Navbar = () => {
  return (
    <nav className={`bg-background fixed flex h-14 w-full items-center border-b px-3`}>
      <div className="flex w-fit items-center gap-5">
        <SidebarTrigger className="bg-background cursor-pointer rounded-xs" />
        <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default Navbar;
