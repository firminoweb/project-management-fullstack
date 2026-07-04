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
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(120, { message: 'O nome deve ter no máximo 120 caracteres.' })
  name: string;

  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsOptional()
  @MaxLength(2000, {
    message: 'A descrição deve ter no máximo 2000 caracteres.',
  })
  description?: string;

  @IsDateString(
    {},
    { message: 'A data de início deve ser uma data válida (YYYY-MM-DD).' },
  )
  startDate: string;

  @IsDateString(
    {},
    {
      message: 'A previsão de término deve ser uma data válida (YYYY-MM-DD).',
    },
  )
  endDate: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O orçamento deve ser um número com no máximo 2 casas decimais.' },
  )
  @IsPositive({ message: 'O orçamento deve ser um valor positivo.' })
  budget: number;
}
