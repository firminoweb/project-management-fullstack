import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AnthropicAiClient } from '@src/projects/ai/anthropic-ai.client';

function configWith(
  values: Record<string, string | undefined>,
): ConfigService {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

describe('AnthropicAiClient', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fica desabilitado sem ANTHROPIC_API_KEY', () => {
    const client = new AnthropicAiClient(configWith({}));
    expect(client.isEnabled()).toBe(false);
  });

  it('habilita e descreve provider/model quando há chave', () => {
    const client = new AnthropicAiClient(
      configWith({
        ANTHROPIC_API_KEY: 'sk-test',
        ANTHROPIC_MODEL: 'claude-haiku-4-5',
      }),
    );
    expect(client.isEnabled()).toBe(true);
    expect(client.describe()).toEqual({
      provider: 'anthropic',
      model: 'claude-haiku-4-5',
    });
  });

  it('usa o modelo padrão quando ANTHROPIC_MODEL não é definido', () => {
    const client = new AnthropicAiClient(configWith({ ANTHROPIC_API_KEY: 'sk-test' }));
    expect(client.describe().model).toBe('claude-opus-4-8');
  });
});
