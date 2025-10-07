'use client';

import * as React from 'react';
import { Monitor, Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
  blue: Palette,
  green: Palette,
  purple: Palette,
  orange: Palette,
};

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  blue: 'Ocean Blue',
  green: 'Forest Green',
  purple: 'Royal Purple',
  orange: 'Sunset Orange',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const CurrentIcon = themeIcons[theme as keyof typeof themeIcons] || Palette;
  const themes = ['light', 'dark', 'system', 'blue', 'green', 'purple', 'orange'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CurrentIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const Icon = themeIcons[themeOption as keyof typeof themeIcons] || Palette;
          return (
            <DropdownMenuItem
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={theme === themeOption ? 'bg-accent' : ''}
            >
              <Icon className="mr-2 h-4 w-4" />
              {themeLabels[themeOption as keyof typeof themeLabels]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
