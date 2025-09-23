export type CostsCents = {
  ticketsCents: number
  transportLocalCents: number
  hotelCents: number
  foodCents: number
  hydrationCents: number
  allowanceExtraCents: number
}

export function applyEqualizationReplicate(costs: CostsCents): CostsCents {
  return { ...costs }
}

export function applyEqualizationSplit(costs: CostsCents, techniciansCount: number): CostsCents {
  const n = Math.max(techniciansCount, 1)
  const divide = (v: number) => Math.round((v || 0) / n)
  return {
    ticketsCents: divide(costs.ticketsCents),
    transportLocalCents: divide(costs.transportLocalCents),
    hotelCents: divide(costs.hotelCents),
    foodCents: divide(costs.foodCents),
    hydrationCents: divide(costs.hydrationCents),
    allowanceExtraCents: divide(costs.allowanceExtraCents),
  }
}


