import { type FormEvent, useState } from 'react';

import type { CreateProjectInput, Project } from '../types/project';

const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;

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
type TouchedFields = Record<keyof FormState, boolean>;

const NOT_TOUCHED: TouchedFields = {
  name: false,
  description: false,
  startDate: false,
  endDate: false,
  budget: false,
};

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
  } else if (state.name.trim().length > NAME_MAX) {
    errors.name = `O nome deve ter no máximo ${NAME_MAX} caracteres.`;
  }

  if (state.description.length > DESCRIPTION_MAX) {
    errors.description = `A descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres.`;
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
  const [touched, setTouched] = useState<TouchedFields>(NOT_TOUCHED);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validação em tempo real: recalculada a cada render.
  const errors = validate(state);
  const isValid = Object.keys(errors).length === 0;

  // Um erro só é exibido depois que o campo é tocado ou após tentar enviar.
  const errorOf = (key: keyof FormState) =>
    touched[key] || submitAttempted ? errors[key] : undefined;

  function update<K extends keyof FormState>(key: K, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function markTouched(key: keyof FormState) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;

    onSubmit({
      name: state.name.trim(),
      description: state.description.trim() || undefined,
      startDate: state.startDate,
      endDate: state.endDate,
      budget: Number(state.budget),
    });
  }

  const nameError = errorOf('name');
  const descriptionError = errorOf('description');
  const startDateError = errorOf('startDate');
  const endDateError = errorOf('endDate');
  const budgetError = errorOf('budget');

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
          maxLength={NAME_MAX}
          onChange={(e) => update('name', e.target.value)}
          onBlur={() => markTouched('name')}
          aria-invalid={Boolean(nameError)}
          placeholder="Ex.: Portal do cliente"
        />
        <div className="field__meta">
          {nameError && <span className="field__error">{nameError}</span>}
          <span
            className="field__counter"
            data-limit={state.name.length >= NAME_MAX}
          >
            {state.name.length}/{NAME_MAX}
          </span>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="description">
          Descrição
        </label>
        <textarea
          id="description"
          className="field__control"
          value={state.description}
          maxLength={DESCRIPTION_MAX}
          onChange={(e) => update('description', e.target.value)}
          onBlur={() => markTouched('description')}
          aria-invalid={Boolean(descriptionError)}
          placeholder="Objetivo, escopo e contexto do projeto…"
        />
        <div className="field__meta">
          {descriptionError && (
            <span className="field__error">{descriptionError}</span>
          )}
          <span
            className="field__counter"
            data-limit={state.description.length >= DESCRIPTION_MAX}
          >
            {state.description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
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
            onBlur={() => markTouched('startDate')}
            aria-invalid={Boolean(startDateError)}
          />
          {startDateError && (
            <span className="field__error">{startDateError}</span>
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
            onBlur={() => markTouched('endDate')}
            aria-invalid={Boolean(endDateError)}
          />
          {endDateError && (
            <span className="field__error">{endDateError}</span>
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
          onBlur={() => markTouched('budget')}
          aria-invalid={Boolean(budgetError)}
          placeholder="Ex.: 50000.00"
        />
        {budgetError && <span className="field__error">{budgetError}</span>}
        <span className="hint">
          O nível de risco é calculado automaticamente a partir do orçamento e do
          prazo.
        </span>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting || !isValid}
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
