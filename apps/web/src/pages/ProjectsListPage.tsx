import { Link, useNavigate } from 'react-router-dom';

import { RiskBadge, StatusBadge } from '../components/Badges';
import { EmptyState, ErrorState } from '../components/States';
import { useProjects } from '../hooks/useProjects';
import { formatCurrency, formatDate } from '../lib/format';
import type { Project } from '../types/project';

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card__top">
        <StatusBadge status={project.status} label={project.statusLabel} />
        <RiskBadge risk={project.risk} label={project.riskLabel} />
      </div>
      <div>
        <div className="project-card__name">{project.name}</div>
        {project.description && (
          <p className="project-card__desc">{project.description}</p>
        )}
      </div>
      <div className="project-card__meta">
        <span>
          {formatDate(project.startDate)} → {formatDate(project.endDate)}
        </span>
        <span className="project-card__budget">
          {formatCurrency(project.budget)}
        </span>
      </div>
    </Link>
  );
}

export function ProjectsListPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useProjects();

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">Projetos</h1>
          <p className="page-head__subtitle">
            Acompanhe status, risco e prazos dos seus projetos.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate('/projects/new')}
        >
          + Novo projeto
        </button>
      </div>

      {isLoading && (
        <div className="skeleton-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      )}

      {data && data.length === 0 && (
        <EmptyState
          title="Nenhum projeto ainda"
          message="Crie o primeiro projeto para começar a acompanhar o portfólio."
          action={
            <Link to="/projects/new" className="btn btn--primary">
              + Criar projeto
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="project-grid">
          {data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
