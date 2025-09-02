import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from 'next-themes'
import BrandFooter from '@/components/BrandFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inventory Route Planner Beta',
  description: 'Ferramenta profissional para planejamento de rotas logísticas e controle de custos operacionais',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Navbar />
          <main>
            {children}
          </main>
          <BrandFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}