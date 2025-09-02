"use client"

import { useState, useEffect } from 'react'
import { useFirebase } from '@/hooks/useFirebase'
import { exportPlanner } from '@/utils/excel'
import type { PlannerMetadata, SavedPlanner } from '@/types/planner'
import type { ComputedPlan } from '@/types/schedule'
import { computeSchedule } from '@/utils/planner'

interface PlannerManagerProps {
  onSelectPlanner: (planner: SavedPlanner) => void
  onExportPlanner?: (planner: SavedPlanner, schedule: ComputedPlan) => void
}

export default function PlannerManager({ onSelectPlanner, onExportPlanner }: PlannerManagerProps) {
  const { loadAllPlanners, loadPlannerById, updatePlannerTitle, deletePlanner, loading, error } = useFirebase()
  const [planners, setPlanners] = useState<PlannerMetadata[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [selectedPlannerId, setSelectedPlannerId] = useState<string | null>(null)

  useEffect(() => {
    loadPlanners()
  }, [])

  const loadPlanners = async () => {
    try {
      const plannersList = await loadAllPlanners()
      setPlanners(plannersList.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ))
    } catch (error) {
      console.error('Erro ao carregar planejamentos:', error)
    }
  }

  const handleEditTitle = (planner: PlannerMetadata) => {
    setEditingId(planner.id)
    setEditingTitle(planner.title)
  }

  const handleSaveTitle = async (id: string) => {
    if (editingTitle.trim()) {
      try {
        await updatePlannerTitle(id, editingTitle.trim())
        await loadPlanners()
      } catch (error) {
        console.error('Erro ao atualizar título:', error)
        alert('Erro ao atualizar título. Tente novamente.')
      }
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleDeletePlanner = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este planejamento? Esta ação não pode ser desfeita.')) {
      try {
        await deletePlanner(id)
        await loadPlanners()
        if (selectedPlannerId === id) {
          setSelectedPlannerId(null)
        }
      } catch (error) {
        console.error('Erro ao excluir planejamento:', error)
        alert('Erro ao excluir planejamento. Tente novamente.')
      }
    }
  }

  const handleSelectPlanner = async (id: string) => {
    try {
      const planner = await loadPlannerById(id)
      if (planner) {
        setSelectedPlannerId(id)
        onSelectPlanner(planner)
      }
    } catch (error) {
      console.error('Erro ao carregar planejamento:', error)
      alert('Erro ao carregar planejamento. Tente novamente.')
    }
  }

  const handleExportPlanner = async (id: string) => {
    try {
      const planner = await loadPlannerById(id)
      if (planner) {
        // Calcular cronograma para exportação
        const schedule = computeSchedule(planner.data, {
          dailyWorkingHours: 8,
          travelHoursPerLeg: 2
        })
        
        if (onExportPlanner) {
          onExportPlanner(planner, schedule)
        } else {
          exportPlanner(planner, schedule)
        }
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar o planejamento. Tente novamente.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (planners.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum Planejamento Salvo</h3>
        <p className="text-gray-600">
          Crie seu primeiro planejamento para começar a organizar suas rotas de inventário.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Meus Planejamentos</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {planners.map((planner) => (
            <div
              key={planner.id}
              className={`border rounded-xl p-4 transition-all duration-200 ${
                selectedPlannerId === planner.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingId === planner.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle(planner.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTitle(planner.id)}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {planner.title}
                      </h3>
                      <button
                        onClick={() => handleEditTitle(planner)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Editar título"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Técnico:</span> {planner.technicianName}
                    </div>
                    <div>
                      <span className="font-medium">Origem:</span> {planner.originCity}
                    </div>
                    <div>
                      <span className="font-medium">Cidades:</span> {planner.totalCities}
                    </div>
                    <div>
                      <span className="font-medium">Unidades:</span> {planner.totalStores}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Criado: {formatDate(planner.createdAt)} | 
                    Atualizado: {formatDate(planner.updatedAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleSelectPlanner(planner.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedPlannerId === planner.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {selectedPlannerId === planner.id ? 'Selecionado' : 'Selecionar'}
                  </button>

                  <button
                    onClick={() => handleExportPlanner(planner.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                    title="Exportar para Excel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Exportar</span>
                  </button>

                  <button
                    onClick={() => handleDeletePlanner(planner.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    title="Excluir planejamento"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

