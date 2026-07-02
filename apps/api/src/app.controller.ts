import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /**
   * Healthcheck simples para verificar se a API está no ar.
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'project-management-api',
      timestamp: new Date().toISOString(),
    };
  }
}
