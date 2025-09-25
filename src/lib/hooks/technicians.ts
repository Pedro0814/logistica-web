import { useQuery } from '@tanstack/react-query'

type Technician = { id: string; name: string; email?: string }

export function useTechnicians() {
  // Fallback stub: retorna lista demo; ajustar para Firestore quando disponível
  const query = useQuery({
    queryKey: ['technicians'],
    queryFn: async (): Promise<Technician[]> => {
      console.warn('[useTechnicians] fallback stub in use; replace with Firestore query')
      return [
        { id: 't1', name: 'Téc. 1' },
        { id: 't2', name: 'Téc. 2' },
        { id: 't3', name: 'Téc. 3' },
      ]
    },
  })
  return { options: query.data || [], isLoading: query.isLoading }
}


