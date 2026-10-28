import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';

async function bootstrap() {
  console.log('🚀 Booting NestJS context to seed database...');
  
  // Create the application context
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

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

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
