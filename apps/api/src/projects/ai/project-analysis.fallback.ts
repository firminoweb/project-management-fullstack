import { Injectable } from '@nestjs/common';

import { Project } from '../entities/project.entity';
import { PROJECT_STATUS_LABELS, ProjectStatus } from '../enums/project-status.enum';
import { RISK_LEVEL_LABELS, RiskLevel } from '../enums/risk-level.enum';
import { monthsBetween } from '../risk/risk-calculator.service';
import { ProjectAnalysisContent } from './dto/project-analysis.dto';

/**
 * Geração local e determinística da análise (fallback / "Opção B" do desafio).
 * Usada quando não há IA configurada ou quando a chamada real falha, mantendo
 * a mesma estrutura de saída da integração real.
 */
@Injectable()
export class ProjectAnalysisFallback {
  build(project: Project): ProjectAnalysisContent {
    const statusLabel = PROJECT_STATUS_LABELS[project.status];
    const riskLabel = RISK_LEVEL_LABELS[project.risk];
    const months = monthsBetween(
      new Date(project.startDate),
      new Date(project.endDate),
    );
    const budget = `R$ ${project.budget.toLocaleString('pt-BR')}`;

    const summary =
      `O projeto "${project.name}" está com status "${statusLabel}", ` +
      `orçamento de ${budget} e duração estimada de ${months.toFixed(1)} meses, ` +
      `resultando em risco ${riskLabel.toLowerCase()}.`;

    return {
      summary,
      attentionPoints: this.attentionPoints(project, months),
      executiveRecommendation: this.recommendation(project),
    };
  }

  private attentionPoints(project: Project, months: number): string[] {
    const points: string[] = [];

    if (project.risk === RiskLevel.ALTO) {
      points.push(
        'Projeto classificado como alto risco: recomenda-se acompanhamento próximo e revisão de escopo.',
      );
    } else if (project.risk === RiskLevel.MEDIO) {
      points.push(
        'Risco médio: manter monitoramento de orçamento e prazo ao longo da execução.',
      );
    } else {
      points.push('Risco baixo: indicadores de orçamento e prazo sob controle.');
    }

    if (project.budget > 500_000) {
      points.push(
        'Orçamento elevado (acima de R$ 500.000): reforçar controles financeiros e aprovações.',
      );
    }

    if (months > 6) {
      points.push(
        'Prazo superior a 6 meses: atenção a marcos intermediários para evitar atrasos acumulados.',
      );
    }

    if (project.status === ProjectStatus.EM_ANALISE) {
      points.push('Projeto ainda em análise: aguardando aprovação para iniciar.');
    }

    return points;
  }

  private recommendation(project: Project): string {
    if (project.status === ProjectStatus.CANCELADO) {
      return 'Projeto cancelado: registrar aprendizados e encerrar formalmente as pendências.';
    }
    if (project.status === ProjectStatus.ENCERRADO) {
      return 'Projeto encerrado: consolidar resultados e documentar as lições aprendidas.';
    }
    if (project.risk === RiskLevel.ALTO) {
      return 'Recomenda-se aprovação condicionada a um plano de mitigação de riscos e revisão de orçamento.';
    }
    if (project.risk === RiskLevel.MEDIO) {
      return 'Projeto viável; prosseguir com monitoramento periódico de prazo e custos.';
    }
    return 'Projeto de baixo risco; recomenda-se prosseguir conforme o planejamento atual.';
  }
}
