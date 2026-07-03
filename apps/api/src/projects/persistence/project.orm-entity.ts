import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ProjectStatus } from '../enums/project-status.enum';
import { RiskLevel } from '../enums/risk-level.enum';

/**
 * Entidade de persistência (TypeORM) — mapeia a tabela `projects` no SQLite.
 * Deliberadamente separada do domínio `Project`: o mapeamento fica no
 * SqliteProjectsRepository, então o restante da aplicação continua sem
 * conhecer o ORM. Datas e timestamps são armazenados como texto ISO para
 * manter o mesmo contrato da implementação in-memory.
 */
@Entity({ name: 'projects' })
export class ProjectOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { default: '' })
  description: string;

  @Column('varchar', { name: 'start_date' })
  startDate: string;

  @Column('varchar', { name: 'end_date' })
  endDate: string;

  // Transformer garante que o valor volte como number, independentemente de
  // como o driver SQLite serializa colunas numéricas.
  @Column('numeric', {
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  budget: number;

  @Column('varchar')
  status: ProjectStatus;

  @Column('varchar')
  risk: RiskLevel;

  @Column('varchar', { name: 'created_at' })
  createdAt: string;

  @Column('varchar', { name: 'updated_at' })
  updatedAt: string;
}
