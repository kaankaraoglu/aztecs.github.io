import { describe, it, expect, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(function () {
    this.observe = vi.fn()
    this.disconnect = vi.fn()
    this.unobserve = vi.fn()
  }),
)

vi.stubGlobal(
  'matchMedia',
  vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
)

import HomeView from '../HomeView.vue'
import ContactView from '../ContactView.vue'
import RaidingView from '../RaidingView.vue'
import AchievementsView from '../AchievementsView.vue'
import AboutView from '../AboutView.vue'
import InMemoriamView from '../InMemoriamView.vue'
import NotFoundView from '../NotFoundView.vue'

const homeStubs = {
  RaidStatsBox: { template: '<div class="stub-raid-stats" />' },
  RaidProgressionBox: { template: '<div class="stub-raid-progression" />' },
  MythicPlusBox: { template: '<div class="stub-mythic-plus" />' },
  FadingDivider: { template: '<hr class="stub-divider" />' },
  ImageLightbox: { template: '<div class="stub-lightbox" />' },
  Teleport: true,
}

const killCardStub = {
  KillCard: { template: '<div class="stub-kill-card" />' },
  Teleport: true,
}

describe('HomeView', () => {
  const mount_ = () => mount(HomeView, { global: { stubs: homeStubs } })

  it('renders without errors', () => {
    expect(mount_().find('.home-view').exists()).toBe(true)
  })

  it('renders the welcome heading', () => {
    expect(mount_().find('.welcome-heading').text()).toBe('Welcome to Aztecs!')
  })

  it('renders the latest achievements section', () => {
    expect(mount_().find('.latest-achievements').exists()).toBe(true)
  })

  it('renders the tier stats label', () => {
    expect(mount_().text()).toContain('TIER STATS')
  })
})

describe('ContactView', () => {
  const mount_ = () => mount(ContactView)

  it('renders without errors', () => {
    expect(mount_().find('.contact-view').exists()).toBe(true)
  })

  it('renders the contact heading', () => {
    expect(mount_().find('.contact-heading').text()).toBe('Contact & Guild Roster')
  })

  it('renders the guild roster table', () => {
    expect(mount_().find('table').exists()).toBe(true)
  })

  it('renders at least one roster row', () => {
    expect(mount_().findAll('tbody tr').length).toBeGreaterThan(0)
  })
})

describe('RaidingView', () => {
  const mount_ = () => mount(RaidingView)

  it('renders without errors', () => {
    expect(mount_().find('.raiding-view').exists()).toBe(true)
  })

  it('renders the Raid Schedule section', () => {
    expect(mount_().find('.schedule').text()).toContain('Raid Schedule')
  })

  it('renders the Loot Rules section', () => {
    expect(mount_().find('.loot-rules').exists()).toBe(true)
  })

  it('renders the Requirements section', () => {
    expect(mount_().find('.requirements').exists()).toBe(true)
  })
})

describe('AchievementsView', () => {
  const mount_ = () => mount(AchievementsView, { global: { stubs: killCardStub } })

  it('renders without errors', () => {
    expect(mount_().find('.achievements-view').exists()).toBe(true)
  })

  it('renders at least one kill card per kills entry', () => {
    expect(mount_().findAll('.stub-kill-card').length).toBeGreaterThan(0)
  })
})

describe('AboutView', () => {
  const mount_ = () => mount(AboutView)

  it('renders without errors', () => {
    expect(mount_().find('.about-view').exists()).toBe(true)
  })

  it('renders the About Us heading', () => {
    expect(mount_().find('.page-heading').text()).toBe('About Us')
  })

  it('renders both about cards', () => {
    expect(mount_().findAll('.about-card').length).toBe(2)
  })
})

describe('InMemoriamView', () => {
  const mount_ = () =>
    mount(InMemoriamView, {
      global: { stubs: { FadingDivider: { template: '<hr />' } } },
    })

  it('renders without errors', () => {
    expect(mount_().find('.in-memoriam-view').exists()).toBe(true)
  })

  it('renders the In Loving Memory heading', () => {
    expect(mount_().find('.memoriam-heading').text()).toBe('In Loving Memory')
  })

  it('renders at least one memorial entry', () => {
    expect(mount_().findAll('.memorial-entry').length).toBeGreaterThan(0)
  })
})

describe('NotFoundView', () => {
  const mount_ = () => mount(NotFoundView, { global: { stubs: { RouterLink: RouterLinkStub } } })

  it('renders without errors', () => {
    expect(mount_().find('.not-found-view').exists()).toBe(true)
  })

  it('renders the Page Not Found heading', () => {
    expect(mount_().find('h1').text()).toBe('Page Not Found')
  })

  it('renders a home link pointing to /', () => {
    const link = mount_().findComponent(RouterLinkStub)
    expect(link.props('to')).toBe('/')
  })
})
