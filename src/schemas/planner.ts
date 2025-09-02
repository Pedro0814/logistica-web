import { z } from 'zod'

// Schemas mirroring src/types/planner.ts

export const CurrencySchema = z.number().finite().min(0, 'Valor inválido')

export const StoreSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Nome obrigatório'),
  addressLine: z.string().min(1, 'Endereço obrigatório'),
  approxAssets: z.number().int().min(0),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export const CityPlanSchema = z.object({
  id: z.string().min(1),
  city: z.string().min(1, 'Cidade obrigatória'),
  arrivalTransportNote: z.string().optional(),
  intercityCost: CurrencySchema.optional(),
  hotelName: z.string().optional(),
  hotelNightly: CurrencySchema,
  localTransportPerDay: CurrencySchema,
  stores: z.array(StoreSchema).min(1, 'Inclua pelo menos uma loja'),
})

export const PerDiemSchema = z.object({
  breakfast: CurrencySchema,
  lunch: CurrencySchema,
  dinner: CurrencySchema,
  water: CurrencySchema,
})

export const GlobalInputsSchema = z.object({
  technicianName: z.string().min(1, 'Nome é obrigatório'),
  originCity: z.string().min(1, 'Cidade de origem é obrigatória'),
  startDateISO: z.string().min(1, 'Data de início é obrigatória'),
  assetsPerDay: z.number().int().positive('Produtividade deve ser positiva'),
  technicianDailyRate: CurrencySchema,
  perDiem: PerDiemSchema,
  workWeekends: z.boolean().default(false), // Novo campo com padrão false
})

export const PlannerInputSchema = z.object({
  global: GlobalInputsSchema,
  itinerary: z.array(CityPlanSchema).min(1, 'Inclua pelo menos uma cidade'),
  returnTransportCost: CurrencySchema.optional(),
})

export type Currency = z.infer<typeof CurrencySchema>
export type Store = z.infer<typeof StoreSchema>
export type CityPlan = z.infer<typeof CityPlanSchema>
export type PerDiem = z.infer<typeof PerDiemSchema>
export type GlobalInputs = z.infer<typeof GlobalInputsSchema>
export type PlannerInput = z.infer<typeof PlannerInputSchema>


