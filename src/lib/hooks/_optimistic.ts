import { QueryClient } from '@tanstack/react-query'

export function optimisticListKey<T extends { [k: string]: any }>(client: QueryClient, key: any[], idField: string) {
  let snapshot: T[] | undefined
  return {
    onMutate: async (updater: { [k: string]: any }) => {
      await client.cancelQueries({ queryKey: key })
      snapshot = client.getQueryData<T[]>(key)
      client.setQueryData<T[]>(key, (old) => {
        const list = old ? [...old] : []
        const id = updater[idField]
        const idx = list.findIndex((i: any) => i[idField] === id)
        if (idx >= 0) list[idx] = { ...list[idx], ...updater }
        else list.push(updater as T)
        return list
      })
      return { snapshot }
    },
    onError: (_err: any, _vars: any, ctx: any) => {
      if (snapshot) client.setQueryData(key, snapshot)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: key })
    },
  }
}

export function optimisticRemoveKey<T extends { [k: string]: any }>(client: QueryClient, key: any[], idField: string) {
  let snapshot: T[] | undefined
  return {
    onMutate: async (id: string) => {
      await client.cancelQueries({ queryKey: key })
      snapshot = client.getQueryData<T[]>(key)
      client.setQueryData<T[]>(key, (old) => (old ? old.filter((i: any) => i[idField] !== id) : []))
      return { snapshot }
    },
    onError: (_err: any, _vars: any, ctx: any) => {
      if (snapshot) client.setQueryData(key, snapshot)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: key })
    },
  }
}


