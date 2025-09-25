"use client"

import Link from 'next/link'
import { useState } from 'react'
import PlannerForm from '@/components/PlannerForm'
import PlannerManager from '@/components/PlannerManager'
import CEPField from '@/components/CEPField'
import MoneyInput from '@/components/MoneyInput'
import WeekendPolicyBuilder from '@/components/WeekendPolicyBuilder'
import TechMultiSelect, { type TechOption } from '@/components/TechMultiSelect'
import FirebaseWarning from '@/components/FirebaseWarning'
import { samplePlanner } from '@/utils/sample'
import { useFirebase } from '@/hooks/useFirebase'
import type { PlannerInput, SavedPlanner } from '@/types/planner'
import PanelCard from '@/components/PanelCard'
import EmptyState from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'

export default function PlannerPage() {
  const { savePlanner, error: firebaseError } = useFirebase()
  const [currentPlanner, setCurrentPlanner] = useState<PlannerInput | null>(null)
  const [currentPlannerId, setCurrentPlannerId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showManager, setShowManager] = useState(false)

  // Demo/local states to showcase integrated components on the planner page
  const [cep, setCep] = useState<string>('')
  const [allowanceExtraCents, setAllowanceExtraCents] = useState<number | null>(0)
  const [weeks, setWeeks] = useState<{ weekIndex: number; saturday: 'work' | 'off'; sunday: 'work' | 'off' }[]>([
    { weekIndex: 1, saturday: 'off', sunday: 'off' },
    { weekIndex: 2, saturday: 'off', sunday: 'off' },
    { weekIndex: 3, saturday: 'off', sunday: 'off' },
    { weekIndex: 4, saturday: 'off', sunday: 'off' },
  ])
  const totalWeeks = 4
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const techOptions: TechOption[] = [
    { id: 'tech-1', name: 'Téc. 1' },
    { id: 'tech-2', name: 'Téc. 2' },
    { id: 'tech-3', name: 'Téc. 3' },
  ]

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
                  />
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

          {/* Integrated demo blocks for CEP, MoneyInput, WeekendPolicy, TechMultiSelect */}
          {!showForm && !showManager && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PanelCard title="Endereço (CEP)">
                  <div className="pt-2">
                    <CEPField
                      value={cep}
                      onChange={setCep}
                      onAutoFill={() => { /* no-op demo */ }}
                    />
                  </div>
                </PanelCard>
                <PanelCard title="Valores">
                  <div className="pt-2">
                    <MoneyInput
                      label="Ajuda de Custo (extra)"
                      valueCents={allowanceExtraCents}
                      onChange={setAllowanceExtraCents}
                    />
                  </div>
                </PanelCard>
              </div>

              <PanelCard title="Regras de Final de Semana">
                <div className="pt-2">
                  <WeekendPolicyBuilder weeks={weeks} onChange={setWeeks} totalWeeks={totalWeeks} />
                </div>
              </PanelCard>

              <PanelCard title="Técnicos">
                <div className="pt-2">
                  <TechMultiSelect value={selectedTechs} onChange={setSelectedTechs} options={techOptions} />
                </div>
              </PanelCard>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}