export function formatPrice(value: number | null): string {
  if (value === null) return 'Sob consulta'

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}
