import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await prisma.topup.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(data);
}
