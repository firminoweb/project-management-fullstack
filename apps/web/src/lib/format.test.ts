import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
  it('formata número como moeda brasileira (R$)', () => {
    const result = formatCurrency(1500.5);
    expect(result).toMatch(/R\$/);
    expect(result).toContain('1.500,50');
  });
});

describe('formatDate', () => {
  it('converte ISO (YYYY-MM-DD) para DD/MM/AAAA sem deslocar o fuso', () => {
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });

  it('aceita timestamp ISO completo', () => {
    expect(formatDate('2026-12-31T23:00:00.000Z')).toBe('31/12/2026');
  });
});
