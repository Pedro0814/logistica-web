export function formatCurrencyBRL(valueInCents: number | null | undefined): string {
  const cents = typeof valueInCents === 'number' ? valueInCents : 0
  const reais = cents / 100
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function parseCurrencyToCents(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === '') return null
  if (typeof input === 'number') {
    return Math.round(input * 100)
  }
  const normalized = String(input)
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '')

  if (!normalized || normalized === '-' || normalized === '.') return null
  const num = Number(normalized)
  if (Number.isNaN(num)) return null
  return Math.round(num * 100)
}


