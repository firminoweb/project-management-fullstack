import { Project } from './entities/project.entity';

/** Campos de um projeto novo (id e timestamps são atribuídos pelo repositório). */
export type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

/** Campos passíveis de atualização (id e createdAt são imutáveis). */
export type ProjectPatch = Partial<Omit<Project, 'id' | 'createdAt'>>;

/**
 * Contrato da camada de persistência de projetos.
 * Definido como classe abstrata para servir de token de injeção — a troca
 * da implementação in-memory pela de SQLite/TypeORM não afeta o service.
 * Métodos são assíncronos por design, já preparando a migração para banco.
 */
export abstract class ProjectsRepository {
  abstract create(data: NewProject): Promise<Project>;
  abstract findAll(): Promise<Project[]>;
  abstract findById(id: string): Promise<Project | null>;
  abstract update(id: string, patch: ProjectPatch): Promise<Project | null>;
  abstract delete(id: string): Promise<boolean>;
}
