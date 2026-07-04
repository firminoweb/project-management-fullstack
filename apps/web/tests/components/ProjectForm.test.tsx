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

const submitButton = () =>
  screen.getByRole('button', { name: 'Criar projeto' });

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
  it('mantém o envio desabilitado enquanto o formulário é inválido', () => {
    setup();
    expect(submitButton()).toBeDisabled();
  });

  it('habilita o envio quando todos os campos ficam válidos', () => {
    setup();
    fillValid();
    expect(submitButton()).toBeEnabled();
  });

  it('valida em tempo real ao tocar um campo inválido (sem submeter)', () => {
    setup();
    const nome = screen.getByLabelText(/nome/i);
    fireEvent.change(nome, { target: { value: 'Portal' } });
    fireEvent.change(nome, { target: { value: '' } });

    expect(screen.getByText('Informe o nome do projeto.')).toBeInTheDocument();
  });

  it('exige término posterior ao início e mantém o envio desabilitado', () => {
    const { onSubmit } = setup();
    fillValid();
    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: '2026-01-01' },
    });

    expect(
      screen.getByText('O término deve ser posterior à data de início.'),
    ).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita orçamento não positivo em tempo real', () => {
    setup();
    fillValid();
    fireEvent.change(screen.getByLabelText(/orçamento/i), {
      target: { value: '-5' },
    });

    expect(
      screen.getByText('O orçamento deve ser um valor positivo.'),
    ).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('exibe o contador de caracteres de nome e descrição', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Portal' },
    });
    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'abc' },
    });
    expect(screen.getByText('6/120')).toBeInTheDocument();
    expect(screen.getByText('3/2000')).toBeInTheDocument();
  });

  it('revela erros de obrigatórios ao sair dos campos (onBlur)', () => {
    setup();
    fireEvent.blur(screen.getByLabelText(/nome/i));
    fireEvent.blur(screen.getByLabelText(/descrição/i));
    fireEvent.blur(screen.getByLabelText(/início/i));
    fireEvent.blur(screen.getByLabelText(/término/i));
    fireEvent.blur(screen.getByLabelText(/orçamento/i));

    expect(screen.getByText('Informe o nome do projeto.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data de início.')).toBeInTheDocument();
    expect(screen.getByText('Informe o orçamento.')).toBeInTheDocument();
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

    await userEvent.click(submitButton());

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
