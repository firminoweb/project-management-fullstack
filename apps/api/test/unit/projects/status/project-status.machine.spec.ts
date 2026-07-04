import { ProjectStatus } from '@src/projects/enums/project-status.enum';
import {
  canTransition,
  isDeletable,
} from '@src/projects/status/project-status.machine';

describe('project status machine', () => {
  describe('canTransition', () => {
    it('permite avançar uma etapa por vez', () => {
      expect(
        canTransition(ProjectStatus.EM_ANALISE, ProjectStatus.APROVADO),
      ).toBe(true);
      expect(
        canTransition(ProjectStatus.APROVADO, ProjectStatus.EM_ANDAMENTO),
      ).toBe(true);
      expect(
        canTransition(ProjectStatus.EM_ANDAMENTO, ProjectStatus.ENCERRADO),
      ).toBe(true);
    });

    it('não permite pular etapas', () => {
      expect(
        canTransition(ProjectStatus.EM_ANALISE, ProjectStatus.EM_ANDAMENTO),
      ).toBe(false);
      expect(
        canTransition(ProjectStatus.EM_ANALISE, ProjectStatus.ENCERRADO),
      ).toBe(false);
      expect(
        canTransition(ProjectStatus.APROVADO, ProjectStatus.ENCERRADO),
      ).toBe(false);
    });

    it('permite cancelar a partir de qualquer status ativo', () => {
      expect(
        canTransition(ProjectStatus.EM_ANALISE, ProjectStatus.CANCELADO),
      ).toBe(true);
      expect(
        canTransition(ProjectStatus.APROVADO, ProjectStatus.CANCELADO),
      ).toBe(true);
      expect(
        canTransition(ProjectStatus.EM_ANDAMENTO, ProjectStatus.CANCELADO),
      ).toBe(true);
    });

    it('trata Encerrado e Cancelado como terminais', () => {
      expect(
        canTransition(ProjectStatus.ENCERRADO, ProjectStatus.CANCELADO),
      ).toBe(false);
      expect(
        canTransition(ProjectStatus.CANCELADO, ProjectStatus.APROVADO),
      ).toBe(false);
    });

    it('não permite retroceder status', () => {
      expect(
        canTransition(ProjectStatus.APROVADO, ProjectStatus.EM_ANALISE),
      ).toBe(false);
      expect(
        canTransition(ProjectStatus.EM_ANDAMENTO, ProjectStatus.APROVADO),
      ).toBe(false);
    });
  });

  describe('isDeletable', () => {
    it('bloqueia exclusão de Em andamento e Encerrado', () => {
      expect(isDeletable(ProjectStatus.EM_ANDAMENTO)).toBe(false);
      expect(isDeletable(ProjectStatus.ENCERRADO)).toBe(false);
    });

    it('permite exclusão de Em análise, Aprovado e Cancelado', () => {
      expect(isDeletable(ProjectStatus.EM_ANALISE)).toBe(true);
      expect(isDeletable(ProjectStatus.APROVADO)).toBe(true);
      expect(isDeletable(ProjectStatus.CANCELADO)).toBe(true);
    });
  });
});
