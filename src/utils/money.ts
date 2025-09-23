export function formatCurrencyBRL(valueInCents: number | null | undefined): string {
  const cents = typeof valueInCents === 'number' ? valueInCents : 0
  const reais = cents / 100
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function parseCurrencyToCents(input: string | number | null | undefined): number {
  if (typeof input === 'number') {
    // assume already reais
    return Math.round(input * 100)
  }
  if (!input) return 0
  const normalized = String(input)
    .replace(/\s/g, '')
    .replace(/\./g, '') // thousand separators
    .replace(/,/g, '.') // decimal comma
    .replace(/[^0-9.-]/g, '')

  const num = Number(normalized)
  if (Number.isNaN(num)) return 0
  return Math.round(num * 100)
}


