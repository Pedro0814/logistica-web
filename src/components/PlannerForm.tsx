"use client"

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlannerInputSchema, type PlannerInput } from '@/schemas/planner'
import CurrencyInput from './CurrencyInput'
import AttachmentButton from './AttachmentButton'
import FieldAttachments from './FieldAttachments'
import AttachmentManager from './AttachmentManager'
import { useState } from 'react'
import Stepper, { type Step } from './Stepper'
import StepCard from './StepCard'
import StepFooter from './StepFooter'
import OperationTypeToggle from './OperationTypeToggle'
import OperationBanner from './OperationBanner'

interface PlannerFormProps {
  initial?: PlannerInput
  plannerId?: string
  onSubmit: (values: PlannerInput, title: string) => void
}

const STEPS: Step[] = [
  {
    id: 'operation-type',
    title: 'Tipo de Operação',
    description: 'Regional vs Viagem',
    status: 'current'
  },
  {
    id: 'global-params',
    title: 'Parâmetros Globais',
    description: 'Configurações base',
    status: 'upcoming'
  },
  {
    id: 'itinerary',
    title: 'Itinerário e Unidades',
    description: 'Cidades e lojas',
    status: 'upcoming'
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Gerar cronograma',
    status: 'upcoming'
  }
]

export default function PlannerForm({ initial, plannerId, onSubmit }: PlannerFormProps) {
  const [plannerTitle, setPlannerTitle] = useState(initial ? 'Planejamento Existente' : '')
  const [showTitleInput, setShowTitleInput] = useState(!initial)
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<PlannerInput>({
    resolver: zodResolver(PlannerInputSchema),
    defaultValues: initial || {
      global: {
        technicianName: '',
        originCity: '',
        startDateISO: '2025-01-01',
        assetsPerDay: 150,
        technicianDailyRate: 0,
        perDiem: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          water: 0,
        },
        workWeekends: false,
        operationType: 'travel',
        regionalOptions: { lunchEnabled: false, waterEnabled: false },
      },
      itinerary: [],
      returnTransportCost: 0,
      financial: { billedAmount: 0, taxPercent: 9.65, actualCosts: {} },
    },
  })

  const { fields: itineraryFields, append: appendCity, remove: removeCityField } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  })

  const operationType = form.watch('global.operationType')
  const isRegional = operationType === 'regional'

  const handleSubmit = (values: PlannerInput) => {
    if (!plannerTitle.trim()) {
      setShowTitleInput(true)
      return
    }
    onSubmit(values, plannerTitle.trim())
  }

  const addCity = () => {
    appendCity({
      id: crypto.randomUUID(),
      city: '',
      arrivalTransportNote: '',
      intercityCost: 0,
      hotelName: '',
      hotelNightly: 0,
      localTransportPerDay: 0,
      stores: [],
    })
  }

  const removeCity = (index: number) => {
    removeCityField(index)
  }

  const addStore = (cityIndex: number) => {
    const currentStores = form.watch(`itinerary.${cityIndex}.stores`)
    form.setValue(`itinerary.${cityIndex}.stores`, [
      ...currentStores,
      {
        id: crypto.randomUUID(),
        name: '',
        addressLine: '',
        approxAssets: 0,
      },
    ])
  }

  const removeStore = (cityIndex: number, storeIndex: number) => {
    const currentStores = form.watch(`itinerary.${cityIndex}.stores`)
    const newStores = currentStores.filter((_, index) => index !== storeIndex)
    form.setValue(`itinerary.${cityIndex}.stores`, newStores)
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      form.handleSubmit(handleSubmit)()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 0: // Tipo de Operação
        return true
      case 1: // Parâmetros Globais
        const technicianName = form.watch('global.technicianName')
        const originCity = form.watch('global.originCity')
        return Boolean(technicianName && originCity)
      case 2: // Itinerário
        return itineraryFields.length > 0 && itineraryFields.every((_, index) => {
          const city = form.watch(`itinerary.${index}`)
          return Boolean(city?.city && city?.stores?.length > 0)
        })
      case 3: // Revisão
        return true
      default:
        return false
    }
  }

  const canGoPrevious = () => currentStep > 0

  const updateStepStatus = (): Step[] => {
    return STEPS.map((step, index) => ({
      ...step,
      status: (index < currentStep ? 'completed' : index === currentStep ? 'current' : 'upcoming') as 'upcoming' | 'current' | 'completed'
    }))
  }

  const handleSaveDraft = () => {
    // Implementar salvamento de rascunho
    console.log('Salvando rascunho...')
  }

  return (
    <div className="w-full space-y-6 pb-28">
      {/* Banner de Tipo de Operação */}
      <OperationBanner operationType={operationType} />

      {/* Stepper */}
      <div className="rounded-xl border bg-background shadow-sm p-4 md:p-6">
        <Stepper 
          steps={updateStepStatus()} 
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Título do Planejamento */}
      {showTitleInput && (
        <StepCard
          title="Título do Planejamento"
          description="Identifique seu planejamento"
          helpText="Dê um nome descritivo para facilitar a identificação futura"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Planejamento
              </label>
              <input
                type="text"
                value={plannerTitle}
                onChange={(e) => setPlannerTitle(e.target.value)}
                placeholder="Ex: Inventário Região Sul - Janeiro 2025"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Dê um nome descritivo para facilitar a identificação futura
              </p>
            </div>
          </div>
        </StepCard>
      )}

      {/* Etapa 1: Tipo de Operação */}
      <StepCard
        title="Tipo de Operação"
        description="Escolha entre operação regional ou com viagem"
        helpText="A escolha afeta quais campos e custos serão considerados no planejamento"
        isActive={currentStep === 0}
      >
        <OperationTypeToggle
          value={operationType}
          onChange={(value) => form.setValue('global.operationType', value)}
        />
      </StepCard>

      {/* Etapa 2: Parâmetros Globais */}
      <StepCard
        title="Parâmetros Globais"
        description="Configurações base do planejamento"
        helpText="Configure os parâmetros que se aplicam a todo o planejamento"
        isActive={currentStep === 1}
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nome do Técnico</label>
              <input
                {...form.register('global.technicianName')}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Nome completo do técnico"
              />
              {form.formState.errors.global?.technicianName && (
                <p className="text-red-500 text-sm">{form.formState.errors.global.technicianName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Cidade de Origem</label>
              <input
                {...form.register('global.originCity')}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ex: Fortaleza, CE"
              />
              {form.formState.errors.global?.originCity && (
                <p className="text-red-500 text-sm">{form.formState.errors.global.originCity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Data de Início</label>
              <input
                type="date"
                {...form.register('global.startDateISO')}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {form.formState.errors.global?.startDateISO && (
                <p className="text-red-500 text-sm">{form.formState.errors.global.startDateISO.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Produtividade (bens/dia)</label>
              <input
                type="number"
                {...form.register('global.assetsPerDay', { valueAsNumber: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="150"
                min="1"
              />
              {form.formState.errors.global?.assetsPerDay && (
                <p className="text-red-500 text-sm">{form.formState.errors.global.assetsPerDay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <CurrencyInput
                label="Diária do Técnico"
                value={form.watch('global.technicianDailyRate')}
                onChange={(value) => form.setValue('global.technicianDailyRate', value)}
                placeholder="0,00"
              />
              {form.formState.errors.global?.technicianDailyRate && (
                <p className="text-red-500 text-sm">{form.formState.errors.global.technicianDailyRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Finais de Semana</label>
              <div className="flex items-center space-x-3 pt-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...form.register('global.workWeekends')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-gray-600">
                  {form.watch('global.workWeekends') ? 'Trabalhar finais de semana' : 'Respeitar finais de semana'}
                </span>
              </div>
            </div>
          </div>

          {/* Diária (Alimentação e Hidratação) */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Diária (Alimentação e Hidratação)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ajuste valores usados por dia de trabalho. Em operação regional, apenas itens marcados serão considerados.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CurrencyInput
                label="Café da Manhã"
                value={form.watch('global.perDiem.breakfast')}
                onChange={(value) => form.setValue('global.perDiem.breakfast', value)}
                placeholder="0,00"
                disabled={isRegional}
              />
              
              {/* Em operação regional, almoço e água se tornam opcionais */}
              {isRegional && (
                <div className="col-span-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.watch('global.regionalOptions.lunchEnabled')}
                    onChange={(e) => form.setValue('global.regionalOptions.lunchEnabled', !!e.target.checked)}
                  />
                  <span className="text-sm">Incluir Almoço</span>
                </div>
              )}
              <CurrencyInput
                label="Almoço"
                value={form.watch('global.perDiem.lunch')}
                onChange={(value) => form.setValue('global.perDiem.lunch', value)}
                placeholder="0,00"
                disabled={isRegional && !form.watch('global.regionalOptions.lunchEnabled')}
              />
              <CurrencyInput
                label="Jantar"
                value={form.watch('global.perDiem.dinner')}
                onChange={(value) => form.setValue('global.perDiem.dinner', value)}
                placeholder="0,00"
                disabled={isRegional}
              />
              {isRegional && (
                <div className="col-span-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.watch('global.regionalOptions.waterEnabled')}
                    onChange={(e) => form.setValue('global.regionalOptions.waterEnabled', !!e.target.checked)}
                  />
                  <span className="text-sm">Incluir Água</span>
                </div>
              )}
              <CurrencyInput
                label="Água"
                value={form.watch('global.perDiem.water')}
                onChange={(value) => form.setValue('global.perDiem.water', value)}
                placeholder="0,00"
                disabled={isRegional && !form.watch('global.regionalOptions.waterEnabled')}
              />
            </div>
          </div>

          {/* Financeiro */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Financeiro
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Informe o valor cobrado e a alíquota de impostos. Esses dados serão usados nos gráficos e margens da aba Financeiro.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Valor cobrado (R$)</label>
                <input
                  type="number"
                  min={0}
                  value={Number(form.watch('financial.billedAmount') ?? 0)}
                  onChange={(e) => form.setValue('financial.billedAmount', Number(e.target.value))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">% Impostos</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={Number(form.watch('financial.taxPercent') ?? 9.65)}
                  onChange={(e) => form.setValue('financial.taxPercent', Number(e.target.value))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="9,65"
                />
                <p className="text-xs text-gray-500">Impostos aplicados sobre a receita bruta para obter a receita líquida.</p>
              </div>
            </div>
          </div>
        </div>
      </StepCard>

      {/* Etapa 3: Itinerário e Unidades */}
      <StepCard
        title="Itinerário e Unidades"
        description="Configure cidades, unidades e custos"
        helpText="Adicione as cidades e unidades que serão visitadas, com seus respectivos custos"
        isActive={currentStep === 2}
      >
        <div className="space-y-6">
          {isRegional && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-green-800">
                  <strong>Operação Regional:</strong> Em modo regional, o técnico trabalha apenas em sua cidade de origem. 
                  Adicione unidades locais sem necessidade de hotéis ou deslocamentos intermunicipais.
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Cidades e Unidades</h3>
            <button
              type="button"
              onClick={addCity}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Adicionar Cidade</span>
            </button>
          </div>

          {itineraryFields.map((field, cityIndex) => (
            <div key={field.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cidade {cityIndex + 1}
                </h4>
                <div className="flex items-center gap-2">
                  <AttachmentButton
                    plannerId={plannerId}
                    fieldType={`city_${cityIndex}`}
                    tooltip="Anexar comprovante de passagem, hotel e etc"
                    variant="full"
                    className="text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeCity(cityIndex)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nome da Cidade</label>
                  <input
                    {...form.register(`itinerary.${cityIndex}.city`)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Ex: Campinas, SP"
                    disabled={isRegional && cityIndex === 0}
                  />
                  {isRegional && cityIndex === 0 && (
                    <p className="text-xs text-green-600">Cidade de origem (não pode ser alterada em operação regional)</p>
                  )}
                </div>

                {!isRegional && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">Nome do Hotel</label>
                        <AttachmentButton
                          plannerId={plannerId}
                          fieldType={`hotel_name_${cityIndex}`}
                          tooltip="Anexar comprovante do hotel"
                          variant="discrete"
                        />
                      </div>
                      <input
                        {...form.register(`itinerary.${cityIndex}.hotelName`)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Nome do hotel"
                      />
                      {plannerId && (
                        <FieldAttachments 
                          plannerId={plannerId} 
                          fieldType={`hotel_name_${cityIndex}`}
                          className="mt-1"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">Diária do Hotel</label>
                        <AttachmentButton
                          plannerId={plannerId}
                          fieldType={`hotel_nightly_${cityIndex}`}
                          tooltip="Anexar comprovante da diária"
                          variant="discrete"
                        />
                      </div>
                      <CurrencyInput
                        value={form.watch(`itinerary.${cityIndex}.hotelNightly`)}
                        onChange={(value) => form.setValue(`itinerary.${cityIndex}.hotelNightly`, value)}
                        placeholder="0,00"
                      />
                      {plannerId && (
                        <FieldAttachments 
                          plannerId={plannerId} 
                          fieldType={`hotel_nightly_${cityIndex}`}
                          className="mt-1"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">Custo Intermunicipal</label>
                        <AttachmentButton
                          plannerId={plannerId}
                          fieldType={`intercity_cost_${cityIndex}`}
                          tooltip="Anexar comprovante da passagem"
                          variant="discrete"
                        />
                      </div>
                      <CurrencyInput
                        value={form.watch(`itinerary.${cityIndex}.intercityCost`) as number || 0}
                        onChange={(value) => form.setValue(`itinerary.${cityIndex}.intercityCost`, value)}
                        placeholder="0,00"
                      />
                      {plannerId && (
                        <FieldAttachments 
                          plannerId={plannerId} 
                          fieldType={`intercity_cost_${cityIndex}`}
                          className="mt-1"
                        />
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">Transporte Local (dia)</label>
                    <AttachmentButton
                      plannerId={plannerId}
                      fieldType={`local_transport_${cityIndex}`}
                      tooltip="Anexar comprovante do transporte"
                      variant="discrete"
                    />
                  </div>
                  <CurrencyInput
                    value={form.watch(`itinerary.${cityIndex}.localTransportPerDay`)}
                    onChange={(value) => form.setValue(`itinerary.${cityIndex}.localTransportPerDay`, value)}
                    placeholder="0,00"
                  />
                  {plannerId && (
                    <FieldAttachments 
                      plannerId={plannerId} 
                      fieldType={`local_transport_${cityIndex}`}
                      className="mt-1"
                    />
                  )}
                </div>

                {!isRegional && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nota de Transporte</label>
                    <input
                      {...form.register(`itinerary.${cityIndex}.arrivalTransportNote`)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Voo, ônibus, etc."
                    />
                  </div>
                )}
              </div>

              {/* Stores Editor */}
              <StoresEditor cityIndex={cityIndex} form={form} />
            </div>
          ))}

          {itineraryFields.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma Cidade Adicionada</h3>
              <p className="text-gray-600 mb-4">
                Clique em {"\""}Adicionar Cidade{"\""} para começar a definir seu itinerário.
              </p>
              <button
                type="button"
                onClick={addCity}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Primeira Cidade
              </button>
            </div>
          )}
        </div>
      </StepCard>

      {/* Etapa 4: Revisão */}
      <StepCard
        title="Revisão e Geração"
        description="Confirme os dados e gere o cronograma"
        helpText="Revise todas as informações antes de gerar o cronograma final"
        isActive={currentStep === 3}
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumo do Cronograma */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Resumo do Cronograma</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Cidades:</span>
                <span className="font-semibold">{itineraryFields.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Unidades:</span>
                <span className="font-semibold">
                  {itineraryFields.reduce((sum, _, index) => {
                    const stores = form.watch(`itinerary.${index}.stores`)
                    return sum + (stores?.length || 0)
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Bens:</span>
                <span className="font-semibold">
                  {itineraryFields.reduce((sum, _, cityIndex) => {
                    const stores = form.watch(`itinerary.${cityIndex}.stores`)
                    return sum + (stores?.reduce((citySum, store) => citySum + (store.approxAssets || 0), 0) || 0)
                  }, 0)}
                </span>
              </div>
              {!isRegional && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dias de Viagem:</span>
                    <span className="font-semibold">{itineraryFields.length + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dias de Retorno:</span>
                    <span className="font-semibold">1</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Resumo de Custos */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Resumo de Custos</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Diária (Refeições):</span>
                <span className="font-semibold">
                  R$ {(() => {
                    const { breakfast, lunch, dinner, water } = form.watch('global.perDiem')
                    if (isRegional) {
                      const lunchEnabled = form.watch('global.regionalOptions.lunchEnabled')
                      const waterEnabled = form.watch('global.regionalOptions.waterEnabled')
                      return (breakfast || 0) + (lunchEnabled ? (lunch || 0) : 0) + 0 + (waterEnabled ? (water || 0) : 0)
                    }
                    return (breakfast || 0) + (lunch || 0) + (dinner || 0) + (water || 0)
                  })().toFixed(2)}
                </span>
              </div>
              {!isRegional && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hospedagem:</span>
                    <span className="font-semibold">
                      R$ {itineraryFields.reduce((sum, _, index) => {
                        const hotelNightly = form.watch(`itinerary.${index}.hotelNightly`)
                        return sum + (hotelNightly || 0)
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transporte Intermunicipal:</span>
                    <span className="font-semibold">
                      R$ {itineraryFields.reduce((sum, _, index) => {
                        const intercityCost = form.watch(`itinerary.${index}.intercityCost`)
                        return sum + (intercityCost || 0)
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Transporte Local:</span>
                <span className="font-semibold">
                  R$ {itineraryFields.reduce((sum, _, index) => {
                    const localTransport = form.watch(`itinerary.${index}.localTransportPerDay`)
                    return sum + (localTransport || 0)
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </StepCard>

      {/* Anexos do Planejamento */}
      {plannerId && (
        <AttachmentManager planId={plannerId} />
      )}

      {/* Footer com Navegação */}
      <StepFooter
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onNext={nextStep}
        onPrevious={previousStep}
        onSaveDraft={handleSaveDraft}
        canGoNext={canGoNext()}
        canGoPrevious={canGoPrevious()}
      />
    </div>
  )
}

// Stores Editor Component
function StoresEditor({ cityIndex, form }: { cityIndex: number; form: any }) {
  const stores = form.watch(`itinerary.${cityIndex}.stores`)

  const addStore = () => {
    const currentStores = form.getValues(`itinerary.${cityIndex}.stores`)
    form.setValue(`itinerary.${cityIndex}.stores`, [
      ...currentStores,
      {
        id: crypto.randomUUID(),
        name: '',
        addressLine: '',
        approxAssets: 0,
      },
    ])
  }

  const removeStore = (storeIndex: number) => {
    const currentStores = form.getValues(`itinerary.${cityIndex}.stores`)
    const newStores = currentStores.filter((_: any, index: number) => index !== storeIndex)
    form.setValue(`itinerary.${cityIndex}.stores`, newStores)
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Unidades
        </h5>
        <button
          type="button"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          onClick={addStore}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Adicionar Unidade</span>
        </button>
      </div>

      {stores && stores.length > 0 ? (
        <div className="space-y-4">
          {stores.map((store: any, storeIndex: number) => (
            <div key={store.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h6 className="font-medium text-gray-800">Unidade {storeIndex + 1}</h6>
                <button
                  type="button"
                  onClick={() => removeStore(storeIndex)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nome da Unidade</label>
                  <input
                    {...form.register(`itinerary.${cityIndex}.stores.${storeIndex}.name`)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Nome da unidade"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <input
                    {...form.register(`itinerary.${cityIndex}.stores.${storeIndex}.addressLine`)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Endereço completo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Bens Estimados</label>
                  <input
                    type="number"
                    {...form.register(`itinerary.${cityIndex}.stores.${storeIndex}.approxAssets`, { valueAsNumber: true })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-3">Nenhuma unidade adicionada nesta cidade</p>
          <button
            type="button"
            onClick={addStore}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Adicionar Primeira Unidade
          </button>
        </div>
      )}
    </div>
  )
}



