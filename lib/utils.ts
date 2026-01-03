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

const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/default-avatar.png'; // Fallback image
  
  // Replace double slashes (except after the protocol) with a single slash
  // This converts .com//uploads/ to .com/uploads/
  return url.replace(/([^:]\/)\/+/g, "$1");
};
export { normalizeImageUrl };
