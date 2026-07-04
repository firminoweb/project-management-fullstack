import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { ProjectStatus } from '@src/projects/enums/project-status.enum';
import { RiskLevel } from '@src/projects/enums/risk-level.enum';
import { InMemoryProjectsRepository } from '@src/projects/in-memory-projects.repository';
import { ProjectsService } from '@src/projects/projects.service';
import { RiskCalculatorService } from '@src/projects/risk/risk-calculator.service';

function createService() {
  const repository = new InMemoryProjectsRepository();
  const service = new ProjectsService(repository, new RiskCalculatorService());
  return { service, repository };
}

const baseDto = {
  name: 'Projeto',
  description: 'desc',
  startDate: '2024-01-01',
  endDate: '2024-02-01',
  budget: 50_000,
};

describe('ProjectsService', () => {
  it('cria com status inicial EM_ANALISE e risco calculado', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    expect(created.status).toBe(ProjectStatus.EM_ANALISE);
    expect(created.risk).toBe(RiskLevel.BAIXO);
    expect(created.id).toBeDefined();
  });

  it('rejeita período inválido (fim <= início) na criação', async () => {
    const { service } = createService();
    await expect(
      service.create({
        ...baseDto,
        startDate: '2024-05-01',
        endDate: '2024-05-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança 404 ao buscar id inexistente', async () => {
    const { service } = createService();
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lista os projetos criados', async () => {
    const { service } = createService();
    await service.create(baseDto);
    await service.create({ ...baseDto, name: 'Outro' });
    expect(await service.findAll()).toHaveLength(2);
  });

  it('recalcula o risco ao atualizar o orçamento', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    const updated = await service.update(created.id, { budget: 600_000 });
    expect(updated.risk).toBe(RiskLevel.ALTO);
  });

  it('mantém o risco quando a atualização não afeta orçamento/prazo', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    const updated = await service.update(created.id, { name: 'Novo nome' });
    expect(updated.name).toBe('Novo nome');
    expect(updated.risk).toBe(created.risk);
  });

  it('valida o período ao atualizar datas', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    await expect(
      service.update(created.id, { endDate: '2023-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('avança o status pelo fluxo válido', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    const approved = await service.changeStatus(
      created.id,
      ProjectStatus.APROVADO,
    );
    expect(approved.status).toBe(ProjectStatus.APROVADO);
  });

  it('rejeita transição inválida (pular etapa)', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    await expect(
      service.changeStatus(created.id, ProjectStatus.ENCERRADO),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejeita mudar para o mesmo status', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    await expect(
      service.changeStatus(created.id, ProjectStatus.EM_ANALISE),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('remove um projeto deletável', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    await expect(service.remove(created.id)).resolves.toBeUndefined();
    await expect(service.findOne(created.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('bloqueia exclusão de projeto em andamento (409)', async () => {
    const { service } = createService();
    const created = await service.create(baseDto);
    await service.changeStatus(created.id, ProjectStatus.APROVADO);
    await service.changeStatus(created.id, ProjectStatus.EM_ANDAMENTO);
    await expect(service.remove(created.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
