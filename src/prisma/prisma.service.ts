import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    let dbUrl = process.env.DATABASE_URL;

    // Ensure sslmode=no-verify is present
    if (dbUrl && !dbUrl.includes('sslmode=')) {
      dbUrl = dbUrl.includes('?') 
        ? `${dbUrl}&sslmode=no-verify` 
        : `${dbUrl}?sslmode=no-verify`;
    }

    const adapter = new PrismaPg({ connectionString: dbUrl });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
