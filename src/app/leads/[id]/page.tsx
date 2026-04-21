import { prisma } from '@/lib/db';
import { TopNav } from '@/components/top-nav';
import { StatusBadge } from '@/components/status-badge';
import { SourceBadge } from '@/components/source-badge';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { LeadActions, AddNoteForm } from './actions-client';
import type { LeadStatus } from '@/lib/status';

export const dynamic = 'force-dynamic';

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      activities: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!lead) return notFound();

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {lead.fullName || '(no name)'}
          </h1>
          <SourceBadge source={lead.source} />
          <StatusBadge status={lead.status as LeadStatus} />
          <span className="ml-auto text-sm text-slate-500">
            Received {format(lead.receivedAt, 'MMM d, yyyy • h:mm a')}
          </span>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Contact</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <Info label="Phone" value={lead.phone} />
              <Info label="Email" value={lead.email} />
              <Info label="Address" value={lead.address} />
              <Info label="City" value={lead.city} />
              <Info label="Service" value={lead.service} />
              <Info label="Est. sq ft" value={lead.estSqFt?.toString()} />
              <Info label="Quote" value={lead.quote ? `$${lead.quote.toLocaleString()}` : null} />
              <Info label="External ID" value={lead.externalId} />
            </dl>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Actions</h2>
            <LeadActions
              leadId={lead.id}
              currentStatus={lead.status as LeadStatus}
              currentAssignee={lead.assignedTo ?? ''}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Notes ({lead.notes.length})</h2>
          <AddNoteForm leadId={lead.id} />
          <ul className="mt-4 space-y-3">
            {lead.notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="mb-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{note.author}</span> ·{' '}
                  {format(note.createdAt, 'MMM d, h:mm a')}
                </div>
                <div className="whitespace-pre-wrap text-slate-800">{note.body}</div>
              </li>
            ))}
            {lead.notes.length === 0 && (
              <li className="text-sm text-slate-500">No notes yet. Add one above to start tracking.</li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Activity</h2>
          <ul className="space-y-2 text-sm">
            {lead.activities.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
                <div>
                  <span className="font-medium text-slate-800">{a.kind.replace(/_/g, ' ')}</span>
                  {a.actor && <span className="text-slate-500"> by {a.actor}</span>}
                  {a.meta && <div className="text-xs text-slate-500">{a.meta}</div>}
                </div>
                <div className="shrink-0 text-xs text-slate-400">
                  {format(a.createdAt, 'MMM d, h:mm a')}
                </div>
              </li>
            ))}
            {lead.activities.length === 0 && (
              <li className="text-sm text-slate-500">No activity recorded yet.</li>
            )}
          </ul>
        </section>
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-slate-900">{value || <span className="text-slate-400">—</span>}</dd>
    </>
  );
}
