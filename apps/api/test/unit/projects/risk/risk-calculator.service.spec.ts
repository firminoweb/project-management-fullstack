import { RiskLevel } from '@src/projects/enums/risk-level.enum';
import {
  RiskCalculatorService,
  monthsBetween,
} from '@src/projects/risk/risk-calculator.service';

describe('RiskCalculatorService', () => {
  const calc = new RiskCalculatorService();

  const risk = (budget: number, startDate: string, endDate: string) =>
    calc.calculate({ budget, startDate, endDate });

  describe('monthsBetween', () => {
    it('conta meses de calendário inteiros como N.0', () => {
      expect(monthsBetween(new Date('2024-01-01'), new Date('2024-04-01'))).toBe(3);
      expect(monthsBetween(new Date('2024-01-01'), new Date('2024-07-01'))).toBe(6);
      expect(monthsBetween(new Date('2024-01-01'), new Date('2024-08-01'))).toBe(7);
    });
  });

  describe('dimensão orçamento', () => {
    // Prazo curto (baixo) para isolar o efeito do orçamento.
    it('até 100.000 => baixo', () => {
      expect(risk(100_000, '2024-01-01', '2024-02-01')).toBe(RiskLevel.BAIXO);
    });
    it('entre 100.001 e 500.000 => médio', () => {
      expect(risk(100_001, '2024-01-01', '2024-02-01')).toBe(RiskLevel.MEDIO);
      expect(risk(500_000, '2024-01-01', '2024-02-01')).toBe(RiskLevel.MEDIO);
    });
    it('acima de 500.000 => alto', () => {
      expect(risk(500_001, '2024-01-01', '2024-02-01')).toBe(RiskLevel.ALTO);
    });
  });

  describe('dimensão prazo', () => {
    // Orçamento baixo para isolar o efeito do prazo.
    it('até 3 meses => baixo', () => {
      expect(risk(50_000, '2024-01-01', '2024-04-01')).toBe(RiskLevel.BAIXO);
    });
    it('mais de 3 e até 6 meses => médio', () => {
      expect(risk(50_000, '2024-01-01', '2024-05-01')).toBe(RiskLevel.MEDIO);
      expect(risk(50_000, '2024-01-01', '2024-07-01')).toBe(RiskLevel.MEDIO);
    });
    it('mais de 6 meses => alto', () => {
      expect(risk(50_000, '2024-01-01', '2024-08-01')).toBe(RiskLevel.ALTO);
    });
  });

  describe('prevalece o maior risco', () => {
    it('orçamento alto + prazo baixo => alto', () => {
      expect(risk(600_000, '2024-01-01', '2024-02-01')).toBe(RiskLevel.ALTO);
    });
    it('orçamento baixo + prazo alto => alto', () => {
      expect(risk(50_000, '2024-01-01', '2024-10-01')).toBe(RiskLevel.ALTO);
    });
    it('orçamento médio + prazo alto => alto', () => {
      expect(risk(200_000, '2024-01-01', '2024-10-01')).toBe(RiskLevel.ALTO);
    });
    it('ambos baixos => baixo', () => {
      expect(risk(50_000, '2024-01-01', '2024-03-01')).toBe(RiskLevel.BAIXO);
    });
  });
});
