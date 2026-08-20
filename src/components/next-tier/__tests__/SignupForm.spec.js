import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SignupForm from '../SignupForm.vue'

const AUTH_URL = 'https://signup.test/auth/discord'

const currentUser = { discordId: '1', discordUsername: 'kaan' }

const existingSubmission = {
  discordId: '1',
  discordUsername: 'kaan',
  characterName: 'Aztecmage',
  className: 'mage',
  specName: 'frost',
}

function mountForm(props = {}) {
  return mount(SignupForm, {
    props: {
      currentUser: null,
      existingSubmission: null,
      isOpen: true,
      discordAuthUrl: AUTH_URL,
      ...props,
    },
  })
}

function findByText(wrapper, selector, text) {
  return wrapper.findAll(selector).find((el) => el.text() === text)
}

describe('SignupForm', () => {
  it('renders the Discord sign-in link when signed out and signups are open', () => {
    const wrapper = mountForm()
    const link = wrapper.find('a.discord-btn')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe(AUTH_URL)
    expect(link.text()).toContain('Sign in with Discord')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows the closed badge instead of the sign-in link when signups are closed', () => {
    const wrapper = mountForm({ isOpen: false })
    expect(wrapper.find('a.discord-btn').exists()).toBe(false)
    expect(wrapper.find('.closed-notice').text()).toContain('Signups are currently closed')
  })

  it('shows an existing submission with its spec, role and edit controls', () => {
    const wrapper = mountForm({ currentUser, existingSubmission })
    expect(wrapper.find('.char-name').text()).toBe('Aztecmage')
    expect(wrapper.find('.char-name').classes()).toContain('mage')
    expect(wrapper.find('.spec-info').text()).toBe('Frost · Ranged')
    expect(wrapper.find('.discord-name').text()).toBe('kaan')
    const actions = wrapper.findAll('.submission-actions button').map((b) => b.text())
    expect(actions).toEqual(['Edit', 'Remove'])
  })

  it('falls back to the raw spec key when the class is unknown', () => {
    const wrapper = mountForm({
      currentUser,
      existingSubmission: { ...existingSubmission, className: 'bard', specName: 'lute' },
    })
    expect(wrapper.find('.spec-info').text()).toBe('lute ·')
  })

  it('keeps the signup read-only when the tier is closed', () => {
    const wrapper = mountForm({ currentUser, existingSubmission, isOpen: false })
    expect(wrapper.find('.char-name').text()).toBe('Aztecmage')
    expect(wrapper.find('.submission-actions').exists()).toBe(false)
    expect(findByText(wrapper, 'button', 'Edit')).toBeUndefined()
    expect(findByText(wrapper, 'button', 'Remove')).toBeUndefined()
  })

  it('emits delete when Remove is clicked', async () => {
    const wrapper = mountForm({ currentUser, existingSubmission })
    await findByText(wrapper, 'button', 'Remove').trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('emits signOut from the read-only view', async () => {
    const wrapper = mountForm({ currentUser, existingSubmission })
    await wrapper.find('.sign-out-link').trigger('click')
    expect(wrapper.emitted('signOut')).toHaveLength(1)
  })

  it('pre-fills the form and keeps the existing spec when editing starts', async () => {
    const wrapper = mountForm({ currentUser, existingSubmission })
    await findByText(wrapper, 'button', 'Edit').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#signup-character-name').element.value).toBe('Aztecmage')
    expect(wrapper.find('#signup-class').element.value).toBe('mage')
    expect(wrapper.find('#signup-spec').element.value).toBe('frost')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('button[type="submit"]').text()).toBe('Update Signup')
  })

  it('resets the spec when the user changes class while editing', async () => {
    const wrapper = mountForm({ currentUser, existingSubmission })
    await findByText(wrapper, 'button', 'Edit').trigger('click')
    await wrapper.find('#signup-class').setValue('deathKnight')

    expect(wrapper.find('#signup-spec').element.value).toBe('')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    const specOptions = wrapper.findAll('#signup-spec option').map((o) => o.text())
    expect(specOptions).toEqual(['Select spec', 'Blood', 'Frost', 'Unholy'])
  })

  it('returns to the read-only view on Cancel without emitting submit', async () => {
    const wrapper = mountForm({ currentUser, existingSubmission })
    await findByText(wrapper, 'button', 'Edit').trigger('click')
    expect(wrapper.find('form').exists()).toBe(true)

    await findByText(wrapper, 'button', 'Cancel').trigger('click')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('.existing-submission').exists()).toBe(true)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('leaves edit mode when the tier closes mid-edit', async () => {
    const wrapper = mountForm({ currentUser, existingSubmission })
    await findByText(wrapper, 'button', 'Edit').trigger('click')
    await wrapper.setProps({ isOpen: false })

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('.char-name').text()).toBe('Aztecmage')
  })

  it('disables the spec select until a class is picked', async () => {
    const wrapper = mountForm({ currentUser })
    expect(wrapper.find('#signup-spec').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('#signup-spec option')).toHaveLength(1)

    await wrapper.find('#signup-class').setValue('mage')
    expect(wrapper.find('#signup-spec').attributes('disabled')).toBeUndefined()
    expect(wrapper.findAll('#signup-spec option').map((o) => o.text())).toEqual([
      'Select spec',
      'Arcane',
      'Fire',
      'Frost',
    ])
  })

  it('emits submit with a trimmed character name and the picked class and spec', async () => {
    const wrapper = mountForm({ currentUser })
    await wrapper.find('#signup-character-name').setValue('  Aztecmage  ')
    await wrapper.find('#signup-class').setValue('mage')
    await wrapper.find('#signup-spec').setValue('fire')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0]).toEqual([
      { characterName: 'Aztecmage', className: 'mage', specName: 'fire' },
    ])
  })

  it('keeps submit disabled while the character name is only whitespace', async () => {
    const wrapper = mountForm({ currentUser })
    await wrapper.find('#signup-character-name').setValue('   ')
    await wrapper.find('#signup-class').setValue('mage')
    await wrapper.find('#signup-spec').setValue('fire')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('labels all three form controls', () => {
    const wrapper = mountForm({ currentUser })
    const labels = wrapper.findAll('label').map((l) => [l.attributes('for'), l.text()])
    expect(labels).toEqual([
      ['signup-character-name', 'Character name'],
      ['signup-class', 'Class'],
      ['signup-spec', 'Spec'],
    ])
    for (const [id] of labels) {
      expect(wrapper.find(`#${id}`).exists()).toBe(true)
    }
  })
})
