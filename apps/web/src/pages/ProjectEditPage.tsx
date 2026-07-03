import { Link, useNavigate, useParams } from 'react-router-dom';

import { ProjectForm } from '../components/ProjectForm';
import { ErrorState, LoadingState } from '../components/States';
import { useProject, useUpdateProject } from '../hooks/useProjects';

export function ProjectEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, isError, error, refetch } = useProject(id);
  const updateProject = useUpdateProject(id);

  return (
    <div>
      <Link to={`/projects/${id}`} className="back-link">
        ← Voltar para o projeto
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">Editar projeto</h1>
          <p className="page-head__subtitle">
            Alterar orçamento ou prazo recalcula o risco automaticamente.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState label="Carregando projeto…" />}

      {isError && (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      )}

      {project && (
        <div className="card card--pad">
          <ProjectForm
            initial={project}
            submitLabel="Salvar alterações"
            submitting={updateProject.isPending}
            serverError={
              updateProject.isError
                ? (updateProject.error as Error).message
                : null
            }
            onCancel={() => navigate(`/projects/${id}`)}
            onSubmit={(input) =>
              updateProject.mutate(input, {
                onSuccess: () => navigate(`/projects/${id}`),
              })
            }
          />
        </div>
      )}
    </div>
  );
}
