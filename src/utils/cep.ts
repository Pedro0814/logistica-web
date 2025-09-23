export type ViaCEPAddress = {
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

export async function getAddressByCEP(cep: string): Promise<ViaCEPAddress | null> {
  const onlyDigits = (cep || '').replace(/\D/g, '')
  if (onlyDigits.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as ViaCEPAddress
    if ((data as any).erro) return null
    return data
  } catch {
    return null
  }
}


