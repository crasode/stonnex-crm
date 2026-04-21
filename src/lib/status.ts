export const LEAD_STATUSES = [
  'NEW_LEAD',
  'ATTEMPTED_CONTACT',
  'APPOINTMENT_SET',
  'QUOTE_SENT',
  'CLOSED_WON',
  'NOT_INTERESTED',
  'BAD_LEAD',
  'SPAM',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === 'string' && (LEAD_STATUSES as readonly string[]).includes(v);
}
