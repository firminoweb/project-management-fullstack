import { Module } from '@nestjs/common';

import { InMemoryProjectsRepository } from './in-memory-projects.repository';
import { ProjectsController } from './projects.controller';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { RiskCalculatorService } from './risk/risk-calculator.service';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    RiskCalculatorService,
    // A implementação in-memory será trocada pela de SQLite/TypeORM
    // sem alterar o service, que depende apenas do contrato abstrato.
    { provide: ProjectsRepository, useClass: InMemoryProjectsRepository },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
