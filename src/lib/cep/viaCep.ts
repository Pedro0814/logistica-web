export type ViaCepAddress = {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
  erro?: boolean
}

export async function getAddressByCEP(cep: string, opts: { timeoutMs?: number } = {}): Promise<ViaCepAddress | null> {
  const onlyDigits = (cep || '').replace(/\D/g, '')
  if (onlyDigits.length !== 8) return null
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 7000)
  try {
    const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`, { signal: ctrl.signal, cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as ViaCepAddress
    if ((data as any).erro) return null
    return data
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}


