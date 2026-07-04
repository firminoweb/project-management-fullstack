import { Link, useNavigate } from 'react-router-dom';

import { ProjectForm } from '../components/ProjectForm';
import { useCreateProject } from '../hooks/useProjects';

export function ProjectCreatePage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  return (
    <div>
      <Link to="/" className="back-link">
        ← Voltar para projetos
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">Novo projeto</h1>
          <p className="page-head__subtitle">
            O projeto começa com status "Em análise" e risco calculado
            automaticamente.
          </p>
        </div>
      </div>

      <div className="card card--pad">
        <ProjectForm
          submitLabel="Criar projeto"
          submitting={createProject.isPending}
          serverError={
            createProject.isError ? (createProject.error as Error).message : null
          }
          onCancel={() => navigate('/')}
          onSubmit={(input) =>
            createProject.mutate(input, {
              onSuccess: (project) => navigate(`/projects/${project.id}`),
            })
          }
        />
      </div>
    </div>
  );
}
