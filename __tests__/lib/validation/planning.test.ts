import { describe, it, expect } from 'vitest'
import { validatePlanningPatch } from '@/lib/validation/planning'

describe('validatePlanningPatch', () => {
  it('accepts a minimal valid patch', () => {
    const res = validatePlanningPatch({
      date: '2025-01-15',
      unitId: 'u1',
      techIds: ['t1'],
      plannedAssets: 10,
      plannedCosts: { ticketsCents: 0 },
    })
    expect(res.ok).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('rejects invalid ISO date', () => {
    const res = validatePlanningPatch({ date: '15/01/2025' })
    expect(res.ok).toBe(false)
    expect(res.errors[0]).toMatch(/Data inválida/i)
  })

  it('rejects negative cents in costs', () => {
    const res = validatePlanningPatch({ plannedCosts: { hotelCents: -1 } as any })
    expect(res.ok).toBe(false)
    expect(res.errors[0]).toMatch(/centavos/i)
  })

  it('rejects non-integer plannedAssets', () => {
    const res = validatePlanningPatch({ plannedAssets: 3.5 as any })
    expect(res.ok).toBe(false)
    expect(res.errors[0]).toMatch(/inteiro/i)
  })

  it('rejects invalid techIds', () => {
    const res = validatePlanningPatch({ techIds: ["", 1 as any] })
    expect(res.ok).toBe(false)
    expect(res.errors[0]).toMatch(/techIds/i)
  })
})


