import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="app-header__brand">
            <span className="app-header__logo" aria-hidden="true">
              ◆
            </span>
            Gerenciador de Projetos
          </Link>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </>
  );
}
