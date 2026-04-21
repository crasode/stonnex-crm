'use client';

import type { LeadStatus } from '@/lib/status';
import { STATUS_LABEL } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

async function patchLead(id: string, payload: Record<string, unknown>) {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Update failed');
}

async function postNote(id: string, body: string) {
  const res = await fetch(`/api/leads/${id}/notes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error('Note save failed');
}

export function LeadActions({
  leadId,
  currentStatus,
  currentAssignee,
}: {
  leadId: string;
  currentStatus: LeadStatus;
  currentAssignee: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [assignee, setAssignee] = useState(currentAssignee);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      await patchLead(leadId, { status, assignedTo: assignee });
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 text-sm">
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned to</span>
        <input
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="e.g. Calvin"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <button
        onClick={save}
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

export function AddNoteForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [pending, start] = useTransition();
  function submit() {
    if (!body.trim()) return;
    start(async () => {
      await postNote(leadId, body.trim());
      setBody('');
      router.refresh();
    });
  }
  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note — call outcome, next steps, blockers…"
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Add note'}
        </button>
      </div>
    </div>
  );
}
