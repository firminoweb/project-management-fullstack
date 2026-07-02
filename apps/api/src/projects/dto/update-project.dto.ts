import { PartialType } from '@nestjs/mapped-types';

import { CreateProjectDto } from './create-project.dto';

/**
 * Atualização parcial de um projeto. Todos os campos de criação viram
 * opcionais; status é alterado por endpoint próprio (PATCH /projects/:id/status).
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
