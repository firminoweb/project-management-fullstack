import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { AiClient, AiPrompt } from './ai-client';

const DEFAULT_MODEL = 'claude-opus-4-8';
const MAX_TOKENS = 1024;

/**
 * Implementação real do AiClient usando a API da Anthropic (Claude).
 * O cliente só é instanciado quando ANTHROPIC_API_KEY está presente; caso
 * contrário, isEnabled() retorna false e o AiAnalysisService usa o fallback.
 * A chave nunca é versionada — vem exclusivamente de variável de ambiente.
 */
@Injectable()
export class AnthropicAiClient extends AiClient {
  private readonly logger = new Logger(AnthropicAiClient.name);
  private readonly client: Anthropic | null;
  private readonly model: string;

  constructor(config: ConfigService) {
    super();
    const apiKey = config.get<string>('ANTHROPIC_API_KEY');
    this.model = config.get<string>('ANTHROPIC_MODEL') ?? DEFAULT_MODEL;
    this.client = apiKey ? new Anthropic({ apiKey }) : null;

    if (!this.client) {
      this.logger.warn(
        'ANTHROPIC_API_KEY não configurada: análise de IA usará o fallback local.',
      );
    }
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  describe(): { provider: string; model: string } {
    return { provider: 'anthropic', model: this.model };
  }

  async complete(prompt: AiPrompt): Promise<string> {
    if (!this.client) {
      throw new Error('AiClient não configurado (ANTHROPIC_API_KEY ausente).');
    }

    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    });

    return message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
  }
}
