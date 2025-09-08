// Core data model for the Inventory Route Planner Beta

export type Currency = number; // store BRL as numeric

export interface Store {
  id: string;
  name: string;            // e.g., "Loja Centro"
  addressLine: string;     // full address text
  approxAssets: number;    // estimated assets in this store
}

export interface CityPlan {
  id: string;
  city: string;            // e.g., "Campinas, SP"
  arrivalTransportNote?: string; // manual note: flight/bus ref, etc.
  intercityCost?: Currency; // cost to reach this city from previous stop
  hotelName?: string;
  hotelNightly: Currency;  // cost per night
  localTransportPerDay: Currency; // Uber/taxi within city per day
  stores: Store[];
}

export interface PerDiem {
  breakfast: Currency;
  lunch: Currency;
  dinner: Currency;
  water: Currency;
}

export interface GlobalInputs {
  technicianName: string;
  originCity: string;          // e.g., "Fortaleza, CE"
  startDateISO: string;        // trip departure date (YYYY-MM-DD)
  assetsPerDay: number;        // productivity (assets/day)
  technicianDailyRate: Currency; // per-day pay (diária)
  perDiem: PerDiem;
  workWeekends: boolean; // Novo campo para controlar finais de semana
  // Tipo de operação: com viagem (default) ou regional (sem pernoite/viagens intermunicipais)
  operationType?: 'travel' | 'regional';
  // Opções específicas para operação regional
  regionalOptions?: {
    lunchEnabled: boolean;
    waterEnabled: boolean;
  };
}

export interface PlannerInput {
  global: GlobalInputs;
  itinerary: CityPlan[];       // ordered list of cities to visit
  returnTransportCost?: Currency; // cost from last city back to origin
  // Bloco financeiro opcional salvo no rascunho
  financial?: FinancialInput;
}

// Novos tipos para gerenciamento de planejamentos
export interface PlannerMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  technicianName: string;
  originCity: string;
  totalCities: number;
  totalStores: number;
  estimatedDays: number;
}

export interface SavedPlanner {
  metadata: PlannerMetadata;
  data: PlannerInput;
}

export interface PlannerList {
  planners: PlannerMetadata[];
}




// ==========================
// Financeiro
// ==========================
export type CostCategory = 'Transport' | 'Lodging' | 'PerDiem' | 'Technician'

export interface FinancialInput {
  billedAmount: number; // Valor cobrado (R$)
  taxPercent: number;   // % impostos (default 9.65)
  actualCosts?: Partial<Record<CostCategory, number>>; // custos reais por categoria (opcional)
}

