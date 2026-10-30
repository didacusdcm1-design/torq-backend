import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly prisma: PrismaService) {}

  private defaultRoles = [
    { id: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Full access to all modules.' },
    { id: 'OPERATIONS_MANAGER', name: 'Operations Manager', description: 'Manages trips, riders, and service areas.' },
    { id: 'FINANCE_OFFICER', name: 'Finance Officer', description: 'Manages payments, wallets, and payouts.' },
    { id: 'SUPPORT_OFFICER', name: 'Support Officer', description: 'Manages tickets and customer complaints.' }
  ];

  @Get()
  async getRoles() {
    // Fetch all stored permissions
    const permissions = await this.prisma.rolePermission.findMany();
    
    // Merge default roles with their permissions
    return this.defaultRoles.map(role => {
      const perm = permissions.find(p => p.roleId === role.id);
      return {
        ...role,
        permissions: perm ? perm.permissions.split(',') : []
      };
    });
  }

  @Patch(':id')
  async updateRolePermissions(@Param('id') roleId: string, @Body('permissions') permissions: string[]) {
    const permsString = permissions.join(',');
    
    return this.prisma.rolePermission.upsert({
      where: { roleId },
      update: { permissions: permsString },
      create: { roleId, permissions: permsString }
    });
  }
}
