import { PrismaClient, Role, TripStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Use the EXTERNAL host and port from your Render connection string
const adapter = new PrismaPg({
  host: 'dpg-dbfdg5avc2j2c73fnolcg-a.singapore-postgres.render.com', // External hostname
  port: 5432, // External port (Render uses 5432 for external SSL connections)
  database: 'torq_db_25tf',
  user: 'torq_db_25tf_user',
  password: process.env.DB_PASSWORD, 
  ssl: { rejectUnauthorized: false } // Crucial for Render external connections
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting database seed...');

  // Clean up existing test data
  await prisma.trip.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create a Customer
  const customer = await prisma.user.create({
    data: {
      phone: '+254700111222',
      role: Role.CUSTOMER,
      email: 'customer@test.com',
    },
  });

  // 2. Create a Rider
  const rider = await prisma.user.create({
    data: {
      phone: '+254700333444',
      role: Role.RIDER,
      isOnline: true, // This will make "Active Riders" show 1
      email: 'rider@test.com',
    },
  });

  // 3. Create 3 Completed Trips
  for (let i = 0; i < 3; i++) {
    await prisma.trip.create({
      data: {
        customerId: customer.id,
        riderId: rider.id,
        pickupLat: -1.2921,
        pickupLng: 36.8219,
        dropoffLat: -1.3000,
        dropoffLng: 36.8300,
        estimatedFare: 500,
        finalFare: 450, 
        status: TripStatus.COMPLETED,
        rating: 5, 
      },
    });
  }

  // 4. Create 1 In-Progress Trip
  await prisma.trip.create({
    data: {
      customerId: customer.id,
      riderId: rider.id,
      pickupLat: -1.2921,
      pickupLng: 36.8219,
      dropoffLat: -1.3000,
      dropoffLng: 36.8300,
      estimatedFare: 300,
      status: TripStatus.IN_PROGRESS,
    },
  });

  // 5. Create 1 Pending (REQUESTED) Trip
  await prisma.trip.create({
    data: {
      customerId: customer.id,
      pickupLat: -1.2921,
      pickupLng: 36.8219,
      dropoffLat: -1.3000,
      dropoffLng: 36.8300,
      estimatedFare: 200,
      status: TripStatus.REQUESTED,
    },
  });

  console.log('✅ Seeding complete! Dashboard should now show real numbers.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
