import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Dados aceitos na criação de um projeto.
 * `status` e `risk` não são recebidos: o status inicial é sempre "Em análise"
 * e o risco é calculado automaticamente.
 */
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  budget: number;
}
