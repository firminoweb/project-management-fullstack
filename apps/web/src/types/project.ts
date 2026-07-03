export type ProjectStatus =
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'EM_ANDAMENTO'
  | 'ENCERRADO'
  | 'CANCELADO';

export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO';

/** Projeto conforme retornado pela API (ProjectResponseDto). */
export interface Project {
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
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

/** Resposta de GET /projects/:id/ai-analysis. */
export interface AiAnalysis {
  projectId: string;
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
  source: 'ai' | 'fallback';
  provider?: string;
  model?: string;
  notice?: string;
  generatedAt: string;
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  EM_ANALISE: 'Em análise',
  APROVADO: 'Aprovado',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  BAIXO: 'Baixo',
  MEDIO: 'Médio',
  ALTO: 'Alto',
};

/**
 * Espelha a máquina de status do backend para exibir apenas as ações válidas.
 * A validação final continua no servidor; aqui é só orientação de UI.
 */
export const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  EM_ANALISE: ['APROVADO', 'CANCELADO'],
  APROVADO: ['EM_ANDAMENTO', 'CANCELADO'],
  EM_ANDAMENTO: ['ENCERRADO', 'CANCELADO'],
  ENCERRADO: [],
  CANCELADO: [],
};

const NON_DELETABLE_STATUSES: ProjectStatus[] = ['EM_ANDAMENTO', 'ENCERRADO'];

export function isDeletable(status: ProjectStatus): boolean {
  return !NON_DELETABLE_STATUSES.includes(status);
}

/** Rótulo do botão que leva a um determinado status alvo. */
export function transitionLabel(target: ProjectStatus): string {
  return target === 'CANCELADO'
    ? 'Cancelar projeto'
    : `Avançar para "${STATUS_LABELS[target]}"`;
}
