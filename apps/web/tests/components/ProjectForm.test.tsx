import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Project } from '@/types/project';
import { ProjectForm, type ProjectFormProps } from '@/components/ProjectForm';

function setup(overrides: Partial<ProjectFormProps> = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <ProjectForm
      submitLabel="Criar projeto"
      submitting={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onSubmit, onCancel };
}

function fillValid() {
  fireEvent.change(screen.getByLabelText(/nome/i), {
    target: { value: 'Portal' },
  });
  fireEvent.change(screen.getByLabelText(/início/i), {
    target: { value: '2026-01-01' },
  });
  fireEvent.change(screen.getByLabelText(/término/i), {
    target: { value: '2026-06-01' },
  });
  fireEvent.change(screen.getByLabelText(/orçamento/i), {
    target: { value: '15000.50' },
  });
}

describe('ProjectForm', () => {
  it('valida campos obrigatórios e não chama onSubmit', async () => {
    const { onSubmit } = setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Criar projeto' }),
    );

    expect(screen.getByText('Informe o nome do projeto.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('exige término posterior ao início', async () => {
    const { onSubmit } = setup();
    fillValid();
    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: '2026-01-01' },
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar projeto' }),
    );

    expect(
      screen.getByText('O término deve ser posterior à data de início.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita orçamento não positivo', async () => {
    const { onSubmit } = setup();
    fillValid();
    fireEvent.change(screen.getByLabelText(/orçamento/i), {
      target: { value: '-5' },
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar projeto' }),
    );

    expect(
      screen.getByText('O orçamento deve ser um valor positivo.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia os dados normalizados quando o formulário é válido', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: '  Portal  ' },
    });
    fireEvent.change(screen.getByLabelText(/início/i), {
      target: { value: '2026-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText(/orçamento/i), {
      target: { value: '15000.50' },
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar projeto' }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Portal',
      description: undefined,
      startDate: '2026-01-01',
      endDate: '2026-06-01',
      budget: 15000.5,
    });
  });

  it('pré-preenche os campos no modo edição', () => {
    const initial: Project = {
      id: 'p1',
      name: 'Existente',
      description: 'desc',
      startDate: '2026-02-01',
      endDate: '2026-08-01',
      budget: 2500,
      status: 'APROVADO',
      statusLabel: 'Aprovado',
      risk: 'BAIXO',
      riskLabel: 'Baixo',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    setup({ initial, submitLabel: 'Salvar' });

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Existente');
    expect(screen.getByLabelText(/orçamento/i)).toHaveValue(2500);
  });
});
