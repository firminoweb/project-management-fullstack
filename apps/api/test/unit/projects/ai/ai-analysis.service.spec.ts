import { Project } from '@src/projects/entities/project.entity';
import { ProjectStatus } from '@src/projects/enums/project-status.enum';
import { RiskLevel } from '@src/projects/enums/risk-level.enum';
import { AiAnalysisService } from '@src/projects/ai/ai-analysis.service';
import { AiClient, AiPrompt } from '@src/projects/ai/ai-client';
import { ProjectAnalysisFallback } from '@src/projects/ai/project-analysis.fallback';
import { ProjectAnalysisPromptBuilder } from '@src/projects/ai/project-analysis.prompt-builder';

const project: Project = {
  id: 'p1',
  name: 'Projeto Teste',
  description: 'Descrição',
  startDate: '2024-01-01',
  endDate: '2024-04-01',
  budget: 80_000,
  status: ProjectStatus.EM_ANALISE,
  risk: RiskLevel.BAIXO,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

/** AiClient configurável para simular cada cenário. */
class FakeAiClient extends AiClient {
  constructor(
    private readonly enabled: boolean,
    private readonly behavior: () => Promise<string> = async () => '',
  ) {
    super();
  }
  isEnabled(): boolean {
    return this.enabled;
  }
  describe() {
    return { provider: 'fake', model: 'fake-model' };
  }
  complete(_prompt: AiPrompt): Promise<string> {
    return this.behavior();
  }
}

const build = (client: AiClient) =>
  new AiAnalysisService(
    client,
    new ProjectAnalysisPromptBuilder(),
    new ProjectAnalysisFallback(),
  );

describe('AiAnalysisService', () => {
  it('usa o fallback quando a IA não está habilitada', async () => {
    const service = build(new FakeAiClient(false));

    const result = await service.analyze(project);

    expect(result.source).toBe('fallback');
    expect(result.notice).toBeDefined();
    expect(result.summary).toContain('Projeto Teste');
    expect(result.attentionPoints.length).toBeGreaterThan(0);
  });

  it('usa a IA real quando ela retorna JSON válido', async () => {
    const payload = JSON.stringify({
      summary: 'Resumo via IA',
      attentionPoints: ['Ponto 1', 'Ponto 2'],
      executiveRecommendation: 'Recomendação via IA',
    });
    const service = build(new FakeAiClient(true, async () => payload));

    const result = await service.analyze(project);

    expect(result.source).toBe('ai');
    expect(result.provider).toBe('fake');
    expect(result.summary).toBe('Resumo via IA');
    expect(result.attentionPoints).toEqual(['Ponto 1', 'Ponto 2']);
  });

  it('tolera JSON cercado por markdown', async () => {
    const payload =
      '```json\n{"summary":"S","attentionPoints":["A"],"executiveRecommendation":"R"}\n```';
    const service = build(new FakeAiClient(true, async () => payload));

    const result = await service.analyze(project);

    expect(result.source).toBe('ai');
    expect(result.summary).toBe('S');
  });

  it('cai no fallback quando a IA retorna formato inválido', async () => {
    const service = build(new FakeAiClient(true, async () => 'não é json'));

    const result = await service.analyze(project);

    expect(result.source).toBe('fallback');
  });

  it('cai no fallback quando a chamada à IA lança erro', async () => {
    const service = build(
      new FakeAiClient(true, async () => {
        throw new Error('timeout');
      }),
    );

    const result = await service.analyze(project);

    expect(result.source).toBe('fallback');
  });
});
