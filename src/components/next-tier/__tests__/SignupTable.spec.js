import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SignupTable from '../SignupTable.vue'

const submissions = [
  {
    discordId: '111',
    discordUsername: 'kaan',
    characterName: 'Aztecmage',
    className: 'mage',
    specName: 'frost',
  },
  {
    discordId: '222',
    discordUsername: 'proto',
    characterName: 'Protodk',
    className: 'deathKnight',
    specName: 'blood',
  },
]

function mountTable(props = {}) {
  return mount(SignupTable, {
    props: { submissions, ...props },
  })
}

describe('SignupTable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the empty state and no table when there are no signups', () => {
    const wrapper = mountTable({ submissions: [] })
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('.empty-state').text()).toBe('No signups yet. Be the first!')
    expect(wrapper.find('.section-title').text()).toBe('All Signups (0)')
  })

  it('counts the signups in the heading', () => {
    expect(mountTable().find('.section-title').text()).toBe('All Signups (2)')
  })

  it('renders one row per submission', () => {
    const wrapper = mountTable()
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('renders character, class, spec, role and discord name per row', () => {
    const wrapper = mountTable()
    const cells = wrapper.findAll('tbody tr')[1].findAll('td')
    expect(cells.map((c) => c.text())).toEqual([
      'Protodk',
      'Death Knight',
      'Blood',
      'Tank',
      'proto',
    ])
  })

  it('colours the character name with the kebab-cased class', () => {
    const wrapper = mountTable()
    const names = wrapper.findAll('.char-name')
    expect(names[0].classes()).toContain('mage')
    expect(names[1].classes()).toContain('death-knight')
  })

  it('falls back to the raw keys for an unknown class or spec', () => {
    const wrapper = mountTable({
      submissions: [
        {
          discordId: '333',
          discordUsername: 'ghost',
          characterName: 'Bardic',
          className: 'bard',
          specName: 'lute',
        },
      ],
    })
    const cells = wrapper.findAll('tbody tr')[0].findAll('td')
    expect(cells.map((c) => c.text())).toEqual(['Bardic', 'bard', 'lute', '', 'ghost'])
  })

  it('hides the actions column for non-admins', () => {
    const wrapper = mountTable()
    expect(wrapper.find('.col-actions').exists()).toBe(false)
    expect(wrapper.findAll('thead th')).toHaveLength(5)
    expect(wrapper.findAll('tbody button')).toHaveLength(0)
  })

  it('renders a labelled remove button per row for admins', () => {
    const wrapper = mountTable({ isAdmin: true })
    expect(wrapper.findAll('thead th')).toHaveLength(6)
    const buttons = wrapper.findAll('tbody button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].attributes('aria-label')).toBe('Remove Aztecmage')
    expect(buttons[1].attributes('aria-label')).toBe('Remove Protodk')
  })

  it('emits delete with the whole row once the confirm is accepted', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mountTable({ isAdmin: true })
    await wrapper.findAll('tbody button')[1].trigger('click')

    expect(confirm).toHaveBeenCalledWith("Remove Protodk's signup? This can't be undone.")
    // The row, not a bare id: the composable picks `handle` when the worker
    // supplies one and falls back to `discordId` otherwise.
    expect(wrapper.emitted('delete')[0][0]).toMatchObject({ discordId: '222' })
  })

  it('does not emit delete when the confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = mountTable({ isAdmin: true })
    await wrapper.findAll('tbody button')[0].trigger('click')

    expect(wrapper.emitted('delete')).toBeUndefined()
  })
})
