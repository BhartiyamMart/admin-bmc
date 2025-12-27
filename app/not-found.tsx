'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, MoveLeft, AlertTriangle } from 'lucide-react';
import LogoFull from '@/components/v1/logo-full'; // Adjust path based on your structure

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F9FAFB]">
      {/* Background Pattern - Matching the grid/tiled style from login */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        {/* Logo Section */}
        <div className="mb-12 flex justify-center">
          <LogoFull />
        </div>

        {/* Error Content */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-[#E87C03]/10 p-4">
              <AlertTriangle className="h-12 w-12 text-[#E87C03]" />
            </div>
          </div>

          <h1 className="text-8xl font-black tracking-tighter text-gray-200">404</h1>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Page not found</h2>
            <p className="mx-auto max-w-md text-gray-500">
              Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
          </div>

          {/* Action Buttons - Matching the brand orange from image [file:58] */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
            >
              <MoveLeft className="h-4 w-4" />
              Go Back
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#E87C03] px-6 py-3 font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-[#cf6e02]"
            >
              <Home className="h-4 w-4" />
              Return Dashboard
            </Link>
          </div>
        </div>

        {/* Footer/Help Text */}
        <p className="mt-16 text-sm text-gray-400">
          If you believe this is a technical error, please contact your{' '}
          <span className="font-medium text-[#E87C03]">Bhartiyam Admin</span>.
        </p>
      </div>
    </div>
  );
}
