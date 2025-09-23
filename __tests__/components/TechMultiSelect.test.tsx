import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TechMultiSelect from '@/components/TechMultiSelect'

const options = [
  { id: 't1', name: 'João' },
  { id: 't2', name: 'Maria' },
]

describe('TechMultiSelect', () => {
  it('filters by query and selects/removes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TechMultiSelect value={[]} onChange={onChange} options={options} />)

    // open popover
    await user.click(screen.getByRole('button'))
    // search "jo"
    await user.type(screen.getByPlaceholderText('Buscar...'), 'jo')
    await user.click(screen.getByText('João'))
    expect(onChange).toHaveBeenCalledWith(['t1'])

    // remove chip
    await user.click(screen.getByText('×'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('respects maxItems', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TechMultiSelect value={[]} onChange={onChange} options={options} maxItems={1} />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('João'))
    expect(onChange).toHaveBeenLastCalledWith(['t1'])
    // Maria should be disabled now
    const maria = screen.getByText('Maria').closest('button')!
    expect(maria).toHaveAttribute('disabled')
  })
})


