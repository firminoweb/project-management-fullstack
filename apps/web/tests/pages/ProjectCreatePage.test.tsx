import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { projectsApi } from '@/api/projects';
import { ProjectCreatePage } from '@/pages/ProjectCreatePage';
import { makeProject } from '../fixtures';
import { renderWithProviders } from '../utils';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@/api/projects', () => ({
  projectsApi: { create: vi.fn() },
}));

describe('ProjectCreatePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cria o projeto e navega para o detalhe', async () => {
    vi.mocked(projectsApi.create).mockResolvedValue(makeProject({ id: 'new-1' }));
    renderWithProviders(<ProjectCreatePage />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Novo Projeto' },
    });
    fireEvent.change(screen.getByLabelText(/início/i), {
      target: { value: '2026-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText(/orçamento/i), {
      target: { value: '1000' },
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar projeto' }),
    );

    await waitFor(() =>
      expect(projectsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Novo Projeto', budget: 1000 }),
      ),
    );
    expect(navigateMock).toHaveBeenCalledWith('/projects/new-1');
  });
});
