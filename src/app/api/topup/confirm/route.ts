import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { topupId } = await req.json();
  if (!topupId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const topup = await prisma.topup.findUnique({
    where: { id: topupId },
    include: { user: true },
  });
  if (!topup) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (topup.status !== 'PENDING') {
    return NextResponse.json({ error: 'Already processed' }, { status: 400 });
  }
  const result = await prisma.$transaction([
    prisma.user.update({
      where: { id: topup.userId },
      data: { balance: { increment: topup.amount } },
    }),
    prisma.topup.update({
      where: { id: topupId },
      data: { status: 'SUCCESS' },
    }),
  ]);
  return NextResponse.json({ message: 'Topup confirmed', newBalance: result[0].balance });
}
