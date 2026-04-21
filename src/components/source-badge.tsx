import { sourceBadge } from '@/lib/utils';

export function SourceBadge({ source }: { source: string | null | undefined }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${sourceBadge(source)}`}
    >
      {source ?? 'Other'}
    </span>
  );
}
