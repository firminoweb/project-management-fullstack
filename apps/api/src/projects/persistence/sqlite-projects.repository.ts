import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';

import { Project } from '../entities/project.entity';
import {
  NewProject,
  ProjectPatch,
  ProjectsRepository,
} from '../projects.repository';
import { ProjectOrmEntity } from './project.orm-entity';

/** Converte a linha do banco na representação de domínio. */
function toDomain(row: ProjectOrmEntity): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    budget: row.budget,
    status: row.status,
    risk: row.risk,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Implementação do repositório de projetos sobre SQLite (via TypeORM).
 * id e timestamps são atribuídos aqui — como na versão in-memory — para
 * manter idêntico o contrato do domínio (timestamps em ISO string).
 */
@Injectable()
export class SqliteProjectsRepository extends ProjectsRepository {
  constructor(
    @InjectRepository(ProjectOrmEntity)
    private readonly repo: Repository<ProjectOrmEntity>,
  ) {
    super();
  }

  async create(data: NewProject): Promise<Project> {
    const now = new Date().toISOString();
    const entity = this.repo.create({
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.repo.save(entity);
    return toDomain(saved);
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Project | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async update(id: string, patch: ProjectPatch): Promise<Project | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;

    const merged = this.repo.merge(existing, {
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });
    const saved = await this.repo.save(merged);
    return toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
