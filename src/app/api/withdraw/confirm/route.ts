import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { withdrawId } = await req.json();
  if (!withdrawId) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const wd = await prisma.withdraw.findUnique({
    where: { id: withdrawId },
  });
  if (!wd) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (wd.status !== 'PENDING') {
    return NextResponse.json({ error: 'Already processed' }, { status: 400 });
  }
  await prisma.withdraw.update({
    where: { id: withdrawId },
    data: { status: 'SUCCESS' },
  });
  return NextResponse.json({ message: 'WD confirmed (admin telah transfer manual)' });
}
