"use client"

import Link from 'next/link'
import { useState } from 'react'
import PlannerForm from '@/components/PlannerForm'
import PlannerManager from '@/components/PlannerManager'
import FirebaseWarning from '@/components/FirebaseWarning'
import { samplePlanner } from '@/utils/sample'
import { useFirebase } from '@/hooks/useFirebase'
import type { PlannerInput, SavedPlanner } from '@/types/planner'

export default function PlannerPage() {
  const { savePlanner, error: firebaseError } = useFirebase()
  const [currentPlanner, setCurrentPlanner] = useState<PlannerInput | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showManager, setShowManager] = useState(false)

  const handleCreateNew = () => {
    setCurrentPlanner(null)
    setShowForm(true)
    setShowManager(false)
  }

  const handleLoadSample = () => {
    setCurrentPlanner(samplePlanner)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Planejador de Rotas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/planner/schedule"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Ver Cronograma</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Firebase Warning */}
          {firebaseError && <FirebaseWarning />}
          
          {/* Action Buttons */}
          {!showForm && !showManager && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Bem-vindo ao Planejador de Rotas</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Crie novos planejamentos, carregue exemplos ou gerencie seus planejamentos existentes
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Criar Novo Planejamento</span>
                </button>
                
                <button
                  onClick={handleLoadSample}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Carregar Exemplo</span>
                </button>
                
                <button
                  onClick={() => setShowManager(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Gerenciar Planejamentos</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Section */}
          {showForm && (
            <div className="space-y-8">
              {/* Form Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentPlanner ? 'Editando Planejamento' : 'Novo Planejamento'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {currentPlanner ? 'Modifique os dados do planejamento selecionado' : 'Preencha os dados para criar um novo planejamento'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {currentPlanner && (
                    <button
                      onClick={handleClearDraft}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Limpar Rascunho</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleBackToManager}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Voltar</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <PlannerForm
                initial={currentPlanner || undefined}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {/* Manager Section */}
          {showManager && (
            <div className="space-y-8">
              {/* Manager Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gerenciar Planejamentos</h2>
                  <p className="text-gray-600 mt-1">
                    Visualize, edite e exporte seus planejamentos salvos
                  </p>
                </div>
                
                <button
                  onClick={() => setShowManager(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Voltar</span>
                </button>
              </div>

              {/* Manager Component */}
              <PlannerManager
                onSelectPlanner={handleSelectPlanner}
                onExportPlanner={handleExportPlanner}
              />
            </div>
          )}

          {/* Info Cards */}
          {!showForm && !showManager && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Técnico</h3>
                <p className="text-gray-600 text-sm">
                  Defina o nome do técnico, cidade de origem e parâmetros de produtividade para o planejamento.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Itinerário</h3>
                <p className="text-gray-600 text-sm">
                  Configure as cidades a visitar, hotéis, custos de transporte e unidades em cada local.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Custos</h3>
                <p className="text-gray-600 text-sm">
                  Controle despesas com hospedagem, alimentação, transporte e diárias técnicas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}