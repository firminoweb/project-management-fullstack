import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { Project } from './entities/project.entity';
import {
  NewProject,
  ProjectPatch,
  ProjectsRepository,
} from './projects.repository';

/**
 * Implementação em memória do repositório de projetos.
 * Guarda e devolve cópias para evitar mutação acidental do estado interno.
 * Os dados são reiniciados a cada boot da aplicação.
 */
@Injectable()
export class InMemoryProjectsRepository extends ProjectsRepository {
  private readonly projects = new Map<string, Project>();

  async create(data: NewProject): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    return { ...project };
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects.values()]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((project) => ({ ...project }));
  }

  async findById(id: string): Promise<Project | null> {
    const project = this.projects.get(id);
    return project ? { ...project } : null;
  }

  async update(id: string, patch: ProjectPatch): Promise<Project | null> {
    const existing = this.projects.get(id);
    if (!existing) return null;

    const updated: Project = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}
