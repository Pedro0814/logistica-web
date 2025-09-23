export type UnitLike = {
  id?: string
  name?: string
  code?: string
  addressLine?: string
  cep?: string
}

export function getUnitLabel(unit: UnitLike | undefined | null, opts?: { withCEP?: boolean }) {
  if (!unit) return '—'
  const base = unit.name || unit.addressLine || unit.code || '—'
  if (opts?.withCEP && unit.cep) return `${base} — ${unit.cep}`
  return base
}


