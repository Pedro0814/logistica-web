import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MoneyInput from '@/components/MoneyInput'

describe('MoneyInput', () => {
  it('renders with R$ 0,00 for valueCents=0', () => {
    render(<MoneyInput valueCents={0} onChange={() => {}} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toContain('R$')
  })

  it('typing 100 triggers onChange with 100 cents (R$ 1,00)', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<MoneyInput valueCents={0} onChange={spy} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '100')
    expect(spy).toHaveBeenCalled()
    const last = spy.mock.lastCall[0]
    expect(last).toBe(100)
  })

  it('pasting 1.234,56 is parsed to 123456 cents', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<MoneyInput valueCents={0} onChange={spy} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.clear(input)
    await user.paste('1.234,56')
    expect(spy).toHaveBeenCalled()
    const last = spy.mock.lastCall[0]
    expect(last).toBe(123456)
  })

  it('allowNull: clearing sets null', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<MoneyInput valueCents={123} onChange={spy} allowNull />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.clear(input)
    expect(spy).toHaveBeenCalledWith(null)
  })

  it('shows error and aria-invalid', () => {
    render(<MoneyInput valueCents={0} onChange={() => {}} error="Erro" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Erro')).toBeInTheDocument()
  })
})


