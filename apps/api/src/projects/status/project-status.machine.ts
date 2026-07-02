import { ProjectStatus } from '../enums/project-status.enum';

/**
 * Máquina de status do projeto.
 *
 * Fluxo linear (uma etapa por vez, sem pular):
 *   Em análise → Aprovado → Em andamento → Encerrado
 *
 * "Cancelado" é uma saída disponível a partir de qualquer status ATIVO
 * (Em análise, Aprovado, Em andamento).
 *
 * Decisão de interpretação: Encerrado e Cancelado são estados TERMINAIS —
 * não possuem transições de saída. Isso mantém a semântica de máquina de
 * estados e é coerente com a proteção de exclusão de projetos Encerrados.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> =
  {
    [ProjectStatus.EM_ANALISE]: [
      ProjectStatus.APROVADO,
      ProjectStatus.CANCELADO,
    ],
    [ProjectStatus.APROVADO]: [
      ProjectStatus.EM_ANDAMENTO,
      ProjectStatus.CANCELADO,
    ],
    [ProjectStatus.EM_ANDAMENTO]: [
      ProjectStatus.ENCERRADO,
      ProjectStatus.CANCELADO,
    ],
    [ProjectStatus.ENCERRADO]: [],
    [ProjectStatus.CANCELADO]: [],
  };

/** Status que impedem a exclusão do projeto. */
export const NON_DELETABLE_STATUSES: ProjectStatus[] = [
  ProjectStatus.EM_ANDAMENTO,
  ProjectStatus.ENCERRADO,
];

/** Indica se a transição do status atual para o alvo é permitida. */
export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

/** Lista os próximos status válidos a partir do status informado. */
export function nextStatuses(from: ProjectStatus): ProjectStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[from];
}

/** Indica se um projeto no status informado pode ser excluído. */
export function isDeletable(status: ProjectStatus): boolean {
  return !NON_DELETABLE_STATUSES.includes(status);
}
