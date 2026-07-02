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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AiAnalysisService } from './ai/ai-analysis.service';
import { ProjectAnalysisDto } from './ai/dto/project-analysis.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um projeto (status inicial: Em análise)' })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  async create(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectsService.create(dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto] })
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.findAll();
    return projects.map(ProjectResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um projeto por ID' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsService.findOne(id);
    return ProjectResponseDto.fromEntity(project);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um projeto (recalcula o risco)' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.update(id, dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Altera o status respeitando a máquina de estados',
  })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.changeStatus(id, dto.status);
    return ProjectResponseDto.fromEntity(project);
  }

  @Get(':id/ai-analysis')
  @ApiOperation({ summary: 'Gera a análise textual do projeto com apoio de IA' })
  @ApiResponse({ status: 200, type: ProjectAnalysisDto })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async analyze(@Param('id') id: string): Promise<ProjectAnalysisDto> {
    const project = await this.projectsService.findOne(id);
    return this.aiAnalysisService.analyze(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove um projeto (bloqueado para Em andamento/Encerrado)',
  })
  @ApiResponse({ status: 204, description: 'Projeto removido' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Projeto não pode ser excluído no status atual',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.projectsService.remove(id);
  }
}
