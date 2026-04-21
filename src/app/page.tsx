import { prisma } from '@/lib/db';
import { TopNav } from '@/components/top-nav';
import { StatusBadge } from '@/components/status-badge';
import { SourceBadge } from '@/components/source-badge';
import { formatDistanceToNow, subDays, startOfDay } from 'date-fns';
import Link from 'next/link';
import type { LeadStatus } from '@/lib/status';

export const dynamic = 'force-dynamic';

async function getStats() {
  const now = new Date();
  const weekAgo = subDays(startOfDay(now), 7);

  const [total, lastWeek, bySource, byStatus, recent] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { receivedAt: { gte: weekAgo } } }),
    prisma.lead.groupBy({
      by: ['source'],
      where: { receivedAt: { gte: weekAgo } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      orderBy: { receivedAt: 'desc' },
      take: 12,
    }),
  ]);

  return { total, lastWeek, bySource, byStatus, recent };
}

export default async function DashboardPage() {
  const { total, lastWeek, bySource, byStatus, recent } = await getStats();
  const won = byStatus.find((b) => b.status === 'CLOSED_WON')?._count._all ?? 0;
  const quoteSent = byStatus.find((b) => b.status === 'QUOTE_SENT')?._count._all ?? 0;
  const convRate = total > 0 ? ((won / total) * 100).toFixed(1) : '—';

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Live view of your lead pipeline.</p>
          </div>
          <Link
            href="/leads"
            className="rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            View all leads →
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total leads" value={total} />
          <Stat label="Last 7 days" value={lastWeek} />
          <Stat label="Quote sent" value={quoteSent} />
          <Stat label="Close rate" value={`${convRate}%`} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card title="Leads by source (last 7 days)">
            {bySource.length === 0 ? (
              <EmptyHint />
            ) : (
              <ul className="divide-y divide-slate-100">
                {bySource.map((s) => (
                  <li key={s.source} className="flex items-center justify-between py-2">
                    <SourceBadge source={s.source} />
                    <span className="font-semibold text-slate-900">{s._count._all}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Pipeline by status">
            {byStatus.length === 0 ? (
              <EmptyHint />
            ) : (
              <ul className="divide-y divide-slate-100">
                {byStatus.map((s) => (
                  <li key={s.status} className="flex items-center justify-between py-2">
                    <StatusBadge status={s.status as LeadStatus} />
                    <span className="font-semibold text-slate-900">{s._count._all}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <Card title="Recent leads">
            {recent.length === 0 ? (
              <EmptyHint />
            ) : (
              <div className="-mx-5 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-2">When</th>
                      <th className="px-5 py-2">Name</th>
                      <th className="px-5 py-2">Source</th>
                      <th className="px-5 py-2">City</th>
                      <th className="px-5 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recent.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="px-5 py-2 text-slate-500">
                          {formatDistanceToNow(lead.receivedAt, { addSuffix: true })}
                        </td>
                        <td className="px-5 py-2 font-medium text-slate-900">
                          <Link href={`/leads/${lead.id}`} className="hover:text-brand-700">
                            {lead.fullName || '(no name)'}
                          </Link>
                        </td>
                        <td className="px-5 py-2"><SourceBadge source={lead.source} /></td>
                        <td className="px-5 py-2 text-slate-700">{lead.city || '—'}</td>
                        <td className="px-5 py-2"><StatusBadge status={lead.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function EmptyHint() {
  return (
    <p className="text-sm text-slate-500">
      No leads yet. Leads will appear here as soon as Make.com sends a webhook, or after you run the import script.
    </p>
  );
}
