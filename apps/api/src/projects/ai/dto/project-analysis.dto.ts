/**
 * Conteúdo textual da análise, comum às origens real e fallback.
 */
export interface ProjectAnalysisContent {
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
}

/**
 * Resposta do endpoint de análise com IA.
 * `source` deixa claro se a análise veio de uma IA real ou do fallback local,
 * garantindo transparência na demonstração.
 */
export class ProjectAnalysisDto implements ProjectAnalysisContent {
  projectId: string;
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
  source: 'ai' | 'fallback';
  provider?: string;
  model?: string;
  notice?: string;
  generatedAt: string;
}
