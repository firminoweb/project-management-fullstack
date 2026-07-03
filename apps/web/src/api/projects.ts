import type {
  AiAnalysis,
  CreateProjectInput,
  Project,
  ProjectStatus,
  UpdateProjectInput,
} from '../types/project';
import { apiFetch } from './client';

export const projectsApi = {
  list: () => apiFetch<Project[]>('/projects'),

  get: (id: string) => apiFetch<Project>(`/projects/${id}`),

  create: (input: CreateProjectInput) =>
    apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateProjectInput) =>
    apiFetch<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  changeStatus: (id: string, status: ProjectStatus) =>
    apiFetch<Project>(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  remove: (id: string) =>
    apiFetch<void>(`/projects/${id}`, { method: 'DELETE' }),

  analyze: (id: string) => apiFetch<AiAnalysis>(`/projects/${id}/ai-analysis`),
};
