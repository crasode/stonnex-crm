import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const Schema = z.object({ body: z.string().min(1).max(10_000) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const author = session.user?.email ?? 'admin';
  const note = await prisma.note.create({
    data: { leadId: params.id, body: parsed.data.body, author },
  });
  await prisma.activity.create({
    data: { leadId: params.id, kind: 'note_added', actor: author, meta: note.id },
  });
  return NextResponse.json(note, { status: 201 });
}
