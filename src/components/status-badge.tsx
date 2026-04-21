import type { LeadStatus } from '@/lib/status';
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/utils';

export function StatusBadge({ status }: { status: LeadStatus | string }) {
  const s = (status in STATUS_LABEL ? status : 'NEW_LEAD') as LeadStatus;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_COLOR[s]}`}
    >
      {STATUS_LABEL[s]}
    </span>
  );
}
