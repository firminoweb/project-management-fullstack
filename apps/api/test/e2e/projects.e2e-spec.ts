import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@src/app.module';
import { AllExceptionsFilter } from '@src/common/filters/all-exceptions.filter';

/**
 * Teste ponta a ponta do fluxo de projetos, subindo o AppModule inteiro
 * (controllers, service, persistência TypeORM) contra um SQLite em memória.
 * A IA fica desativada (sem chave) para o caminho de análise ser determinístico
 * via fallback local.
 */
describe('Projects API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Banco isolado em memória e IA desativada antes de compilar o módulo.
    process.env.DATABASE_PATH = ':memory:';
    process.env.ANTHROPIC_API_KEY = '';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const validProject = {
    name: 'Projeto E2E',
    description: 'Fluxo completo',
    startDate: '2026-01-01',
    endDate: '2026-03-01', // 2 meses => baixo
    budget: 50000, // <= 100k => baixo
  };

  // Compartilhado entre os testes do fluxo principal (executam em ordem).
  let projectId: string;

  it('GET /health → 200', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /projects → 200 e lista vazia inicialmente', async () => {
    const res = await request(app.getHttpServer()).get('/projects').expect(200);
    expect(res.body).toEqual([]);
  });

  it('POST /projects com corpo inválido → 400', async () => {
    await request(app.getHttpServer()).post('/projects').send({}).expect(400);
  });

  it('POST /projects → 201 com status inicial e risco calculado', async () => {
    const res = await request(app.getHttpServer())
      .post('/projects')
      .send(validProject)
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'Projeto E2E',
      status: 'EM_ANALISE',
      statusLabel: 'Em análise',
      risk: 'BAIXO',
      riskLabel: 'Baixo',
    });
    expect(typeof res.body.id).toBe('string');
    expect(res.body.createdAt).toBeDefined();

    projectId = res.body.id;
  });

  it('GET /projects/:id → 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .expect(200);
    expect(res.body.id).toBe(projectId);
  });

  it('GET /projects/:id inexistente → 404', async () => {
    await request(app.getHttpServer()).get('/projects/nao-existe').expect(404);
  });

  it('PATCH /projects/:id recalcula o risco ao mudar o orçamento', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/projects/${projectId}`)
      .send({ budget: 600000 }) // > 500k => alto
      .expect(200);
    expect(res.body.risk).toBe('ALTO');
    expect(res.body.riskLabel).toBe('Alto');
  });

  it('PATCH /projects/:id/status rejeita transição inválida → 400', async () => {
    await request(app.getHttpServer())
      .patch(`/projects/${projectId}/status`)
      .send({ status: 'ENCERRADO' }) // pular etapas não é permitido
      .expect(400);
  });

  it('PATCH /projects/:id/status avança pelo fluxo válido', async () => {
    await request(app.getHttpServer())
      .patch(`/projects/${projectId}/status`)
      .send({ status: 'APROVADO' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/projects/${projectId}/status`)
      .send({ status: 'EM_ANDAMENTO' })
      .expect(200);
    expect(res.body.status).toBe('EM_ANDAMENTO');
  });

  it('DELETE /projects/:id bloqueado em "Em andamento" → 409', async () => {
    await request(app.getHttpServer())
      .delete(`/projects/${projectId}`)
      .expect(409);
  });

  it('GET /projects/:id/ai-analysis → 200 com análise via fallback', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}/ai-analysis`)
      .expect(200);

    expect(res.body.source).toBe('fallback');
    expect(res.body.projectId).toBe(projectId);
    expect(typeof res.body.summary).toBe('string');
    expect(Array.isArray(res.body.attentionPoints)).toBe(true);
    expect(typeof res.body.executiveRecommendation).toBe('string');
  });

  it('DELETE /projects/:id remove um projeto deletável → 204', async () => {
    const created = await request(app.getHttpServer())
      .post('/projects')
      .send(validProject)
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/projects/${created.body.id}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/projects/${created.body.id}`)
      .expect(404);
  });
});
