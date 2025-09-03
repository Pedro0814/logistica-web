import type { SavedPlanner } from '@/types/planner'
import type { ComputedPlan } from '@/types/schedule'

// Função para converter dados para CSV (formato que Excel pode abrir)
export function exportPlannerToCSV(planner: SavedPlanner, schedule?: ComputedPlan): string {
  const { metadata, data } = planner
  
  // Cabeçalho principal
  const csvRows = [
    ['INVENTORY ROUTE PLANNER - EXPORTAÇÃO'],
    [''],
    ['METADADOS DO PLANEJAMENTO'],
    ['Título', metadata.title],
    ['Técnico', metadata.technicianName],
    ['Cidade de Origem', metadata.originCity],
    ['Total de Cidades', metadata.totalCities.toString()],
    ['Total de Unidades', metadata.totalStores.toString()],
    ['Dias Estimados', metadata.estimatedDays.toString()],
    ['Criado em', new Date(metadata.createdAt).toLocaleDateString('pt-BR')],
    ['Atualizado em', new Date(metadata.updatedAt).toLocaleDateString('pt-BR')],
    [''],
    ['PARÂMETROS GLOBAIS'],
    ['Produtividade (bens/dia)', data.global.assetsPerDay.toString()],
    ['Diária do Técnico', `R$ ${data.global.technicianDailyRate.toFixed(2)}`],
    ['Data de Início', new Date(data.global.startDateISO).toLocaleDateString('pt-BR')],
    ['Trabalhar Finais de Semana', data.global.workWeekends ? 'Sim' : 'Não'],
    [''],
    ['DIÁRIA (ALIMENTAÇÃO E HIDRATAÇÃO)'],
    ['Café da Manhã', `R$ ${data.global.perDiem.breakfast.toFixed(2)}`],
    ['Almoço', `R$ ${data.global.perDiem.lunch.toFixed(2)}`],
    ['Jantar', `R$ ${data.global.perDiem.dinner.toFixed(2)}`],
    ['Água', `R$ ${data.global.perDiem.water.toFixed(2)}`],
    [''],
    ['ITINERÁRIO DETALHADO']
  ]

  // Cabeçalho do itinerário
  csvRows.push([
    'Ordem',
    'Cidade',
    'Hotel',
    'Diária do Hotel',
    'Transporte Local/Dia',
    'Custo Intermunicipal',
    'Unidades',
    'Total de Bens'
  ])

  // Dados do itinerário
  data.itinerary.forEach((cityPlan, index) => {
    const totalAssets = cityPlan.stores.reduce((sum, store) => sum + store.approxAssets, 0)
    csvRows.push([
      (index + 1).toString(),
      cityPlan.city,
      cityPlan.hotelName || '-',
      cityPlan.hotelNightly ? `R$ ${cityPlan.hotelNightly.toFixed(2)}` : '-',
      cityPlan.localTransportPerDay ? `R$ ${cityPlan.localTransportPerDay.toFixed(2)}` : '-',
      cityPlan.intercityCost ? `R$ ${cityPlan.intercityCost.toFixed(2)}` : '-',
      cityPlan.stores.length.toString(),
      totalAssets.toString()
    ])
  })

  // Detalhes das unidades
  csvRows.push([''])
  csvRows.push(['DETALHAMENTO DAS UNIDADES'])
  csvRows.push([
    'Cidade',
    'Nome da Unidade',
    'Endereço',
    'Bens Estimados',
    'Observações'
  ])

  data.itinerary.forEach(cityPlan => {
    cityPlan.stores.forEach(store => {
      csvRows.push([
        cityPlan.city,
        store.name,
        store.addressLine,
        store.approxAssets.toString(),
        '-'
      ])
    })
  })

  // Cronograma (se disponível)
  if (schedule) {
    csvRows.push([''])
    csvRows.push(['CRONOGRAMA EXECUTIVO'])
    csvRows.push([
      'Data',
      'Tipo',
      'Cidade',
      'Detalhes',
      'Bens Processados',
      'Custo Transporte',
      'Custo Hospedagem',
      'Custo Alimentação',
      'Custo Técnico'
    ])

    schedule.days.forEach(day => {
      csvRows.push([
        new Date(day.dateISO).toLocaleDateString('pt-BR'),
        day.type === 'TRAVEL' ? 'Viagem' :
        day.type === 'INVENTORY' ? 'Inventário' :
        day.type === 'RETURN' ? 'Retorno' :
        day.type === 'DESCANSO' ? 'Descanso' : 'Desconhecido',
        day.type === 'DESCANSO' ? 'Fim de Semana' : day.city,
        day.type === 'DESCANSO' ? 'Descanso - Sábado/Domingo' : day.detail,
        day.type === 'DESCANSO' ? '-' : day.assetsProcessed.toString(),
        day.type === 'DESCANSO' ? '-' : `R$ ${day.costs.transport.toFixed(2)}`,
        day.type === 'DESCANSO' ? '-' : `R$ ${day.costs.lodging.toFixed(2)}`,
        day.type === 'DESCANSO' ? '-' : `R$ ${day.costs.perDiem.toFixed(2)}`,
        day.type === 'DESCANSO' ? '-' : `R$ ${day.costs.technician.toFixed(2)}`
      ])
    })

    // Resumo de custos
    csvRows.push([''])
    csvRows.push(['RESUMO DE CUSTOS'])
    csvRows.push(['Item', 'Valor'])
    csvRows.push(['Total de Dias', schedule.totalDays.toString()])
    csvRows.push(['Total de Bens', schedule.totalAssets.toString()])
    csvRows.push(['Custo Total', `R$ ${schedule.totalCosts.toFixed(2)}`])
  }

  // Custo de retorno
  if (data.returnTransportCost) {
    csvRows.push(['Custo de Retorno', `R$ ${data.returnTransportCost.toFixed(2)}`])
  }

  // Converter para CSV
  return csvRows.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(',')
  ).join('\n')
}

// Função para baixar o arquivo CSV
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Função principal para exportar
export function exportPlanner(planner: SavedPlanner, schedule?: ComputedPlan): void {
  const csvContent = exportPlannerToCSV(planner, schedule)
  const filename = `planejamento_${planner.metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`
  downloadCSV(csvContent, filename)
}


