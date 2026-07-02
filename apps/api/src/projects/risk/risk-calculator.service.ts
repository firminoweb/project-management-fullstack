import { Injectable } from '@nestjs/common';

import { RISK_ORDER, RiskLevel } from '../enums/risk-level.enum';

export interface RiskInput {
  budget: number;
  startDate: string | Date;
  endDate: string | Date;
}

// Limites das regras de negócio (orçamento em R$, prazo em meses).
const BUDGET_LOW_MAX = 100_000; // até 100.000 => baixo
const BUDGET_MEDIUM_MAX = 500_000; // até 500.000 => médio; acima => alto
const MONTHS_LOW_MAX = 3; // até 3 meses => baixo
const MONTHS_MEDIUM_MAX = 6; // até 6 meses => médio; acima => alto

/**
 * Diferença aproximada em meses entre duas datas.
 * Usa a diferença de ano/mês e converte o resto de dias em fração de mês
 * (base 30). Assim, exatamente N meses de calendário resultam em N.0,
 * o que mantém os limites (3 e 6 meses) intuitivos e testáveis.
 */
export function monthsBetween(start: Date, end: Date): number {
  const years = end.getUTCFullYear() - start.getUTCFullYear();
  const months = end.getUTCMonth() - start.getUTCMonth();
  const days = end.getUTCDate() - start.getUTCDate();
  return years * 12 + months + days / 30;
}

/**
 * Calcula o risco do projeto a partir do orçamento e do prazo.
 * Cada dimensão gera um risco; quando ambas se aplicam, prevalece o maior.
 */
@Injectable()
export class RiskCalculatorService {
  calculate(input: RiskInput): RiskLevel {
    const budgetRisk = this.fromBudget(input.budget);
    const durationRisk = this.fromDuration(
      new Date(input.startDate),
      new Date(input.endDate),
    );
    return this.highest(budgetRisk, durationRisk);
  }

  private fromBudget(budget: number): RiskLevel {
    if (budget > BUDGET_MEDIUM_MAX) return RiskLevel.ALTO;
    if (budget > BUDGET_LOW_MAX) return RiskLevel.MEDIO;
    return RiskLevel.BAIXO;
  }

  private fromDuration(start: Date, end: Date): RiskLevel {
    const months = monthsBetween(start, end);
    if (months > MONTHS_MEDIUM_MAX) return RiskLevel.ALTO;
    if (months > MONTHS_LOW_MAX) return RiskLevel.MEDIO;
    return RiskLevel.BAIXO;
  }

  private highest(a: RiskLevel, b: RiskLevel): RiskLevel {
    return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
  }
}
