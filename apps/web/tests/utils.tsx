import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Renderiza um componente com os providers da aplicação (React Query + Router).
 * O cache desativa retry para os testes falharem/rejeitarem de forma imediata.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
