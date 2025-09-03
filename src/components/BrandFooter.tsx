export default function BrandFooter() {
  return (
    <footer className="border-t border-background-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600" />
              <span className="text-base font-semibold text-background-900">Inventory Route Planner</span>
              <span className="text-xs font-medium text-blue-600">Beta</span>
            </div>
            <p className="mt-3 text-sm text-background-600 max-w-md">
              Planejamento de rotas e custos operacionais para equipes técnicas.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1 text-sm text-background-700">
            <span className="font-medium">Autoral de Pedro Menezes</span>
            <span className="text-xs text-background-500">Mapas por OpenStreetMap. UI com Tailwind e shadcn/ui.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}


