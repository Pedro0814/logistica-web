import { useRef, useEffect, useCallback } from 'react'

export function useDebouncedCallback<T extends any[]>(fn: (...args: T) => void, delayMs: number) {
  const timer = useRef<any>()
  useEffect(() => () => clearTimeout(timer.current), [])
  return useCallback((...args: T) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delayMs)
  }, [fn, delayMs])
}


