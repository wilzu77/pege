import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { amount } = await req.json();
  if (!amount || amount < 1000) {
    return NextResponse.json({ error: 'Minimal topup Rp 1.000' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const topup = await prisma.topup.create({
    data: {
      userId: user.id,
      amount: Number(amount),
      status: 'PENDING',
    },
  });
  return NextResponse.json({ message: 'OK', topup });
}
