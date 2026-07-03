import { type FormEvent, useState } from 'react';

import type { CreateProjectInput, Project } from '../types/project';

export interface ProjectFormProps {
  initial?: Project;
  submitLabel: string;
  submitting: boolean;
  serverError?: string | null;
  onSubmit: (input: CreateProjectInput) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function buildInitialState(project?: Project): FormState {
  return {
    name: project?.name ?? '',
    description: project?.description ?? '',
    startDate: project?.startDate?.slice(0, 10) ?? '',
    endDate: project?.endDate?.slice(0, 10) ?? '',
    budget: project ? String(project.budget) : '',
  };
}

function validate(state: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!state.name.trim()) {
    errors.name = 'Informe o nome do projeto.';
  } else if (state.name.trim().length > 120) {
    errors.name = 'O nome deve ter no máximo 120 caracteres.';
  }

  if (state.description.length > 2000) {
    errors.description = 'A descrição deve ter no máximo 2000 caracteres.';
  }

  if (!state.startDate) {
    errors.startDate = 'Informe a data de início.';
  }
  if (!state.endDate) {
    errors.endDate = 'Informe a previsão de término.';
  }
  if (state.startDate && state.endDate && state.endDate <= state.startDate) {
    errors.endDate = 'O término deve ser posterior à data de início.';
  }

  const budget = Number(state.budget);
  if (!state.budget.trim()) {
    errors.budget = 'Informe o orçamento.';
  } else if (Number.isNaN(budget) || budget <= 0) {
    errors.budget = 'O orçamento deve ser um valor positivo.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(state.budget.trim())) {
    errors.budget = 'Use no máximo 2 casas decimais (ponto como separador).';
  }

  return errors;
}

export function ProjectForm({
  initial,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [state, setState] = useState<FormState>(() => buildInitialState(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      if (touched) setErrors(validate(next));
      return next;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    const validation = validate(state);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    onSubmit({
      name: state.name.trim(),
      description: state.description.trim() || undefined,
      startDate: state.startDate,
      endDate: state.endDate,
      budget: Number(state.budget),
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="form-alert">{serverError}</div>}

      <div className="field">
        <label className="field__label" htmlFor="name">
          Nome <span>*</span>
        </label>
        <input
          id="name"
          className="field__control"
          value={state.name}
          maxLength={120}
          onChange={(e) => update('name', e.target.value)}
          aria-invalid={Boolean(errors.name)}
          placeholder="Ex.: Portal do cliente"
        />
        {errors.name && <span className="field__error">{errors.name}</span>}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="description">
          Descrição
        </label>
        <textarea
          id="description"
          className="field__control"
          value={state.description}
          maxLength={2000}
          onChange={(e) => update('description', e.target.value)}
          aria-invalid={Boolean(errors.description)}
          placeholder="Objetivo, escopo e contexto do projeto…"
        />
        {errors.description && (
          <span className="field__error">{errors.description}</span>
        )}
      </div>

      <div className="form-row">
        <div className="field">
          <label className="field__label" htmlFor="startDate">
            Início <span>*</span>
          </label>
          <input
            id="startDate"
            type="date"
            className="field__control"
            value={state.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            aria-invalid={Boolean(errors.startDate)}
          />
          {errors.startDate && (
            <span className="field__error">{errors.startDate}</span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="endDate">
            Previsão de término <span>*</span>
          </label>
          <input
            id="endDate"
            type="date"
            className="field__control"
            value={state.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            aria-invalid={Boolean(errors.endDate)}
          />
          {errors.endDate && (
            <span className="field__error">{errors.endDate}</span>
          )}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="budget">
          Orçamento (R$) <span>*</span>
        </label>
        <input
          id="budget"
          type="number"
          min="0"
          step="0.01"
          className="field__control"
          value={state.budget}
          onChange={(e) => update('budget', e.target.value)}
          aria-invalid={Boolean(errors.budget)}
          placeholder="Ex.: 50000.00"
        />
        {errors.budget && <span className="field__error">{errors.budget}</span>}
        <span className="hint">
          O nível de risco é calculado automaticamente a partir do orçamento e do
          prazo.
        </span>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting}
        >
          {submitting ? 'Salvando…' : submitLabel}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
