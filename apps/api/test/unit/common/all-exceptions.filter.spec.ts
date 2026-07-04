import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { AllExceptionsFilter } from '@src/common/filters/all-exceptions.filter';

function makeHost(url = '/test') {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  afterEach(() => jest.restoreAllMocks());

  it('preserva status e mensagem de uma HttpException com objeto', () => {
    const { host, status, json } = makeHost();
    filter.catch(new BadRequestException('Dados inválidos'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'Dados inválidos' }),
    );
  });

  it('lida com HttpException cuja resposta é string', () => {
    const { host, json } = makeHost();
    filter.catch(
      new HttpException('mensagem simples', HttpStatus.FORBIDDEN),
      host,
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, message: 'mensagem simples' }),
    );
  });

  it('mapeia erro inesperado para 500 sem vazar o detalhe', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { host, status, json } = makeHost();

    filter.catch(new Error('boom interno'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Erro interno do servidor.',
      }),
    );
  });
});
