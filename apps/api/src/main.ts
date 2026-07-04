import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { buildValidationPipe } from './common/validation-pipe.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Libera o consumo pelo frontend. Em dev, sem CORS_ORIGIN definido, libera todas.
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? true,
  });

  // Validação e sanitização automática dos DTOs de entrada (mensagens em PT-BR).
  app.useGlobalPipes(buildValidationPipe());

  // Tratamento centralizado de erros.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Log de cada requisição HTTP (método, rota, status, tempo).
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Documentação OpenAPI/Swagger em /docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Project Management API')
    .setDescription(
      'API REST para gerenciamento de projetos: CRUD, controle de status, ' +
        'cálculo automático de risco e análise textual com apoio de IA.',
    )
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`API rodando em http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger em http://localhost:${port}/docs`);
}

bootstrap();
