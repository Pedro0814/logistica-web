import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeekendPolicyBuilder from '@/components/WeekendPolicyBuilder'

describe('WeekendPolicyBuilder', () => {
  it('toggles saturday for week 2', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <WeekendPolicyBuilder
        weeks={[{ weekIndex: 1, saturday: 'off', sunday: 'off' }]}
        totalWeeks={5}
        onChange={onChange}
      />
    )
    const week2Sat = screen.getByText('Semana 2')
    await user.click(week2Sat)
    expect(onChange).toHaveBeenCalled()
    const next = onChange.mock.lastCall[0]
    expect(next.find((w: any) => w.weekIndex === 2).saturday).toBe('work')
  })

  it('quick button sets all sundays off', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <WeekendPolicyBuilder
        weeks={[]}
        totalWeeks={3}
        onChange={onChange}
      />
    )
    await user.click(screen.getByText('Domingo off'))
    const next = onChange.mock.lastCall[0]
    expect(next.every((w: any) => w.sunday === 'off')).toBe(true)
  })
})


