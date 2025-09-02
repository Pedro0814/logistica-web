'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      className="inline-flex items-center rounded-md border border-background-300 bg-white px-3 py-2 text-sm font-medium text-background-900 shadow-sm hover:bg-background-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="ml-2 hidden sm:inline">{isDark ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}


