import { IsEnum } from 'class-validator';

import { ProjectStatus } from '../enums/project-status.enum';

/**
 * Alvo da mudança de status. A validade da transição em si (a partir do
 * status atual) é verificada na camada de serviço pela máquina de status.
 */
export class ChangeStatusDto {
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
