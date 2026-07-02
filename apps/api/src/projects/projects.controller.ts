import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AiAnalysisService } from './ai/ai-analysis.service';
import { ProjectAnalysisDto } from './ai/dto/project-analysis.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectsService.create(dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Get()
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.findAll();
    return projects.map(ProjectResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsService.findOne(id);
    return ProjectResponseDto.fromEntity(project);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.update(id, dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.changeStatus(id, dto.status);
    return ProjectResponseDto.fromEntity(project);
  }

  @Get(':id/ai-analysis')
  async analyze(@Param('id') id: string): Promise<ProjectAnalysisDto> {
    const project = await this.projectsService.findOne(id);
    return this.aiAnalysisService.analyze(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.projectsService.remove(id);
  }
}
