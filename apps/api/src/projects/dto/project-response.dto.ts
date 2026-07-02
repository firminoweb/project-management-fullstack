import { Project } from '../entities/project.entity';
import { PROJECT_STATUS_LABELS, ProjectStatus } from '../enums/project-status.enum';
import { RISK_LEVEL_LABELS, RiskLevel } from '../enums/risk-level.enum';

/**
 * Formato de saída de um projeto. Inclui os valores canônicos de status/risco
 * e também os rótulos prontos para exibição, evitando duplicar o mapeamento
 * no frontend.
 */
export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  statusLabel: string;
  risk: RiskLevel;
  riskLabel: string;
  createdAt: string;
  updatedAt: string;

  static fromEntity(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      status: project.status,
      statusLabel: PROJECT_STATUS_LABELS[project.status],
      risk: project.risk,
      riskLabel: RISK_LEVEL_LABELS[project.risk],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
