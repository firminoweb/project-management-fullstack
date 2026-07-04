import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { of } from 'rxjs';

import { LoggingInterceptor } from '@src/common/interceptors/logging.interceptor';

function makeContext(method: string, url: string, statusCode: number) {
  const response = new EventEmitter() as EventEmitter & { statusCode: number };
  response.statusCode = statusCode;
  const request = { method, originalUrl: url };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
  return { context, response };
}

const handler: CallHandler = { handle: () => of('payload') };

describe('LoggingInterceptor', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loga (LOG) o método, rota e status ao finalizar a resposta', () => {
    const spy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const { context, response } = makeContext('GET', '/projects', 200);

    new LoggingInterceptor().intercept(context, handler).subscribe();
    response.emit('finish');

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('GET /projects → 200'),
    );
  });

  it('usa WARN para 4xx e ERROR para 5xx', () => {
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const interceptor = new LoggingInterceptor();

    const notFound = makeContext('GET', '/x', 404);
    interceptor.intercept(notFound.context, handler).subscribe();
    notFound.response.emit('finish');

    const boom = makeContext('GET', '/boom', 500);
    interceptor.intercept(boom.context, handler).subscribe();
    boom.response.emit('finish');

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('→ 404'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining('→ 500'));
  });
});
