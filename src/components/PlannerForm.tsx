"use client"

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlannerInputSchema, type PlannerInput } from '@/schemas/planner'
import CurrencyInput from './CurrencyInput'
import { useState } from 'react'

interface PlannerFormProps {
  initial?: PlannerInput
  onSubmit: (values: PlannerInput, title: string) => void
}

export default function PlannerForm({ initial, onSubmit }: PlannerFormProps) {
  const [plannerTitle, setPlannerTitle] = useState(initial ? 'Planejamento Existente' : '')
  const [showTitleInput, setShowTitleInput] = useState(!initial)

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
      },
      itinerary: [],
      returnTransportCost: 0,
    },
  })

  const { fields: itineraryFields, append: appendCity, remove: removeCityField } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  })

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

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {/* Título do Planejamento */}
      {showTitleInput && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Título do Planejamento</h2>
            </div>
          </div>
          <div className="p-8">
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
          </div>
        </div>
      )}

      {/* Global Parameters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Parâmetros Globais</h2>
          </div>
        </div>
        <div className="p-8 space-y-6">
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

          {/* Per Diem Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Per Diem (Alimentação e Hidratação)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CurrencyInput
                label="Café da Manhã"
                value={form.watch('global.perDiem.breakfast')}
                onChange={(value) => form.setValue('global.perDiem.breakfast', value)}
                placeholder="0,00"
              />
              <CurrencyInput
                label="Almoço"
                value={form.watch('global.perDiem.lunch')}
                onChange={(value) => form.setValue('global.perDiem.lunch', value)}
                placeholder="0,00"
              />
              <CurrencyInput
                label="Jantar"
                value={form.watch('global.perDiem.dinner')}
                onChange={(value) => form.setValue('global.perDiem.dinner', value)}
                placeholder="0,00"
              />
              <CurrencyInput
                label="Água"
                value={form.watch('global.perDiem.water')}
                onChange={(value) => form.setValue('global.perDiem.water', value)}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Itinerário</h2>
            </div>
            <button
              type="button"
              onClick={addCity}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Adicionar Cidade</span>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {itineraryFields.map((field, cityIndex) => (
            <div key={field.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cidade {cityIndex + 1}
                </h3>
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

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nome da Cidade</label>
                  <input
                    {...form.register(`itinerary.${cityIndex}.city`)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Ex: Campinas, SP"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nome do Hotel</label>
                  <input
                    {...form.register(`itinerary.${cityIndex}.hotelName`)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Nome do hotel"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Diária do Hotel</label>
                  <CurrencyInput
                    value={form.watch(`itinerary.${cityIndex}.hotelNightly`)}
                    onChange={(value) => form.setValue(`itinerary.${cityIndex}.hotelNightly`, value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Transporte Local (dia)</label>
                  <CurrencyInput
                    value={form.watch(`itinerary.${cityIndex}.localTransportPerDay`)}
                    onChange={(value) => form.setValue(`itinerary.${cityIndex}.localTransportPerDay`, value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Custo Intermunicipal</label>
                  <CurrencyInput
                    value={form.watch(`itinerary.${cityIndex}.intercityCost`) as number || 0}
                    onChange={(value) => form.setValue(`itinerary.${cityIndex}.intercityCost`, value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nota de Transporte</label>
                  <input
                    {...form.register(`itinerary.${cityIndex}.arrivalTransportNote`)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Voo, ônibus, etc."
                  />
                </div>
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
      </div>

      {/* Return Transport Cost */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Custo de Retorno</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="max-w-md">
            <CurrencyInput
              label="Custo de Retorno à Cidade de Origem"
              value={form.watch('returnTransportCost') ?? 0}
              onChange={(value) => form.setValue('returnTransportCost', value)}
              placeholder="0,00"
            />
            <p className="text-sm text-gray-500 mt-2">
              Custo estimado para retornar do último destino à cidade de origem
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 rounded-2xl text-xl font-semibold transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 flex items-center space-x-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Salvar Planejamento</span>
        </button>
      </div>
    </form>
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
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Unidades
        </h4>
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
                <h5 className="font-medium text-gray-800">Unidade {storeIndex + 1}</h5>
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Coordenadas (opcional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      {...form.register(`itinerary.${cityIndex}.stores.${storeIndex}.lat`, { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="any"
                      {...form.register(`itinerary.${cityIndex}.stores.${storeIndex}.lng`, { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Longitude"
                    />
                  </div>
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



