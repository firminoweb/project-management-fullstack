import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Layout } from '@/components/Layout';

describe('Layout', () => {
  it('renderiza a marca no cabeçalho e o conteúdo', () => {
    render(
      <MemoryRouter>
        <Layout>
          <p>conteúdo da página</p>
        </Layout>
      </MemoryRouter>,
    );

    expect(screen.getByText('Gerenciador de Projetos')).toBeInTheDocument();
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
  });
});
