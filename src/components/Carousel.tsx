"use client"

import useEmblaCarousel from 'embla-carousel-react'
import { useEffect } from 'react'

export default function Carousel({ items }: { items: Array<{ title: string; description: string }> }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })

  useEffect(() => {
    if (!emblaApi) return
  }, [emblaApi])

  return (
    <div className="overflow-hidden" ref={emblaRef} role="region" aria-label="Destaques do produto">
      <div className="flex" role="list">
        {items.map((item, idx) => (
          <div className="min-w-0 flex-[0_0_85%] md:flex-[0_0_33.33%] pr-4" key={idx} role="listitem">
            <div className="h-full rounded-xl border border-background-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-background-900">{item.title}</h3>
              <p className="mt-2 text-sm text-background-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


