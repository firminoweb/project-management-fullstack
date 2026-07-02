/**
 * Níveis de risco calculados automaticamente.
 * RISK_ORDER define a severidade para a regra "prevalece o maior risco".
 */
export enum RiskLevel {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.BAIXO]: 'Baixo',
  [RiskLevel.MEDIO]: 'Médio',
  [RiskLevel.ALTO]: 'Alto',
};

export const RISK_ORDER: Record<RiskLevel, number> = {
  [RiskLevel.BAIXO]: 0,
  [RiskLevel.MEDIO]: 1,
  [RiskLevel.ALTO]: 2,
};
