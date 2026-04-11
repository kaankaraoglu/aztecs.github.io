import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import FooterView from '../FooterView.vue'

describe('FooterView', () => {
  const mountFooter = () =>
    mount(FooterView, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

  it('renders all internal nav links with correct paths', () => {
    const wrapper = mountFooter()
    const links = wrapper.findAllComponents(RouterLinkStub)
    const paths = links.map((l) => l.props('to'))
    expect(paths).toContain('/')
    expect(paths).toContain('/raiding')
    expect(paths).toContain('/achievements')
    expect(paths).toContain('/in-memoriam')
    expect(paths).toContain('/about')
    expect(paths).toContain('/contact')
  })

  it('renders external links with correct hrefs', () => {
    const wrapper = mountFooter()
    const externalLinks = wrapper.findAll('.footer-social a')
    const hrefs = externalLinks.map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://discord.gg/GfmnD24VHa')
    expect(hrefs).toContain('https://www.warcraftlogs.com/guild/eu/alakir/aztecs')
    expect(hrefs).toContain('https://raider.io/guilds/eu/alakir/Aztecs')
  })

  it('opens external links in new tabs', () => {
    const wrapper = mountFooter()
    const externalLinks = wrapper.findAll('.footer-social a')
    for (const link of externalLinks) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener')
    }
  })

  it('shows the current year in copyright', () => {
    const wrapper = mountFooter()
    const year = new Date().getFullYear().toString()
    expect(wrapper.find('.footer-copyright').text()).toContain(year)
  })

  it('renders the footer logo', () => {
    const wrapper = mountFooter()
    const logo = wrapper.find('.footer-logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('alt')).toBe('Aztecs')
  })
})
