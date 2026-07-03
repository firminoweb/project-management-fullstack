import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

/**
 * Loga cada requisição HTTP concluída: método, rota, status e tempo de resposta.
 * Dá visibilidade ao consumo da API durante desenvolvimento e demonstração
 * (o Nest não registra requisições por padrão).
 *
 * O log é feito no evento `finish` da resposta — assim o status registrado é o
 * final (ex.: 201/204), já aplicado pelo Nest/filtro de exceções.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const { method, originalUrl } = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();

    response.on('finish', () => {
      const status = response.statusCode;
      const line = `${method} ${originalUrl} → ${status} (${Date.now() - startedAt}ms)`;
      if (status >= 500) this.logger.error(line);
      else if (status >= 400) this.logger.warn(line);
      else this.logger.log(line);
    });

    return next.handle();
  }
}
