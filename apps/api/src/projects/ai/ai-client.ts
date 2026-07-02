/**
 * Prompt já montado para envio ao provedor de IA.
 */
export interface AiPrompt {
  system: string;
  user: string;
}

/**
 * Contrato de um cliente de IA (camada de mais baixo nível da análise).
 * Definido como classe abstrata para servir de token de injeção — a
 * implementação real (Anthropic) pode ser trocada por outra sem afetar o
 * AiAnalysisService, que depende apenas deste contrato.
 */
export abstract class AiClient {
  /** Indica se há credencial/configuração para uma chamada real de IA. */
  abstract isEnabled(): boolean;

  /** Metadados do provedor, usados apenas para transparência na resposta. */
  abstract describe(): { provider: string; model: string };

  /** Executa o prompt e devolve o texto bruto retornado pelo modelo. */
  abstract complete(prompt: AiPrompt): Promise<string>;
}
