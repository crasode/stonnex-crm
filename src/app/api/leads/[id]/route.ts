import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { LEAD_STATUSES } from '@/lib/status';

const StatusEnum = z.enum(LEAD_STATUSES);

const PatchSchema = z.object({
  status: StatusEnum.optional(),
  assignedTo: z.string().optional().nullable(),
  followUpAt: z.string().datetime().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const current = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const data: Record<string, unknown> = {};
  const activities: { kind: string; meta: string }[] = [];

  if (parsed.data.status && parsed.data.status !== current.status) {
    data.status = parsed.data.status;
    activities.push({
      kind: 'status_change',
      meta: `${current.status} → ${parsed.data.status}`,
    });
  }
  if (parsed.data.assignedTo !== undefined && parsed.data.assignedTo !== current.assignedTo) {
    data.assignedTo = parsed.data.assignedTo || null;
    activities.push({
      kind: 'assigned',
      meta: `${current.assignedTo || '(none)'} → ${parsed.data.assignedTo || '(none)'}`,
    });
  }
  if (parsed.data.followUpAt !== undefined) {
    data.followUpAt = parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : null;
  }

  const updated = await prisma.lead.update({
    where: { id: params.id },
    data,
  });

  if (activities.length > 0) {
    await prisma.activity.createMany({
      data: activities.map((a) => ({
        leadId: params.id,
        kind: a.kind,
        actor: session.user?.email ?? 'admin',
        meta: a.meta,
      })),
    });
  }

  return NextResponse.json(updated);
}
