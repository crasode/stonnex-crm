'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function TopNav() {
  const pathname = usePathname();
  const { data } = useSession();

  const nav = [
    { href: '/', label: 'Dashboard' },
    { href: '/leads', label: 'Leads' },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight text-slate-900">
            <span className="text-brand-600">STONNEX</span> CRM
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium',
                    active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="hidden sm:inline">{data?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
