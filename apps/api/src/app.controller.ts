import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  /**
   * Healthcheck simples para verificar se a API está no ar.
   */
  @ApiOperation({ summary: 'Verifica se a API está no ar' })
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'project-management-api',
      timestamp: new Date().toISOString(),
    };
  }
}
