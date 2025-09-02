"use client"

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { loadPlannerDraft, clearPlannerDraft, loadAllPlanners, loadPlannerById } from '@/utils/storage'
import { computeSchedule, computeCosts, type Assumptions } from '@/utils/planner'
import type { PlannerInput, SavedPlanner } from '@/types/planner'
import type { DayPlan } from '@/types/schedule'
import dynamic from "next/dynamic";

const RouteMapLeaflet = dynamic(() => import("@/components/RouteMapLeaflet"), { ssr: false });

// Função para formatar datas no formato brasileiro
function formatBR(dateISO: string): string {
  const date = new Date(dateISO)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function SchedulePage() {
  const [assumptions, setAssumptions] = useState<Assumptions>({
    dailyWorkingHours: 8,
    travelHoursPerLeg: 2,
  })

  const [currentPlanner, setCurrentPlanner] = useState<PlannerInput | null>(null)
  const [plannerTitle, setPlannerTitle] = useState<string>('')
  const [showPlannerSelector, setShowPlannerSelector] = useState(false)

  // Carregar rascunho ou último planejamento salvo
  useEffect(() => {
    const draft = loadPlannerDraft<PlannerInput>()
    if (draft) {
      setCurrentPlanner(draft)
      setPlannerTitle('Rascunho Atual')
    } else {
      // Tentar carregar o último planejamento salvo
      const planners = loadAllPlanners()
      if (planners.planners.length > 0) {
        const lastPlanner = loadPlannerById(planners.planners[0].id)
        if (lastPlanner) {
          setCurrentPlanner(lastPlanner.data)
          setPlannerTitle(lastPlanner.metadata.title)
        }
      }
    }
  }, [])

  const schedule = useMemo(() => {
    if (!currentPlanner) return null
    const sched = computeSchedule(currentPlanner, assumptions)
    const costs = computeCosts(currentPlanner, sched)
    return { ...sched, totalCosts: costs.total }
  }, [currentPlanner, assumptions])

  const [recalcKey, setRecalcKey] = useState(0)
  const recalc = () => setRecalcKey((k) => k + 1)

  const handleLoadPlanner = (planner: SavedPlanner) => {
    setCurrentPlanner(planner.data)
    setPlannerTitle(planner.metadata.title)
    setShowPlannerSelector(false)
  }

  const handleClearDraft = () => {
    if (confirm('Tem certeza que deseja limpar o rascunho atual?')) {
      clearPlannerDraft()
      setCurrentPlanner(null)
      setPlannerTitle('')
      alert('Rascunho limpo com sucesso!')
    }
  }

  if (!currentPlanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Nenhum Plano Encontrado</h1>
            <p className="text-gray-600 mb-8">
              Você precisa criar um plano primeiro para visualizar o cronograma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/planner" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Criar Plano</span>
              </Link>
              
              <button
                onClick={() => setShowPlannerSelector(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Carregar Plano Salvo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/planner" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cronograma e Custos</h1>
                {plannerTitle && (
                  <p className="text-sm text-gray-600 mt-1">{plannerTitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowPlannerSelector(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Trocar Plano</span>
              </button>
              
              <button 
                onClick={handleClearDraft}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Limpar Rascunho</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Planner Selector Modal */}
      {showPlannerSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Selecionar Planejamento</h2>
            </div>
            <div className="p-6">
              <PlannerSelector onSelect={handleLoadPlanner} onClose={() => setShowPlannerSelector(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Mapa do Itinerário (OSM)</h2>
              </div>
            </div>
            <div className="p-6">
              <RouteMapLeaflet key={recalcKey} />
            </div>
          </div>

          {/* Assumptions Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Painel de Suposições</h2>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Horas de trabalho por dia</label>
                  <input
                    type="number"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    value={assumptions.dailyWorkingHours}
                    onChange={(e) => setAssumptions((prev: Assumptions) => ({ ...prev, dailyWorkingHours: Number(e.target.value) }))}
                    min="1"
                    max="24"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Horas de viagem por trecho</label>
                  <input
                    type="number"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    value={assumptions.travelHoursPerLeg}
                    onChange={(e) => setAssumptions((prev: Assumptions) => ({ ...prev, travelHoursPerLeg: Number(e.target.value) }))}
                    min="0"
                    max="24"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  onClick={recalc}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Recalcular</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Tabela do Cronograma</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bens Processados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedule?.days.map((day, index) => (
                      <tr key={index} className={day.type === 'DESCANSO' ? 'bg-gray-50' : 'hover:bg-gray-50 transition-colors duration-200'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatBR(day.dateISO)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            day.type === 'TRAVEL' ? 'bg-blue-100 text-blue-800' :
                            day.type === 'INVENTORY' ? 'bg-green-100 text-green-800' :
                            day.type === 'RETURN' ? 'bg-purple-100 text-purple-800' :
                            day.type === 'DESCANSO' ? 'bg-gray-100 text-gray-600' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {day.type === 'TRAVEL' ? 'Viagem' :
                             day.type === 'INVENTORY' ? 'Inventário' :
                             day.type === 'RETURN' ? 'Retorno' :
                             day.type === 'DESCANSO' ? 'Descanso' :
                             'Desconhecido'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.type === 'DESCANSO' ? 'Fim de Semana' : day.city}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          {day.type === 'DESCANSO' ? 'Descanso - Sábado/Domingo' : day.detail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.type === 'DESCANSO' ? '-' : (day.assetsProcessed > 0 ? day.assetsProcessed : '-')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.type === 'DESCANSO' ? '-' : (
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Transporte:</span>
                                <span className="font-medium">R$ {day.costs.transport.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Hospedagem:</span>
                                <span className="font-medium">R$ {day.costs.lodging.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Alimentação:</span>
                                <span className="font-medium">R$ {day.costs.perDiem.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Técnico:</span>
                                <span className="font-medium">R$ {day.costs.technician.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Costs Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Resumo de Custos</h2>
              </div>
            </div>
            
            <div className="p-8">
              {schedule ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Resumo Geral
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total de dias:</span>
                        <span className="text-lg font-bold text-gray-900">{schedule.totalDays}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total de bens:</span>
                        <span className="text-lg font-bold text-gray-900">{schedule.totalAssets}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                        <span className="text-lg font-semibold text-gray-800">Custo total:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          R$ {schedule.totalCosts.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Detalhamento
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transporte:</span>
                        <span className="font-semibold text-gray-900">R$ {schedule.days.filter(day => day.type !== 'DESCANSO').reduce((sum, day) => sum + day.costs.transport, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hospedagem:</span>
                        <span className="font-semibold text-gray-900">R$ {schedule.days.filter(day => day.type !== 'DESCANSO').reduce((sum, day) => sum + day.costs.lodging, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Alimentação:</span>
                        <span className="font-semibold text-gray-900">R$ {schedule.days.filter(day => day.type !== 'DESCANSO').reduce((sum, day) => sum + day.costs.perDiem, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Técnico:</span>
                        <span className="font-semibold text-gray-900">R$ {schedule.days.filter(day => day.type !== 'DESCANSO').reduce((sum, day) => sum + day.costs.technician, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Sem dados para exibir.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para seleção de planejamentos
function PlannerSelector({ onSelect, onClose }: { onSelect: (planner: SavedPlanner) => void; onClose: () => void }) {
  const planners = loadAllPlanners()

  if (planners.planners.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Nenhum planejamento salvo encontrado.</p>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Fechar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto space-y-3">
        {planners.planners.map((planner) => (
          <div
            key={planner.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            onClick={() => {
              const fullPlanner = loadPlannerById(planner.id)
              if (fullPlanner) {
                onSelect(fullPlanner)
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{planner.title}</h3>
                <p className="text-sm text-gray-600">
                  {planner.technicianName} • {planner.originCity}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {planner.totalCities} cidades • {planner.totalStores} unidades
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}


