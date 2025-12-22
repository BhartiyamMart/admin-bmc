import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

export function normalizeImageUrl(url?: string) {
  if (!url) return '/images/avatar.jpg';

  return url.replace(/([^:]\/)\/+/g, '$1');
}
