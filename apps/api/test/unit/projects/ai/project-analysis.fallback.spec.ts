import { ProjectAnalysisFallback } from '@src/projects/ai/project-analysis.fallback';
import { Project } from '@src/projects/entities/project.entity';
import { ProjectStatus } from '@src/projects/enums/project-status.enum';
import { RiskLevel } from '@src/projects/enums/risk-level.enum';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Projeto',
    description: 'desc',
    startDate: '2024-01-01',
    endDate: '2024-03-01',
    budget: 50_000,
    status: ProjectStatus.APROVADO,
    risk: RiskLevel.BAIXO,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProjectAnalysisFallback', () => {
  const fallback = new ProjectAnalysisFallback();

  it('gera resumo, pontos de atenção e recomendação', () => {
    const result = fallback.build(makeProject());
    expect(result.summary).toContain('Projeto');
    expect(result.attentionPoints.length).toBeGreaterThan(0);
    expect(typeof result.executiveRecommendation).toBe('string');
  });

  it('sinaliza alto risco nos pontos e na recomendação', () => {
    const result = fallback.build(makeProject({ risk: RiskLevel.ALTO }));
    expect(result.attentionPoints.join(' ')).toMatch(/alto risco/i);
    expect(result.executiveRecommendation).toMatch(/mitigação/i);
  });

  it('sinaliza risco médio', () => {
    const result = fallback.build(makeProject({ risk: RiskLevel.MEDIO }));
    expect(result.attentionPoints.join(' ')).toMatch(/médio/i);
    expect(result.executiveRecommendation).toMatch(/monitoramento/i);
  });

  it('alerta para orçamento elevado e prazo longo', () => {
    const result = fallback.build(
      makeProject({
        budget: 600_000,
        startDate: '2024-01-01',
        endDate: '2024-10-01',
      }),
    );
    const text = result.attentionPoints.join(' ');
    expect(text).toMatch(/Orçamento elevado/i);
    expect(text).toMatch(/6 meses/i);
  });

  it('destaca projeto ainda em análise', () => {
    const result = fallback.build(
      makeProject({ status: ProjectStatus.EM_ANALISE }),
    );
    expect(result.attentionPoints.join(' ')).toMatch(/em análise/i);
  });

  it('recomendação específica para cancelado e encerrado', () => {
    expect(
      fallback.build(makeProject({ status: ProjectStatus.CANCELADO }))
        .executiveRecommendation,
    ).toMatch(/cancelado/i);
    expect(
      fallback.build(makeProject({ status: ProjectStatus.ENCERRADO }))
        .executiveRecommendation,
    ).toMatch(/encerrado/i);
  });
});
