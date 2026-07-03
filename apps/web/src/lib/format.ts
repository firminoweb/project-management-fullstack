/** Formata um valor numérico como moeda brasileira (R$). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data ISO (YYYY-MM-DD) como DD/MM/AAAA sem passar por Date,
 * evitando deslocamento de fuso horário.
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-');
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  return iso;
}

/** Formata um timestamp ISO completo como data e hora locais. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
