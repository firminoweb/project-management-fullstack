import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { projectsApi } from '@/api/projects';
import { ProjectEditPage } from '@/pages/ProjectEditPage';
import { makeProject } from '../fixtures';
import { renderWithProviders } from '../utils';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@/api/projects', () => ({
  projectsApi: { get: vi.fn(), update: vi.fn() },
}));

function renderEdit() {
  return renderWithProviders(
    <Routes>
      <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
    </Routes>,
    { route: '/projects/p1/edit' },
  );
}

describe('ProjectEditPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('carrega o projeto, edita e salva', async () => {
    vi.mocked(projectsApi.get).mockResolvedValue(
      makeProject({ name: 'Existente' }),
    );
    vi.mocked(projectsApi.update).mockResolvedValue(makeProject());
    renderEdit();

    expect(await screen.findByDisplayValue('Existente')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Editado' },
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );

    await waitFor(() =>
      expect(projectsApi.update).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ name: 'Editado' }),
      ),
    );
    expect(navigateMock).toHaveBeenCalledWith('/projects/p1');
  });
});
