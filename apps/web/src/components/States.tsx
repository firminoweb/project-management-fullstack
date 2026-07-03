import type { ReactNode } from 'react';

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Algo deu errado',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state" role="alert">
      <div className="state__icon" aria-hidden="true">
        ⚠️
      </div>
      <p className="state__title">{title}</p>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--outline" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon = '📁',
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="state">
      <div className="state__icon" aria-hidden="true">
        {icon}
      </div>
      <p className="state__title">{title}</p>
      <p>{message}</p>
      {action}
    </div>
  );
}
