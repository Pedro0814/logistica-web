'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BrandFooter from '@/components/BrandFooter'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNavbar = pathname !== '/login'

  return (
    <>
      {showNavbar && <Navbar />}
      <main>
        {children}
      </main>
      {showNavbar && <BrandFooter />}
    </>
  )
}

