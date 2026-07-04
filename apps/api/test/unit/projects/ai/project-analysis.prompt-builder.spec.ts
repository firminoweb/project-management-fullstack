import { ProjectAnalysisPromptBuilder } from '@src/projects/ai/project-analysis.prompt-builder';
import { Project } from '@src/projects/entities/project.entity';
import { ProjectStatus } from '@src/projects/enums/project-status.enum';
import { RiskLevel } from '@src/projects/enums/risk-level.enum';

const project: Project = {
  id: 'p1',
  name: 'Portal',
  description: 'App interno',
  startDate: '2024-01-01',
  endDate: '2024-04-01',
  budget: 120_000,
  status: ProjectStatus.EM_ANDAMENTO,
  risk: RiskLevel.MEDIO,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ProjectAnalysisPromptBuilder', () => {
  const builder = new ProjectAnalysisPromptBuilder();

  it('exige JSON estrito com os campos esperados no system', () => {
    const { system } = builder.build(project);
    expect(system).toMatch(/JSON/);
    expect(system).toMatch(/summary/);
    expect(system).toMatch(/attentionPoints/);
    expect(system).toMatch(/executiveRecommendation/);
  });

  it('inclui os dados do projeto e a duração no user', () => {
    const { user } = builder.build(project);
    expect(user).toContain('Portal');
    expect(user).toContain('Em andamento');
    expect(user).toContain('Médio');
    expect(user).toMatch(/Duração estimada: 3\.0 meses/);
  });
});
