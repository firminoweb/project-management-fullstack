import { ProjectStatus } from '../enums/project-status.enum';
import { RiskLevel } from '../enums/risk-level.enum';

/**
 * Representação de domínio de um projeto.
 * Datas são armazenadas como strings ISO (YYYY-MM-DD) para trafegar de forma
 * previsível em JSON. `status` e `risk` nunca vêm do cliente: são derivados
 * pelas regras de negócio.
 */
export class Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  risk: RiskLevel;
  createdAt: string;
  updatedAt: string;
}
