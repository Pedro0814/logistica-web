import type { PlannerInput } from '@/types/planner'

export const samplePlanner: PlannerInput = {
  global: {
    technicianName: 'João Silva',
    originCity: 'São Paulo',
    startDateISO: '2025-01-01',
    assetsPerDay: 150,
    technicianDailyRate: 200,
    perDiem: { breakfast: 15, lunch: 25, dinner: 30, water: 5 },
    workWeekends: false, // Padrão: não trabalhar finais de semana
  },
  itinerary: [
    {
      id: crypto.randomUUID(),
      city: 'Campinas',
      arrivalTransportNote: 'Ônibus executivo',
      intercityCost: 45,
      hotelName: 'Hotel Campinas Plaza',
      hotelNightly: 120,
      localTransportPerDay: 25,
      stores: [
        { id: crypto.randomUUID(), name: 'Loja Centro', addressLine: 'Rua das Flores, 123, Centro', approxAssets: 200 },
        { id: crypto.randomUUID(), name: 'Loja Taquaral', addressLine: 'Av. Taquaral, 456, Taquaral', approxAssets: 150 },
      ],
    },
    {
      id: crypto.randomUUID(),
      city: 'Sorocaba',
      arrivalTransportNote: 'Van compartilhada',
      intercityCost: 35,
      hotelName: 'Hotel Sorocaba Business',
      hotelNightly: 100,
      localTransportPerDay: 20,
      stores: [
        { id: crypto.randomUUID(), name: 'Loja Sorocaba', addressLine: 'Rua da Paz, 789, Centro', approxAssets: 180 },
      ],
    },
  ],
  returnTransportCost: 40,
}



