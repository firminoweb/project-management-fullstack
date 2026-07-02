import { Injectable } from '@nestjs/common';

import { Project } from '../entities/project.entity';
import { PROJECT_STATUS_LABELS } from '../enums/project-status.enum';
import { RISK_LEVEL_LABELS } from '../enums/risk-level.enum';
import { monthsBetween } from '../risk/risk-calculator.service';
import { AiPrompt } from './ai-client';

/**
 * Monta o prompt de análise de um projeto. Mantido isolado do client e do
 * service para deixar explícito "como a integração real seria feita" e
 * facilitar ajustes no formato sem tocar na chamada de rede.
 */
@Injectable()
export class ProjectAnalysisPromptBuilder {
  build(project: Project): AiPrompt {
    const system = [
      'Você é um analista de projetos sênior de uma consultoria.',
      'Gere uma análise objetiva e executiva do projeto informado.',
      'Responda SOMENTE com um objeto JSON válido, sem markdown e sem texto extra,',
      'exatamente nesta forma:',
      '{',
      '  "summary": string,               // resumo do projeto em 1-2 frases',
      '  "attentionPoints": string[],     // 2 a 4 pontos de atenção',
      '  "executiveRecommendation": string // recomendação executiva em 1-2 frases',
      '}',
      'Escreva em português do Brasil.',
    ].join('\n');

    const months = monthsBetween(
      new Date(project.startDate),
      new Date(project.endDate),
    );

    const user = [
      'Dados do projeto:',
      `- Nome: ${project.name}`,
      `- Descrição: ${project.description || '(sem descrição)'}`,
      `- Status atual: ${PROJECT_STATUS_LABELS[project.status]}`,
      `- Risco calculado: ${RISK_LEVEL_LABELS[project.risk]}`,
      `- Orçamento total: R$ ${project.budget.toLocaleString('pt-BR')}`,
      `- Início: ${project.startDate}`,
      `- Previsão de término: ${project.endDate}`,
      `- Duração estimada: ${months.toFixed(1)} meses`,
    ].join('\n');

    return { system, user };
  }
}
