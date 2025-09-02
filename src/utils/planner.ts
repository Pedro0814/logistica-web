import type { PlannerInput } from '@/types/planner'
import type { DayPlan, DayType, CostBreakdown, ComputedPlan } from '@/types/schedule'

export type Assumptions = {
  dailyWorkingHours: number // default 8
  travelHoursPerLeg: number // default 2
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function formatISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const dt = new Date(date.getTime())
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt
}

function ceilDays(hours: number, hoursPerDay: number): number {
  const days = hours / hoursPerDay
  return Math.ceil(days)
}

export function computeSchedule(input: PlannerInput, assumptions: Assumptions): ComputedPlan {
  const { dailyWorkingHours = 8, travelHoursPerLeg = 2 } = assumptions
  const assetsPerDay = input.global.assetsPerDay || 150
  const workWeekends = input.global.workWeekends || false

  const days: DayPlan[] = []
  let currentDate = new Date(input.global.startDateISO)
  let totalAssets = 0

  // Função para verificar se é final de semana
  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // 0 = domingo, 6 = sábado
  }

  // Função para adicionar dias de descanso se necessário
  const addRestDaysIfNeeded = (startDate: Date, endDate: Date) => {
    if (workWeekends) return // Se trabalhar finais de semana, não adicionar descanso
    
    const current = new Date(startDate)
    current.setDate(current.getDate() + 1) // Começar do dia seguinte
    
    while (current < endDate) {
      if (isWeekend(current)) {
        days.push({
          dateISO: current.toISOString().split('T')[0],
          type: "DESCANSO",
          city: "Fim de Semana",
          detail: "Descanso - Sábado/Domingo",
          assetsProcessed: 0,
          costs: {
            transport: 0,
            lodging: 0,
            perDiem: 0,
            technician: 0,
          }
        })
      }
      current.setDate(current.getDate() + 1)
    }
  }

  // Função para avançar para o próximo dia útil
  const nextWorkDay = (date: Date) => {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    
    // Se não trabalhar finais de semana, pular sábados e domingos
    if (!workWeekends) {
      while (isWeekend(next)) {
        next.setDate(next.getDate() + 1)
      }
    }
    
    return next
  }

  // Dia 1: Viagem para primeira cidade
  if (input.itinerary.length > 0) {
    days.push({
      dateISO: currentDate.toISOString().split('T')[0],
      type: "TRAVEL",
      city: input.itinerary[0].city,
      detail: `Entrada/Deslocamento/Saída: ${input.itinerary[0].city}`,
      assetsProcessed: 0,
      costs: {
        transport: input.itinerary[0].intercityCost || 0,
        lodging: 0,
        perDiem: 0,
        technician: 0,
      }
    })
    
    const previousDate = new Date(currentDate)
    currentDate = nextWorkDay(currentDate)
    
    // Adicionar dias de descanso entre a data anterior e a próxima data útil
    addRestDaysIfNeeded(previousDate, currentDate)
  }

  // Processar cada cidade
  for (let i = 0; i < input.itinerary.length; i++) {
    const cityPlan = input.itinerary[i]
    const cityAssets = cityPlan.stores.reduce((sum, store) => sum + (store.approxAssets || 0), 0)
    const daysNeeded = Math.ceil(cityAssets / assetsPerDay)
    
    // Dias de inventário para esta cidade
    for (let day = 0; day < daysNeeded; day++) {
      const remainingAssets = cityAssets - (day * assetsPerDay)
      const assetsToday = Math.min(assetsPerDay, remainingAssets)
      
      days.push({
        dateISO: currentDate.toISOString().split('T')[0],
        type: "INVENTORY",
        city: cityPlan.city,
        detail: `Unidades: ${cityPlan.stores.length} | ${assetsToday} bens (hotel ⇄ unidade)`,
        assetsProcessed: assetsToday,
        costs: {
          transport: cityPlan.localTransportPerDay || 0,
          lodging: cityPlan.hotelNightly || 0,
          perDiem: Object.values(input.global.perDiem).reduce((sum, value) => sum + value, 0),
          technician: input.global.technicianDailyRate || 0,
        }
      })
      
      totalAssets += assetsToday
      
      const previousDate = new Date(currentDate)
      currentDate = nextWorkDay(currentDate)
      
      // Adicionar dias de descanso entre a data anterior e a próxima data útil
      addRestDaysIfNeeded(previousDate, currentDate)
    }

    // Viagem para próxima cidade (exceto na última)
    if (i < input.itinerary.length - 1) {
      const nextCity = input.itinerary[i + 1]
      days.push({
        dateISO: currentDate.toISOString().split('T')[0],
        type: "TRAVEL",
        city: nextCity.city,
        detail: `Entrada/Deslocamento/Saída: ${nextCity.city}`,
        assetsProcessed: 0,
        costs: {
          transport: nextCity.intercityCost || 0,
          lodging: 0,
          perDiem: 0,
          technician: 0,
        }
      })
      
      const previousDate = new Date(currentDate)
      currentDate = nextWorkDay(currentDate)
      
      // Adicionar dias de descanso entre a data anterior e a próxima data útil
      addRestDaysIfNeeded(previousDate, currentDate)
    }
  }

  // Viagem de retorno
  if (input.itinerary.length > 0) {
    days.push({
      dateISO: currentDate.toISOString().split('T')[0],
      type: "RETURN",
      city: input.global.originCity,
      detail: "Retorno para cidade de origem",
      assetsProcessed: 0,
      costs: {
        transport: input.returnTransportCost || 0,
        lodging: 0,
        perDiem: 0,
        technician: 0,
      }
    })
  }

  // Ordenar os dias por data
  days.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())

  return {
    days,
    totalDays: days.length,
    totalAssets,
    totalCosts: 0 // Será calculado depois
  }
}

export function computeCosts(input: PlannerInput, schedule: ComputedPlan): CostBreakdown {
  const breakdown = {
    transport: 0,
    lodging: 0,
    perDiem: 0,
    technician: 0,
    total: 0
  }

  // Calcular custos baseados nos dias do cronograma (excluindo dias de descanso)
  schedule.days
    .filter(day => day.type !== 'DESCANSO')
    .forEach(day => {
      breakdown.transport += day.costs.transport
      breakdown.lodging += day.costs.lodging
      breakdown.perDiem += day.costs.perDiem
      breakdown.technician += day.costs.technician
    })

  breakdown.total = breakdown.transport + breakdown.lodging + breakdown.perDiem + breakdown.technician

  return breakdown
}


