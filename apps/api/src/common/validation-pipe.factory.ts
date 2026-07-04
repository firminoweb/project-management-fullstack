import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Achata as mensagens de validação. O caso de "campo não permitido"
 * (whitelist) tem mensagem padrão em inglês no class-validator, então é
 * traduzido aqui; as demais já vêm em português definidas nos DTOs.
 */
function collectMessages(errors: ValidationError[]): string[] {
  const messages: string[] = [];
  for (const error of errors) {
    if (error.constraints) {
      for (const [rule, message] of Object.entries(error.constraints)) {
        messages.push(
          rule === 'whitelistValidation'
            ? `Campo não permitido: "${error.property}".`
            : message,
        );
      }
    }
    if (error.children?.length) {
      messages.push(...collectMessages(error.children));
    }
  }
  return messages;
}

/**
 * ValidationPipe global da aplicação, centralizado para que a API (main.ts) e
 * os testes e2e usem exatamente a mesma configuração — e todas as mensagens de
 * validação saiam em português.
 */
export function buildValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new BadRequestException(collectMessages(errors)),
  });
}
