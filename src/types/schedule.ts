export type DayType = "TRAVEL" | "INVENTORY" | "RETURN" | "DESCANSO";

export interface DayPlan {
  dateISO: string;         // YYYY-MM-DD
  type: DayType;
  city: string;           // cidade de destino (TRAVEL) / cidade em inventário
  detail: string;         // observações (ex.: "FOR > GRU (G3 1234)" ou "Loja(s): 2 | 320 bens")
  assetsProcessed: number; // horas estimadas do dia
  costs: {
    transport: number
    lodging: number
    perDiem: number
    technician: number
  }
}

export interface CostBreakdown {
  transport: number
  lodging: number
  perDiem: number
  technician: number
  total: number
}

export interface ComputedPlan {
  days: DayPlan[];            // cronograma ordenado
  totalDays: number;          // contagem de dias
  totalAssets: number
  totalCosts: number
}



