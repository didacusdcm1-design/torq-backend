import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('safety')
export class SafetyController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getIncidents() {
    return this.prisma.safetyIncident.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prisma.safetyIncident.update({
      where: { id },
      data: { status }
    });
  }

  // TEMPORARY SEEDER
  @Get('seed')
  async seedIncidents() {
    const existing = await this.prisma.safetyIncident.count();
    if (existing > 0) return { message: "Incidents already exist." };

    await this.prisma.safetyIncident.createMany({
      data: [
        { incidentRef: "SOS-001", type: "SOS", description: "Rider pressed SOS button during a trip.", status: "OPEN", severity: "CRITICAL" },
        { incidentRef: "ACC-002", type: "ACCIDENT", description: "Minor accident at Westlands roundabout.", status: "INVESTIGATING", severity: "HIGH" },
        { incidentRef: "SUS-003", type: "SUSPICIOUS", description: "Customer reported suspicious behavior.", status: "OPEN", severity: "MEDIUM" }
      ]
    });
    return { message: "✅ 3 Dummy incidents created!" };
  }
}
