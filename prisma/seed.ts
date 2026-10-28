import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  console.log("Connecting to database...");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set!");
  }

  // CRITICAL FIX: Use pg Pool with SSL bypass for Render
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }  // <--- THIS BYPASSES THE SSL HANDSHAKE ERROR
  });

  // Pass the pool to the adapter
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

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
  
  const count = await prisma.rider.count();
  console.log(`✅ Successfully inserted riders! Total in database: ${count}`);
  
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
    process.exit(1);
  });
