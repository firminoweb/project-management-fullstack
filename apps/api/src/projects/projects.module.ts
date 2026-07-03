import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiAnalysisService } from './ai/ai-analysis.service';
import { AiClient } from './ai/ai-client';
import { AnthropicAiClient } from './ai/anthropic-ai.client';
import { ProjectAnalysisFallback } from './ai/project-analysis.fallback';
import { ProjectAnalysisPromptBuilder } from './ai/project-analysis.prompt-builder';
import { ProjectOrmEntity } from './persistence/project.orm-entity';
import { SqliteProjectsRepository } from './persistence/sqlite-projects.repository';
import { ProjectsController } from './projects.controller';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { RiskCalculatorService } from './risk/risk-calculator.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectOrmEntity])],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    RiskCalculatorService,
    AiAnalysisService,
    ProjectAnalysisPromptBuilder,
    ProjectAnalysisFallback,
    // Persistência sobre SQLite/TypeORM. O service depende apenas do contrato
    // abstrato — trocar por InMemoryProjectsRepository é só mudar o useClass.
    { provide: ProjectsRepository, useClass: SqliteProjectsRepository },
    // O client real da Anthropic pode ser trocado por outro provedor de IA
    // sem afetar o AiAnalysisService.
    { provide: AiClient, useClass: AnthropicAiClient },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
