import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const riders = [
    { firstName: 'Chadrick', lastName: 'Didacus', email: 'rider@torq.com', phone: '0712345678', status: 'APPROVED' },
    { firstName: 'John', lastName: 'Doe', email: 'john@torq.com', phone: '0722334455', status: 'PENDING' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@torq.com', phone: '0733445566', status: 'REJECTED' },
  ];

  for (const r of riders) {
    await prisma.rider.upsert({
      where: { email: r.email },
      update: {},
      create: r,
    });
  }
  console.log('✅ Successfully inserted 3 dummy riders into the database!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
