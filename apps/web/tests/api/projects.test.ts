import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { projectsApi } from '@/api/projects';

let fetchSpy: MockInstance<typeof globalThis.fetch>;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
  } as Response);
});

afterEach(() => vi.restoreAllMocks());

function lastCall() {
  const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
  return { url, options };
}

describe('projectsApi', () => {
  it('list → GET /projects', async () => {
    await projectsApi.list();
    expect(lastCall().url).toMatch(/\/projects$/);
  });

  it('get → GET /projects/:id', async () => {
    await projectsApi.get('p1');
    expect(lastCall().url).toMatch(/\/projects\/p1$/);
  });

  it('create → POST /projects com corpo', async () => {
    await projectsApi.create({
      name: 'X',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      budget: 10,
    });
    const { url, options } = lastCall();
    expect(url).toMatch(/\/projects$/);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toMatchObject({ name: 'X' });
  });

  it('update → PATCH /projects/:id', async () => {
    await projectsApi.update('p1', { name: 'Y' });
    const { url, options } = lastCall();
    expect(url).toMatch(/\/projects\/p1$/);
    expect(options.method).toBe('PATCH');
  });

  it('changeStatus → PATCH /projects/:id/status', async () => {
    await projectsApi.changeStatus('p1', 'APROVADO');
    const { url, options } = lastCall();
    expect(url).toMatch(/\/projects\/p1\/status$/);
    expect(JSON.parse(options.body as string)).toEqual({ status: 'APROVADO' });
  });

  it('remove → DELETE /projects/:id', async () => {
    fetchSpy.mockResolvedValue({ ok: true, status: 204 } as Response);
    await projectsApi.remove('p1');
    const { url, options } = lastCall();
    expect(url).toMatch(/\/projects\/p1$/);
    expect(options.method).toBe('DELETE');
  });

  it('analyze → GET /projects/:id/ai-analysis', async () => {
    await projectsApi.analyze('p1');
    expect(lastCall().url).toMatch(/\/projects\/p1\/ai-analysis$/);
  });
});
