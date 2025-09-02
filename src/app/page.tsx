import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion, useReducedMotion } from 'framer-motion'
import Carousel from '@/components/Carousel'

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo/Icon */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-8 shadow-2xl"
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Inventory Route Planner
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Beta
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Planeje suas rotas logísticas com precisão, controle de custos e otimização de tempo para inventários em múltiplas cidades
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16 flex items-center justify-center gap-3"
            >
              <Link href="/planner">
                <Button size="lg" className="rounded-2xl px-8 py-6 text-base">
                  Começar Planejamento
                </Button>
              </Link>
              <Link href="/planner/schedule">
                <Button variant="secondary" size="lg" className="rounded-2xl px-8 py-6 text-base">
                  Ver Cronograma
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%229C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para planejar rotas de inventário de forma eficiente
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle>Planejamento de Rotas</CardTitle>
                <CardDescription>Itinerários detalhados e rotas otimizadas</CardDescription>
              </CardHeader>
              <CardContent>
                Crie itinerários com múltiplas cidades, ajustando produtividade, custos e datas para máxima eficiência.
              </CardContent>
            </Card>
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle>Controle de Custos</CardTitle>
                <CardDescription>Transporte, hospedagem, alimentação e diárias</CardDescription>
              </CardHeader>
              <CardContent>
                Consolide despesas por dia e por cidade, avaliando cenários e exportando para CSV.
              </CardContent>
            </Card>
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle>Cronograma Inteligente</CardTitle>
                <CardDescription>Considera produtividade e finais de semana</CardDescription>
              </CardHeader>
              <CardContent>
                Gere um plano completo incluindo deslocamentos, descanso e retorno com datas formatadas D/M/A.
              </CardContent>
            </Card>
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle>Mapas Integrados</CardTitle>
                <CardDescription>OSM + Leaflet + OSRM</CardDescription>
              </CardHeader>
              <CardContent>
                Visualize rotas reais entre cidades e unidades, com pontos de entrada/saída e hotéis.
              </CardContent>
            </Card>
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle>Gestão de Unidades</CardTitle>
                <CardDescription>Endereços, volumes e produtividade</CardDescription>
              </CardHeader>
              <CardContent>
                Organize unidades por cidade e estime dias pelo padrão de 150 bens/dia.
              </CardContent>
            </Card>
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>Cronograma, custos e exportação</CardDescription>
              </CardHeader>
              <CardContent>
                Baixe planilhas em CSV com custos consolidados e produtividade por período.
              </CardContent>
            </Card>
          </div>
          <div className="mt-10">
            <Carousel
              items={[
                { title: 'Salve múltiplos planos', description: 'Organize por títulos e revise a qualquer momento.' },
                { title: 'Trabalhe com ou sem finais de semana', description: 'Marque descanso (Descanso) ou ative trabalho.' },
                { title: 'Rotas reais no mapa', description: 'OSRM com rotas por cidades e diárias hotel-unidade.' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Como funciona</h2>
            <p className="text-gray-600">Três passos simples para começar</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Insira os dados</CardTitle>
                <CardDescription>Origem, cidades, unidades e custos</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Gere o cronograma</CardTitle>
                <CardDescription>Escolha trabalhar ou não finais de semana</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3. Visualize e exporte</CardTitle>
                <CardDescription>Mapa, custos e CSV para Excel</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-20 bg-white/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Perguntas frequentes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Posso salvar múltiplos planos?</CardTitle>
                <CardDescription>Sim, com títulos e exportação CSV</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Funciona sem Firebase?</CardTitle>
                <CardDescription>Sim, com rascunho local; Firebase para persistência</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para otimizar suas rotas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Comece agora mesmo a planejar suas operações de inventário com ferramentas profissionais e interface intuitiva.
          </p>
          <Link href="/planner">
            <Button variant="outline" size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-base">
              Começar Agora
            </Button>
          </Link>
        </div>
      </div>
      {/* BrandFooter now in root layout */}
    </div>
  )
}