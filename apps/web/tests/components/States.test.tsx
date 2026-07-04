import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState, ErrorState } from '@/components/States';

describe('ErrorState', () => {
  it('mostra a mensagem e dispara onRetry ao clicar', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Falha ao carregar" onRetry={onRetry} />);

    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /tentar novamente/i }),
    );
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('não renderiza o botão de retry quando onRetry não é passado', () => {
    render(<ErrorState message="Erro" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('EmptyState', () => {
  it('renderiza título, mensagem e ação', () => {
    render(
      <EmptyState
        title="Nenhum projeto"
        message="Crie o primeiro"
        action={<button type="button">Criar</button>}
      />,
    );
    expect(screen.getByText('Nenhum projeto')).toBeInTheDocument();
    expect(screen.getByText('Crie o primeiro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument();
  });
});
