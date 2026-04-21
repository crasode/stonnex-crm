import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LeadStatus } from '@/lib/status';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW_LEAD: 'New Lead',
  ATTEMPTED_CONTACT: 'Attempted Contact',
  APPOINTMENT_SET: 'Appointment Set',
  QUOTE_SENT: 'Quote Sent',
  CLOSED_WON: 'Closed Won',
  NOT_INTERESTED: 'Not Interested',
  BAD_LEAD: 'Bad Lead',
  SPAM: 'Spam',
};

export const STATUS_COLOR: Record<LeadStatus, string> = {
  NEW_LEAD: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  ATTEMPTED_CONTACT: 'bg-amber-100 text-amber-800 ring-amber-200',
  APPOINTMENT_SET: 'bg-violet-100 text-violet-800 ring-violet-200',
  QUOTE_SENT: 'bg-sky-100 text-sky-800 ring-sky-200',
  CLOSED_WON: 'bg-green-200 text-green-900 ring-green-300',
  NOT_INTERESTED: 'bg-rose-100 text-rose-800 ring-rose-200',
  BAD_LEAD: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  SPAM: 'bg-slate-200 text-slate-700 ring-slate-300',
};

export const SOURCE_COLOR: Record<string, string> = {
  'Meta Ads': 'bg-blue-100 text-blue-800 ring-blue-200',
  Roofle: 'bg-orange-100 text-orange-800 ring-orange-200',
  'Google Ads': 'bg-red-100 text-red-800 ring-red-200',
  'Website Form': 'bg-purple-100 text-purple-800 ring-purple-200',
  Other: 'bg-slate-100 text-slate-800 ring-slate-200',
};

export function sourceBadge(source: string | null | undefined) {
  if (!source) return SOURCE_COLOR.Other;
  return SOURCE_COLOR[source] ?? SOURCE_COLOR.Other;
}

export function normalizeStatus(raw: string | null | undefined): LeadStatus {
  if (!raw) return 'NEW_LEAD';
  const s = raw.trim().toLowerCase();
  if (s.includes('new')) return 'NEW_LEAD';
  if (s.includes('attempt')) return 'ATTEMPTED_CONTACT';
  if (s.includes('appointment')) return 'APPOINTMENT_SET';
  if (s.includes('quote')) return 'QUOTE_SENT';
  if (s.includes('won')) return 'CLOSED_WON';
  if (s.includes('not interested')) return 'NOT_INTERESTED';
  if (s.includes('bad')) return 'BAD_LEAD';
  if (s.includes('spam')) return 'SPAM';
  return 'NEW_LEAD';
}

export function normalizeSource(raw: string | null | undefined): string {
  if (!raw) return 'Other';
  const s = raw.trim().toLowerCase();
  if (s.includes('meta') || s.includes('facebook')) return 'Meta Ads';
  if (s.includes('roofle') || s.includes('roofquote')) return 'Roofle';
  if (s.includes('google ad') || s.includes('gads')) return 'Google Ads';
  if (s.includes('website') || s.includes('form') || s.includes('gmail')) return 'Website Form';
  return raw.trim();
}
