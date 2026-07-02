import { Injectable, Logger } from '@nestjs/common';

import { Project } from '../entities/project.entity';
import { AiClient } from './ai-client';
import {
  ProjectAnalysisContent,
  ProjectAnalysisDto,
} from './dto/project-analysis.dto';
import { ProjectAnalysisFallback } from './project-analysis.fallback';
import { ProjectAnalysisPromptBuilder } from './project-analysis.prompt-builder';

/**
 * Orquestra a análise textual de um projeto.
 * Tenta a IA real (via AiClient) e, em qualquer indisponibilidade ou falha,
 * degrada graciosamente para o fallback local — sem quebrar a requisição.
 */
@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  constructor(
    private readonly aiClient: AiClient,
    private readonly promptBuilder: ProjectAnalysisPromptBuilder,
    private readonly fallback: ProjectAnalysisFallback,
  ) {}

  async analyze(project: Project): Promise<ProjectAnalysisDto> {
    const base = {
      projectId: project.id,
      generatedAt: new Date().toISOString(),
    };

    if (!this.aiClient.isEnabled()) {
      return this.withFallback(
        project,
        base,
        'IA não configurada; análise gerada localmente.',
      );
    }

    try {
      const prompt = this.promptBuilder.build(project);
      const raw = await this.aiClient.complete(prompt);
      const content = this.parse(raw);
      const { provider, model } = this.aiClient.describe();
      return { ...base, ...content, source: 'ai', provider, model };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Falha ao consultar a IA (${reason}); usando fallback local.`,
      );
      return this.withFallback(
        project,
        base,
        'Não foi possível consultar a IA; análise gerada localmente.',
      );
    }
  }

  private withFallback(
    project: Project,
    base: { projectId: string; generatedAt: string },
    notice: string,
  ): ProjectAnalysisDto {
    const content = this.fallback.build(project);
    return { ...base, ...content, source: 'fallback', notice };
  }

  /**
   * Extrai e valida o JSON retornado pelo modelo. Tolera cercas de markdown
   * (```json ... ```); lança em qualquer formato inesperado para acionar o fallback.
   */
  private parse(raw: string): ProjectAnalysisContent {
    const cleaned = raw
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('Resposta da IA não contém um objeto JSON.');
    }

    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    if (!this.isValidContent(parsed)) {
      throw new Error('Resposta da IA não segue o formato esperado.');
    }

    return {
      summary: parsed.summary,
      attentionPoints: parsed.attentionPoints,
      executiveRecommendation: parsed.executiveRecommendation,
    };
  }

  private isValidContent(value: unknown): value is ProjectAnalysisContent {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
      typeof candidate.summary === 'string' &&
      Array.isArray(candidate.attentionPoints) &&
      candidate.attentionPoints.every((item) => typeof item === 'string') &&
      typeof candidate.executiveRecommendation === 'string'
    );
  }
}
