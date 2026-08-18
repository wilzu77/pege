import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
const MIN_WD = Number(process.env.MIN_WITHDRAWAL) || 10000;
const TAX = Number(process.env.WITHDRAWAL_TAX) || 1000;
const FEE = Number(process.env.WITHDRAWAL_FEE) || 300;
const TOTAL_FEE = TAX + FEE;
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await req.json();
  const wdAmount = Number(amount);

  if (wdAmount < MIN_WD) {
    return NextResponse.json({ error: `Minimal WD Rp ${MIN_WD.toLocaleString()}` }, { status: 400 });
  }
  const required = wdAmount + TOTAL_FEE;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.balance < required) {
    return NextResponse.json(
      { error: `Saldo kurang. Butuh Rp ${required.toLocaleString()} (termasuk biaya Rp ${TOTAL_FEE.toLocaleString()})` },
      { status: 400 }
    );
  }
  const result = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: required } },
    }),
    prisma.withdraw.create({
      data: {
        userId: user.id,
        amount: wdAmount,
        fee: TOTAL_FEE,
        totalDeduct: required,
        status: 'PENDING',
      },
    }),
  ]);
  return NextResponse.json({
    message: 'WD request success',
    newBalance: result[0].balance,
    withdraw: result[1],
  });
}
