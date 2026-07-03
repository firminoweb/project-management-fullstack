import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { RiskBadge, StatusBadge } from '../components/Badges';
import { ErrorState, LoadingState } from '../components/States';
import {
  useAiAnalysis,
  useChangeStatus,
  useDeleteProject,
  useProject,
} from '../hooks/useProjects';
import { formatCurrency, formatDate, formatDateTime } from '../lib/format';
import type { AiAnalysis, Project } from '../types/project';
import { ALLOWED_TRANSITIONS, isDeletable, transitionLabel } from '../types/project';

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="fact__label">{label}</div>
      <div className="fact__value">{children}</div>
    </div>
  );
}

function AiAnalysisSection({ project }: { project: Project }) {
  const analysis = useAiAnalysis(project.id);
  const result: AiAnalysis | undefined = analysis.data;

  return (
    <div className="card card--pad" style={{ marginTop: 'var(--space-5)' }}>
      <div className="ai-panel__head">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Análise inteligente
        </h2>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => analysis.mutate()}
          disabled={analysis.isPending}
        >
          {analysis.isPending
            ? 'Gerando…'
            : result
              ? 'Gerar novamente'
              : 'Gerar análise com IA'}
        </button>
      </div>

      {!result && !analysis.isPending && !analysis.isError && (
        <p className="page-head__subtitle" style={{ marginTop: 'var(--space-3)' }}>
          Gere um resumo executivo, pontos de atenção e uma recomendação com
          apoio de IA.
        </p>
      )}

      {analysis.isPending && <LoadingState label="Consultando a IA…" />}

      {analysis.isError && (
        <div className="form-alert" style={{ marginTop: 'var(--space-4)' }}>
          {(analysis.error as Error).message}
        </div>
      )}

      {result && (
        <div className="ai-panel" style={{ marginTop: 'var(--space-4)' }}>
          <div className="ai-panel__head">
            <span
              className="badge badge--source"
              data-source={result.source}
            >
              {result.source === 'ai' ? 'Gerado por IA' : 'Análise local (fallback)'}
            </span>
            {(result.model || result.provider) && (
              <span className="ai-meta">
                {[result.provider, result.model].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>

          {result.notice && <div className="ai-notice">{result.notice}</div>}

          <div>
            <div className="ai-block__label">Resumo</div>
            <p style={{ margin: 0 }}>{result.summary}</p>
          </div>

          <div>
            <div className="ai-block__label">Pontos de atenção</div>
            <ul className="ai-points">
              {result.attentionPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="ai-block__label">Recomendação executiva</div>
            <p style={{ margin: 0 }}>{result.executiveRecommendation}</p>
          </div>

          <span className="ai-meta">
            Gerado em {formatDateTime(result.generatedAt)}
          </span>
        </div>
      )}
    </div>
  );
}

export function ProjectDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, isError, error, refetch } = useProject(id);
  const changeStatus = useChangeStatus(id);
  const deleteProject = useDeleteProject();

  if (isLoading) return <LoadingState label="Carregando projeto…" />;
  if (isError) {
    return (
      <div>
        <Link to="/" className="back-link">
          ← Voltar para projetos
        </Link>
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      </div>
    );
  }
  if (!project) return null;

  const transitions = ALLOWED_TRANSITIONS[project.status];
  const deletable = isDeletable(project.status);
  const actionError =
    (changeStatus.isError && (changeStatus.error as Error).message) ||
    (deleteProject.isError && (deleteProject.error as Error).message) ||
    null;

  function handleDelete() {
    if (!deletable) return;
    const confirmed = window.confirm(
      `Excluir o projeto "${project!.name}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;
    deleteProject.mutate(project!.id, {
      onSuccess: () => navigate('/'),
    });
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Voltar para projetos
      </Link>

      <div className="page-head">
        <div>
          <h1 className="page-head__title">{project.name}</h1>
          <div
            style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}
          >
            <StatusBadge status={project.status} label={project.statusLabel} />
            <RiskBadge risk={project.risk} label={project.riskLabel} />
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card card--pad">
          <h2 className="section-title">Informações</h2>
          <div className="detail-facts">
            <Fact label="Orçamento">{formatCurrency(project.budget)}</Fact>
            <Fact label="Risco">{project.riskLabel}</Fact>
            <Fact label="Início">{formatDate(project.startDate)}</Fact>
            <Fact label="Previsão de término">
              {formatDate(project.endDate)}
            </Fact>
            <Fact label="Criado em">{formatDateTime(project.createdAt)}</Fact>
            <Fact label="Atualizado em">
              {formatDateTime(project.updatedAt)}
            </Fact>
          </div>

          <div className="detail-desc">
            {project.description || 'Sem descrição informada.'}
          </div>
        </div>

        <aside className="card card--pad side-actions">
          {actionError && <div className="form-alert">{actionError}</div>}

          <div>
            <div className="action-group__label">Status</div>
            <div className="side-actions">
              {transitions.length === 0 ? (
                <p className="hint">
                  Este projeto está em um status final e não possui novas
                  transições.
                </p>
              ) : (
                transitions.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={
                      target === 'CANCELADO'
                        ? 'btn btn--danger btn--block'
                        : 'btn btn--outline btn--block'
                    }
                    onClick={() => changeStatus.mutate(target)}
                    disabled={changeStatus.isPending}
                  >
                    {transitionLabel(target)}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="action-group__label">Gerenciar</div>
            <div className="side-actions">
              <Link
                to={`/projects/${project.id}/edit`}
                className="btn btn--outline btn--block"
              >
                Editar projeto
              </Link>
              <button
                type="button"
                className="btn btn--danger btn--block"
                onClick={handleDelete}
                disabled={!deletable || deleteProject.isPending}
              >
                {deleteProject.isPending ? 'Excluindo…' : 'Excluir projeto'}
              </button>
              {!deletable && (
                <span className="hint">
                  Projetos em andamento ou encerrados não podem ser excluídos.
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>

      <AiAnalysisSection project={project} />
    </div>
  );
}
