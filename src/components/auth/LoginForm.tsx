'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, resetPassword, error, clearError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      console.error('Erro de autenticação:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)

    try {
      await resetPassword(resetEmail)
      alert('Email de recuperação enviado! Verifique sua caixa de entrada.')
      setIsResetting(false)
      setResetEmail('')
    } catch (err) {
      console.error('Erro ao resetar senha:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isResetting) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recuperar Senha</h2>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="seu@email.com"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isLoading ? 'Enviando...' : 'Enviar Email'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsResetting(false)
                  clearError()
                }}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Entrar
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Acesse sua conta para continuar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => setIsResetting(true)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Esqueceu sua senha?
            </button>
            <div className="text-xs text-gray-500">
              Acesso restrito. Contas são criadas pela administração.
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

