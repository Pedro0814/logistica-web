import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CEPField from '@/components/CEPField'

vi.mock('@/lib/cep/viaCep', () => ({
  getAddressByCEP: vi.fn(async (cep: string) => {
    if (cep === '00000000') return null
    return { logradouro: 'Rua A', bairro: 'Centro', localidade: 'Fortaleza', uf: 'CE', ibge: '2304400' }
  })
}))

describe('CEPField', () => {
  it('normalizes input to NNNNN-NNN and triggers autofill', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onAutoFill = vi.fn()
    render(<CEPField value="" onChange={onChange} onAutoFill={onAutoFill} />)
    const input = screen.getByLabelText('CEP') as HTMLInputElement

    await user.type(input, '60110100')
    expect(onChange).toHaveBeenLastCalledWith('60110-100')

    // blur to trigger fetch
    input.blur()
    // allow async
    await new Promise(r => setTimeout(r, 0))
    expect(onAutoFill).toHaveBeenCalled()
    expect(onAutoFill.mock.lastCall[0]).toMatchObject({ city: 'Fortaleza', state: 'CE', autoFilledFromCEP: true })
  })

  it('invalid CEP shows friendly error and keeps editable', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CEPField value="" onChange={onChange} />)
    const input = screen.getByLabelText('CEP') as HTMLInputElement

    await user.type(input, '00000-000')
    input.blur()
    await new Promise(r => setTimeout(r, 0))
    expect(screen.getByText(/CEP não encontrado/i)).toBeInTheDocument()
    expect(input).not.toBeDisabled()
  })
})


