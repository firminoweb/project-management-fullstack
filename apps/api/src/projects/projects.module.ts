import { Module } from '@nestjs/common';

import { AiAnalysisService } from './ai/ai-analysis.service';
import { AiClient } from './ai/ai-client';
import { AnthropicAiClient } from './ai/anthropic-ai.client';
import { ProjectAnalysisFallback } from './ai/project-analysis.fallback';
import { ProjectAnalysisPromptBuilder } from './ai/project-analysis.prompt-builder';
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
    AiAnalysisService,
    ProjectAnalysisPromptBuilder,
    ProjectAnalysisFallback,
    // A implementação in-memory será trocada pela de SQLite/TypeORM
    // sem alterar o service, que depende apenas do contrato abstrato.
    { provide: ProjectsRepository, useClass: InMemoryProjectsRepository },
    // O client real da Anthropic pode ser trocado por outro provedor de IA
    // sem afetar o AiAnalysisService.
    { provide: AiClient, useClass: AnthropicAiClient },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
