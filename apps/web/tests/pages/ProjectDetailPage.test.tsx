import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { projectsApi } from '@/api/projects';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import type { AiAnalysis } from '@/types/project';
import { makeProject } from '../fixtures';
import { renderWithProviders } from '../utils';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@/api/projects', () => ({
  projectsApi: {
    get: vi.fn(),
    changeStatus: vi.fn(),
    remove: vi.fn(),
    analyze: vi.fn(),
  },
}));

function renderDetail() {
  return renderWithProviders(
    <Routes>
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
    </Routes>,
    { route: '/projects/p1' },
  );
}

describe('ProjectDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('exibe os dados do projeto', async () => {
    vi.mocked(projectsApi.get).mockResolvedValue(makeProject());
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: 'Projeto Alpha' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Descrição do projeto')).toBeInTheDocument();
  });

  it('mostra o estado de erro quando a busca falha', async () => {
    vi.mocked(projectsApi.get).mockRejectedValue(new Error('Falha ao buscar'));
    renderDetail();

    expect(await screen.findByText('Falha ao buscar')).toBeInTheDocument();
  });

  it('avança o status pelo botão de transição válido', async () => {
    vi.mocked(projectsApi.get).mockResolvedValue(makeProject());
    vi.mocked(projectsApi.changeStatus).mockResolvedValue(
      makeProject({ status: 'APROVADO', statusLabel: 'Aprovado' }),
    );
    renderDetail();
    await screen.findByRole('heading', { name: 'Projeto Alpha' });

    await userEvent.click(
      screen.getByRole('button', { name: /avançar para/i }),
    );

    await waitFor(() =>
      expect(projectsApi.changeStatus).toHaveBeenCalledWith('p1', 'APROVADO'),
    );
  });

  it('gera e exibe a análise de IA', async () => {
    vi.mocked(projectsApi.get).mockResolvedValue(makeProject());
    const analysis: AiAnalysis = {
      projectId: 'p1',
      summary: 'Resumo gerado',
      attentionPoints: ['ponto de atenção 1'],
      executiveRecommendation: 'Recomendação final',
      source: 'fallback',
      generatedAt: '2026-01-01T00:00:00.000Z',
    };
    vi.mocked(projectsApi.analyze).mockResolvedValue(analysis);
    renderDetail();
    await screen.findByRole('heading', { name: 'Projeto Alpha' });

    await userEvent.click(
      screen.getByRole('button', { name: /gerar análise com ia/i }),
    );

    expect(await screen.findByText('Resumo gerado')).toBeInTheDocument();
    expect(screen.getByText('ponto de atenção 1')).toBeInTheDocument();
    expect(screen.getByText('Recomendação final')).toBeInTheDocument();
    expect(screen.getByText(/fallback/i)).toBeInTheDocument();
  });

  it('exclui o projeto após confirmação', async () => {
    vi.mocked(projectsApi.get).mockResolvedValue(makeProject());
    vi.mocked(projectsApi.remove).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderDetail();
    await screen.findByRole('heading', { name: 'Projeto Alpha' });

    await userEvent.click(
      screen.getByRole('button', { name: /excluir projeto/i }),
    );

    await waitFor(() =>
      expect(projectsApi.remove).toHaveBeenCalledWith('p1'),
    );
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
