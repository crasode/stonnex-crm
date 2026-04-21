"use client";

import { useState } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  createdAt: Date;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  service: string | null;
  source: string | null;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  quoted: "bg-purple-100 text-purple-800",
  closed: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

export default function LeadTable({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = leads.filter((l) => {
    const matchesSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.phone ?? "").includes(search);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="px-6 py-3 flex gap-3 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Contact", "Location", "Service", "Source", "Status", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/leads/${lead.id}`} className="font-medium text-blue-600 hover:underline">
                    {lead.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div>{lead.email ?? "—"}</div>
                  <div>{lead.phone ?? "—"}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.city ?? lead.state ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{lead.service ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{lead.source ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
