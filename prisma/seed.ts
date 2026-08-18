import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@domain.com';
  const hashed = await hash('rahasia123', 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrator',
      password: hashed,
      balance: 0,
    },
  });
  console.log('↻ Admin seeded');
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
