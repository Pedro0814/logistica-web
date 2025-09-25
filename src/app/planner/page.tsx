"use client"

import Link from 'next/link'
import { useState } from 'react'
import PlannerForm from '@/components/PlannerForm'
import PlannerManager from '@/components/PlannerManager'
// Removed demo integrations; components are now rendered inside PlannerForm steps
import FirebaseWarning from '@/components/FirebaseWarning'
import { samplePlanner } from '@/utils/sample'
import { useFirebase } from '@/hooks/useFirebase'
import { useUnits } from '@/lib/hooks/units'
import { useTechnicians } from '@/lib/hooks/technicians'
import { useWeekendPolicy } from '@/lib/hooks/weekendPolicy'
import { usePlanners } from '@/lib/hooks/planners'
import type { PlannerInput, SavedPlanner } from '@/types/planner'
import PanelCard from '@/components/PanelCard'
import EmptyState from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { getCurrentUserRole, canEditPlanning } from '@/lib/auth/roles'

export default function PlannerPage() {
  const { savePlanner, error: firebaseError } = useFirebase()
  const [currentPlanner, setCurrentPlanner] = useState<PlannerInput | null>(null)
  const [currentPlannerId, setCurrentPlannerId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showManager, setShowManager] = useState(false)

  // Hooks reais (ou stubs seguros)
  const { planners } = usePlanners()
  const { options: techOptions } = useTechnicians()
  const { units } = useUnits(currentPlannerId || 'op-planner')
  const { data: weekendPolicy } = useWeekendPolicy(null, currentPlannerId || 'op-planner')

  const role = getCurrentUserRole()
  const readOnly = !canEditPlanning(role)


  const handleCreateNew = () => {
    setCurrentPlanner(null)
    setCurrentPlannerId(null)
    setShowForm(true)
    setShowManager(false)
  }

  const handleLoadSample = () => {
    setCurrentPlanner(samplePlanner)
    setCurrentPlannerId(null) // Sample não tem ID
    setShowForm(true)
    setShowManager(false)
  }

  const handleLoadDraft = () => {
    // Por enquanto, vamos desabilitar esta funcionalidade
    // pois não temos mais localStorage para rascunhos
    alert('Funcionalidade de rascunho temporariamente indisponível.')
  }

  const handleSubmit = async (values: PlannerInput, title: string) => {
    try {
      const plannerId = await savePlanner(values, title)
      setCurrentPlannerId(plannerId) // Armazenar o ID para anexos
      alert(`Planejamento "${title}" salvo com sucesso! ID: ${plannerId}`)
      setShowForm(false)
      setShowManager(true)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar o planejamento. Tente novamente.')
    }
  }

  const handleSelectPlanner = (planner: SavedPlanner) => {
    setCurrentPlanner(planner.data)
    setCurrentPlannerId(planner.metadata.id) // Armazenar o ID para anexos
    setShowForm(true)
    setShowManager(false)
  }

  const handleExportPlanner = (planner: SavedPlanner) => {
    // A exportação será feita pelo PlannerManager
    console.log('Exportando planejamento:', planner.metadata.title)
  }

  const handleBackToManager = () => {
    setShowForm(false)
    setShowManager(true)
    setCurrentPlanner(null)
    setCurrentPlannerId(null)
  }

  const handleClearDraft = () => {
    // Por enquanto, vamos desabilitar esta funcionalidade
    // pois não temos mais localStorage para rascunhos
    alert('Funcionalidade de rascunho temporariamente indisponível.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Planejador de Rotas</h1>
            </div>
            <div className="hidden md:block">
              <span className="text-sm text-gray-500">Planejador de Rotas</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/planner/schedule">
                <Button>Ver Cronograma</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
      <div className="py-8">
        <main className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="w-full space-y-6 pb-28">
          {/* Firebase Warning */}
          {firebaseError && <FirebaseWarning />}
          
          {/* Action Empty State */}
          {!showForm && !showManager && (
            <EmptyState
              title="Bem-vindo ao Planejador de Rotas"
              description="Crie novos planejamentos, carregue exemplos ou gerencie seus planejamentos existentes"
              action={
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleCreateNew}>Criar Novo Planejamento</Button>
                  <Button variant="secondary" onClick={handleLoadSample}>Carregar Exemplo</Button>
                  <Button variant="outline" onClick={() => setShowManager(true)}>Gerenciar Planejamentos</Button>
                </div>
              }
            />
          )}

          {/* Form Section */}
          {showForm && (
            <div>
              <PanelCard
                title={currentPlanner ? 'Editando Planejamento' : 'Novo Planejamento'}
                right={
                  <div className="flex items-center gap-2">
                    {currentPlanner && (
                      <Button variant="destructive" onClick={handleClearDraft}>Limpar Rascunho</Button>
                    )}
                    <Button variant="secondary" onClick={handleBackToManager}>Voltar</Button>
                  </div>
                }
              >
                <div className="relative">
                  <PlannerForm
                    initial={currentPlanner ? {
                      ...currentPlanner,
                      global: {
                        ...currentPlanner.global,
                        operationType: currentPlanner.global.operationType ?? 'travel',
                        regionalOptions: currentPlanner.global.regionalOptions ?? { lunchEnabled: false, waterEnabled: false },
                      }
                    } : undefined}
                    plannerId={currentPlannerId || undefined}
                    onSubmit={handleSubmit}
                    // Nota: o PlannerForm já contém os componentes integrados.
                    // Os hooks acima estão carregados aqui para futura passagem via context/props quando necessário.
                    readOnly={readOnly as any}
                  />
                  {readOnly && (
                    <div className="absolute -top-8 right-0 text-xs text-gray-600">
                      Somente leitura (seu perfil: {role})
                    </div>
                  )}
                </div>
              </PanelCard>
            </div>
          )}

          {/* Manager Section */}
          {showManager && (
            <div>
              <PanelCard
                title="Gerenciar Planejamentos"
                right={<Button variant="secondary" onClick={() => setShowManager(false)}>Voltar</Button>}
              >
                <p className="text-sm text-gray-600 mb-4">Visualize, edite e exporte seus planejamentos salvos</p>
                <PlannerManager
                  onSelectPlanner={handleSelectPlanner}
                  onExportPlanner={handleExportPlanner}
                />
              </PanelCard>
            </div>
          )}

          {/* Nenhum bloco adicional aqui; os componentes são exibidos dentro do PlannerForm após iniciar */}
          </div>
        </main>
      </div>
    </div>
  )
}