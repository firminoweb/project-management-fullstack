import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RiskBadge, StatusBadge } from './Badges';

describe('StatusBadge', () => {
  it('usa o rótulo padrão do status quando nenhum é passado', () => {
    render(<StatusBadge status="EM_ANDAMENTO" />);
    expect(screen.getByText('Em andamento')).toBeInTheDocument();
  });

  it('expõe o status via data-status (para estilização)', () => {
    render(<StatusBadge status="CANCELADO" label="Cancelado" />);
    expect(screen.getByText('Cancelado')).toHaveAttribute(
      'data-status',
      'CANCELADO',
    );
  });
});

describe('RiskBadge', () => {
  it('exibe o nível de risco com prefixo e data-risk', () => {
    render(<RiskBadge risk="ALTO" />);
    const badge = screen.getByText(/Risco Alto/);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-risk', 'ALTO');
  });
});
