import type { Project } from '@/types/project';

/** Projeto de exemplo para os testes, com overrides opcionais. */
export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Projeto Alpha',
    description: 'Descrição do projeto',
    startDate: '2026-01-01',
    endDate: '2026-06-01',
    budget: 1000,
    status: 'EM_ANALISE',
    statusLabel: 'Em análise',
    risk: 'BAIXO',
    riskLabel: 'Baixo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
