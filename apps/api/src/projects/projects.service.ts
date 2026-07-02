import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import {
  PROJECT_STATUS_LABELS,
  ProjectStatus,
} from './enums/project-status.enum';
import { ProjectsRepository } from './projects.repository';
import { RiskCalculatorService } from './risk/risk-calculator.service';
import { canTransition, isDeletable } from './status/project-status.machine';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly repository: ProjectsRepository,
    private readonly riskCalculator: RiskCalculatorService,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    this.assertValidPeriod(dto.startDate, dto.endDate);

    const risk = this.riskCalculator.calculate({
      budget: dto.budget,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return this.repository.create({
      name: dto.name,
      description: dto.description ?? '',
      startDate: dto.startDate,
      endDate: dto.endDate,
      budget: dto.budget,
      status: ProjectStatus.EM_ANALISE, // status inicial fixo
      risk,
    });
  }

  async findAll(): Promise<Project[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.repository.findById(id);
    if (!project) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const current = await this.findOne(id);

    const startDate = dto.startDate ?? current.startDate;
    const endDate = dto.endDate ?? current.endDate;
    const budget = dto.budget ?? current.budget;

    if (dto.startDate !== undefined || dto.endDate !== undefined) {
      this.assertValidPeriod(startDate, endDate);
    }

    // Risco é recalculado sempre que orçamento ou datas mudarem.
    const affectsRisk =
      dto.budget !== undefined ||
      dto.startDate !== undefined ||
      dto.endDate !== undefined;
    const risk = affectsRisk
      ? this.riskCalculator.calculate({ budget, startDate, endDate })
      : current.risk;

    const updated = await this.repository.update(id, {
      name: dto.name ?? current.name,
      description: dto.description ?? current.description,
      startDate,
      endDate,
      budget,
      risk,
    });
    if (!updated) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
    return updated;
  }

  async changeStatus(id: string, target: ProjectStatus): Promise<Project> {
    const current = await this.findOne(id);

    if (current.status === target) {
      throw new BadRequestException(
        `O projeto já está no status "${PROJECT_STATUS_LABELS[target]}".`,
      );
    }
    if (!canTransition(current.status, target)) {
      throw new BadRequestException(
        `Transição de status inválida: "${PROJECT_STATUS_LABELS[current.status]}" → "${PROJECT_STATUS_LABELS[target]}".`,
      );
    }

    const updated = await this.repository.update(id, { status: target });
    if (!updated) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id); // garante 404 quando não existe

    if (!isDeletable(project.status)) {
      throw new ConflictException(
        `Projetos com status "${PROJECT_STATUS_LABELS[project.status]}" não podem ser excluídos.`,
      );
    }
    await this.repository.delete(id);
  }

  private assertValidPeriod(startDate: string, endDate: string): void {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new BadRequestException('Datas inválidas.');
    }
    if (end <= start) {
      throw new BadRequestException(
        'A previsão de término deve ser posterior à data de início.',
      );
    }
  }
}
