"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  service: string | null;
  message: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  assignedTo: string | null;
};

const STATUSES = ["new", "contacted", "quoted", "closed", "lost"];

export default function LeadDetail({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes, assignedTo }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Email", lead.email],
              ["Phone", lead.phone],
              ["Address", lead.address],
              ["City", lead.city],
              ["State", lead.state],
              ["ZIP", lead.zip],
              ["Service", lead.service],
              ["Source", lead.source],
              ["Submitted", new Date(lead.createdAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label as string} className="flex gap-2">
                <dt className="w-24 text-gray-500 shrink-0">{label}</dt>
                <dd className="text-gray-900">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          {lead.message && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Message</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded p-3">{lead.message}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Lead Management</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Calvin"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Add internal notes..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}
