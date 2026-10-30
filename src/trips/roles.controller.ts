import { Controller, Get } from '@nestjs/common';

@Controller('roles')
export class RolesController {
  @Get()
  async getRoles() {
    return [
      { id: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Full access to all modules.' },
      { id: 'OPERATIONS_MANAGER', name: 'Operations Manager', description: 'Manages trips, riders, and service areas.' },
      { id: 'FINANCE_OFFICER', name: 'Finance Officer', description: 'Manages payments, wallets, and payouts.' },
      { id: 'SUPPORT_OFFICER', name: 'Support Officer', description: 'Manages tickets and customer complaints.' }
    ];
  }
}
