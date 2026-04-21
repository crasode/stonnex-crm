import { prisma } from '@/lib/db';
import { TopNav } from '@/components/top-nav';
import { StatusBadge } from '@/components/status-badge';
import { SourceBadge } from '@/components/source-badge';
import type { LeadStatus } from '@/lib/status';
import { subDays, startOfDay, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const now = new Date();
  const days = Array.from({ length: 30 }, (_, i) => startOfDay(subDays(now, 29 - i)));
  const thirtyDaysAgo = days[0];

  const [leads, groupedBySource, groupedByStatus] = await Promise.all([
    prisma.lead.findMany({
      where: { receivedAt: { gte: thirtyDaysAgo } },
      select: { receivedAt: true, source: true, status: true },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      where: { receivedAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const perDay = days.map((day) => {
    const next = subDays(day, -1);
    const count = leads.filter((l) => l.receivedAt >= day && l.receivedAt < next).length;
    return { day, count };
  });

  const max = Math.max(1, ...perDay.map((p) => p.count));

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Last 30 days of lead activity.</p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Leads per day (30d)</h2>
          <div className="flex items-end gap-1.5" style={{ height: 160 }}>
            {perDay.map((d) => (
              <div key={d.day.toISOString()} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-brand-500/80 transition hover:bg-brand-600"
                  style={{ height: `${(d.count / max) * 100}%` }}
                  title={`${format(d.day, 'MMM d')}: ${d.count}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>{format(perDay[0].day, 'MMM d')}</span>
            <span>{format(perDay[perDay.length - 1].day, 'MMM d')}</span>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">By source (30d)</h2>
            <ul className="divide-y divide-slate-100">
              {groupedBySource.map((s) => (
                <li key={s.source} className="flex items-center justify-between py-2">
                  <SourceBadge source={s.source} />
                  <span className="font-semibold text-slate-900">{s._count._all}</span>
                </li>
              ))}
              {groupedBySource.length === 0 && <li className="py-2 text-sm text-slate-500">No leads yet.</li>}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Pipeline (all-time)</h2>
            <ul className="divide-y divide-slate-100">
              {groupedByStatus.map((s) => (
                <li key={s.status} className="flex items-center justify-between py-2">
                  <StatusBadge status={s.status as LeadStatus} />
                  <span className="font-semibold text-slate-900">{s._count._all}</span>
                </li>
              ))}
              {groupedByStatus.length === 0 && <li className="py-2 text-sm text-slate-500">No leads yet.</li>}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
