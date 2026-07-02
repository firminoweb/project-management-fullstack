/**
 * Status possíveis de um projeto.
 * Os valores são canônicos (estáveis para a API); os rótulos de exibição
 * ficam em PROJECT_STATUS_LABELS para uso no frontend.
 */
export enum ProjectStatus {
  EM_ANALISE = 'EM_ANALISE',
  APROVADO = 'APROVADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  ENCERRADO = 'ENCERRADO',
  CANCELADO = 'CANCELADO',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.EM_ANALISE]: 'Em análise',
  [ProjectStatus.APROVADO]: 'Aprovado',
  [ProjectStatus.EM_ANDAMENTO]: 'Em andamento',
  [ProjectStatus.ENCERRADO]: 'Encerrado',
  [ProjectStatus.CANCELADO]: 'Cancelado',
};
