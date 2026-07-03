import type { ProjectStatus, RiskLevel } from '../types/project';
import { RISK_LABELS, STATUS_LABELS } from '../types/project';

export function StatusBadge({
  status,
  label,
}: {
  status: ProjectStatus;
  label?: string;
}) {
  return (
    <span className="badge" data-status={status}>
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

export function RiskBadge({
  risk,
  label,
}: {
  risk: RiskLevel;
  label?: string;
}) {
  return (
    <span className="badge" data-risk={risk} title="Risco calculado automaticamente">
      Risco {label ?? RISK_LABELS[risk]}
    </span>
  );
}
