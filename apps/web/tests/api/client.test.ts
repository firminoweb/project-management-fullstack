import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetch } from '@/api/client';

function mockFetchResponse(partial: Partial<Response>) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(partial as Response);
}

describe('apiFetch', () => {
  afterEach(() => vi.restoreAllMocks());

  it('retorna o JSON em caso de sucesso', async () => {
    mockFetchResponse({
      ok: true,
      status: 200,
      json: async () => ({ id: '1' }),
    });
    await expect(apiFetch('/x')).resolves.toEqual({ id: '1' });
  });

  it('retorna undefined em respostas 204', async () => {
    mockFetchResponse({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('sem corpo');
      },
    });
    await expect(apiFetch('/x', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('lança ApiError juntando mensagens em array (validação)', async () => {
    mockFetchResponse({
      ok: false,
      status: 400,
      json: async () => ({ message: ['campo A', 'campo B'] }),
    });
    await expect(apiFetch('/x')).rejects.toMatchObject({
      status: 400,
      message: 'campo A campo B',
    });
  });

  it('lança ApiError com mensagem string', async () => {
    mockFetchResponse({
      ok: false,
      status: 409,
      json: async () => ({ message: 'conflito' }),
    });
    await expect(apiFetch('/x')).rejects.toMatchObject({
      status: 409,
      message: 'conflito',
    });
  });

  it('lança ApiError genérica quando o corpo não é JSON', async () => {
    mockFetchResponse({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('não é json');
      },
    });
    await expect(apiFetch('/x')).rejects.toBeInstanceOf(ApiError);
  });

  it('trata falha de conexão como ApiError com status 0', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    await expect(apiFetch('/x')).rejects.toMatchObject({ status: 0 });
  });
});
