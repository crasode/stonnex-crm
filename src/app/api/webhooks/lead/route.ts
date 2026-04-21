import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { normalizeSource, normalizeStatus } from '@/lib/utils';

/**
 * Universal lead webhook endpoint.
 *
 * Security: verifies `?secret=` query against WEBHOOK_SECRET env.
 * Source agnostic — Make.com scenarios (Roofle, Meta Ads, Gmail/Website)
 * can all POST to the same endpoint with a minimal JSON body.
 *
 * Idempotency: if `externalId` is provided, we upsert; otherwise we always create.
 *
 * Minimum required: source + (fullName | phone | email).
 */
const Schema = z.object({
  externalId: z.string().optional(),
  source: z.string(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  service: z.string().optional(),
  estSqFt: z.union([z.number(), z.string()]).optional(),
  quote: z.union([z.number(), z.string()]).optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  receivedAt: z.string().datetime().optional(),
});

function num(v: number | string | undefined): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'bad_json' }, { status: 400 });

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const p = parsed.data;
  const hasIdentity = p.fullName || p.phone || p.email;
  if (!hasIdentity) {
    return NextResponse.json({ error: 'need_name_phone_or_email' }, { status: 400 });
  }

  const data = {
    externalId: p.externalId,
    source: normalizeSource(p.source),
    fullName: p.fullName || null,
    phone: p.phone || null,
    email: p.email || null,
    address: p.address || null,
    city: p.city || null,
    service: p.service || null,
    estSqFt: num(p.estSqFt) ?? null,
    quote: num(p.quote) ?? null,
    status: normalizeStatus(p.status),
    assignedTo: p.assignedTo || null,
    receivedAt: p.receivedAt ? new Date(p.receivedAt) : new Date(),
    rawPayload: JSON.stringify(raw).slice(0, 10_000),
  };

  const lead = p.externalId
    ? await prisma.lead.upsert({
        where: { externalId: p.externalId },
        update: data,
        create: data,
      })
    : await prisma.lead.create({ data });

  await prisma.activity.create({
    data: {
      leadId: lead.id,
      kind: 'webhook_received',
      actor: `webhook:${data.source}`,
      meta: p.externalId ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: lead.id });
}
