import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { projectsApi } from '../api/projects';
import { renderWithProviders } from '../test/utils';
import type { Project } from '../types/project';
import { ProjectsListPage } from './ProjectsListPage';

vi.mock('../api/projects', () => ({
  projectsApi: {
    list: vi.fn(),
  },
}));

const listMock = vi.mocked(projectsApi.list);

const sample: Project = {
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
};

describe('ProjectsListPage', () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it('mostra o estado vazio quando não há projetos', async () => {
    listMock.mockResolvedValue([]);
    renderWithProviders(<ProjectsListPage />);

    expect(await screen.findByText('Nenhum projeto ainda')).toBeInTheDocument();
  });

  it('lista os projetos retornados pela API', async () => {
    listMock.mockResolvedValue([sample]);
    renderWithProviders(<ProjectsListPage />);

    expect(await screen.findByText('Projeto Alpha')).toBeInTheDocument();
  });

  it('exibe o estado de erro (com retry) quando a API falha', async () => {
    listMock.mockRejectedValue(new Error('Falha na API'));
    renderWithProviders(<ProjectsListPage />);

    expect(await screen.findByText('Falha na API')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /tentar novamente/i }),
    ).toBeInTheDocument();
  });
});
