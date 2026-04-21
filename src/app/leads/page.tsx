import { prisma } from '@/lib/db';
import { TopNav } from '@/components/top-nav';
import { StatusBadge } from '@/components/status-badge';
import { SourceBadge } from '@/components/source-badge';
import type { Prisma } from '@prisma/client';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/status';
import Link from 'next/link';
import { format } from 'date-fns';
import { STATUS_LABEL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Search = { q?: string; source?: string; status?: string; city?: string };

function buildWhere(sp: Search): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  if (sp.source && sp.source !== 'all') where.source = sp.source;
  if (sp.status && sp.status !== 'all' && (LEAD_STATUSES as readonly string[]).includes(sp.status)) {
    where.status = sp.status;
  }
  if (sp.city && sp.city !== 'all') where.city = sp.city;
  if (sp.q) {
    where.OR = [
      { fullName: { contains: sp.q } },
      { email: { contains: sp.q } },
      { phone: { contains: sp.q } },
      { address: { contains: sp.q } },
      { externalId: { contains: sp.q } },
    ];
  }
  return where;
}

export default async function LeadsPage({ searchParams }: { searchParams: Search }) {
  const where = buildWhere(searchParams);
  const [leads, sources, cities] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      take: 500,
    }),
    prisma.lead.findMany({ distinct: ['source'], select: { source: true }, orderBy: { source: 'asc' } }),
    prisma.lead.findMany({
      distinct: ['city'],
      where: { city: { not: null } },
      select: { city: true },
      orderBy: { city: 'asc' },
    }),
  ]);

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">All leads</h1>
            <p className="mt-1 text-sm text-slate-500">{leads.length} matching lead{leads.length === 1 ? '' : 's'}.</p>
          </div>
        </div>

        <form className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search name, email, phone, address…"
            className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <select name="source" defaultValue={searchParams.source ?? 'all'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s.source} value={s.source}>{s.source}</option>
            ))}
          </select>
          <select name="status" defaultValue={searchParams.status ?? 'all'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select name="city" defaultValue={searchParams.city ?? 'all'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-3">
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c.city!} value={c.city!}>{c.city}</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Apply
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Received</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">City</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-500">{format(lead.receivedAt, 'MMM d, yyyy')}</td>
                  <td className="px-4 py-2">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                      {lead.fullName || '(no name)'}
                    </Link>
                    {lead.email && <div className="text-xs text-slate-500">{lead.email}</div>}
                  </td>
                  <td className="px-4 py-2 text-slate-700">{lead.phone || '—'}</td>
                  <td className="px-4 py-2 text-slate-700">{lead.city || '—'}</td>
                  <td className="px-4 py-2"><SourceBadge source={lead.source} /></td>
                  <td className="px-4 py-2"><StatusBadge status={lead.status as LeadStatus} /></td>
                  <td className="px-4 py-2 text-slate-700">{lead.assignedTo || '—'}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No leads match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
