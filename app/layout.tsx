import './globals.css';
import type { Metadata } from 'next';

import { Toaster } from 'react-hot-toast';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/common/theme-provider';

import NextTopLoader from 'nextjs-toploader';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'Home - Kamna ERP',
    template: '%s - Kamna ERP',
  },
  description: '',
  icons: {
    icon: [{ url: '/images/logo/icon.webp', type: 'image/webp' }],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} antialiased`}>
        <NextTopLoader color="#98FF98" height={2} showSpinner={false} />
        <Toaster position="top-right" reverseOrder={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          themes={['light', 'dark', 'blue', 'green', 'purple', 'orange']}
          storageKey="multi-theme-preference"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
