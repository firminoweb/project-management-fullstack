const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Erro de API com o status HTTP preservado, para a UI reagir (ex.: 409). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function extractMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(' ');
    if (typeof data.message === 'string') return data.message;
  } catch {
    // corpo vazio ou não-JSON: usa a mensagem genérica abaixo
  }
  return `Falha na requisição (HTTP ${res.status}).`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError(
      0,
      'Não foi possível conectar à API. Verifique se o servidor está no ar.',
    );
  }

  if (!res.ok) {
    throw new ApiError(res.status, await extractMessage(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
