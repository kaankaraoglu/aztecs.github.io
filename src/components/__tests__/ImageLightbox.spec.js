import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageLightbox from '../ImageLightbox.vue'

// Stub the shadcn Dialog primitives so we can assert on our own markup
// without rendering Reka UI's portal/overlay tree in jsdom.
const dialogStubs = {
  Dialog: {
    props: ['open'],
    emits: ['update:open'],
    template: '<div><slot v-if="open" /></div>',
  },
  DialogContent: {
    template: '<div class="lightbox-overlay" v-bind="$attrs"><slot /></div>',
    inheritAttrs: false,
  },
  DialogTitle: { template: '<h2><slot /></h2>' },
  DialogDescription: { template: '<p><slot /></p>' },
}

describe('ImageLightbox', () => {
  const global = { stubs: dialogStubs }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render content when open is false', () => {
    const wrapper = mount(ImageLightbox, {
      props: { open: false, src: 'test.jpg' },
      global,
    })
    expect(wrapper.find('.lightbox-overlay').exists()).toBe(false)
  })

  it('renders overlay, close button, and image when open', () => {
    const wrapper = mount(ImageLightbox, {
      props: { open: true, src: 'test.jpg', alt: 'Test image' },
      global,
    })
    expect(wrapper.find('.lightbox-overlay').exists()).toBe(true)
    expect(wrapper.find('.lightbox-close').exists()).toBe(true)
    const img = wrapper.find('.lightbox-image')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('test.jpg')
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(ImageLightbox, {
      props: { open: true, src: 'test.jpg' },
      global,
    })
    await wrapper.find('.lightbox-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close when image is clicked', async () => {
    const wrapper = mount(ImageLightbox, {
      props: { open: true, src: 'test.jpg' },
      global,
    })
    await wrapper.find('.lightbox-image').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('shows error state when image fails to load', async () => {
    const wrapper = mount(ImageLightbox, {
      props: { open: true, src: 'bad.jpg' },
      global,
    })
    await wrapper.find('.lightbox-image').trigger('error')
    expect(wrapper.find('.lightbox-error').exists()).toBe(true)
    expect(wrapper.find('.lightbox-image').exists()).toBe(false)
  })

  it('resets error state when src changes', async () => {
    const wrapper = mount(ImageLightbox, {
      props: { open: true, src: 'bad.jpg' },
      global,
    })
    await wrapper.find('.lightbox-image').trigger('error')
    expect(wrapper.find('.lightbox-error').exists()).toBe(true)

    await wrapper.setProps({ src: 'good.jpg' })
    expect(wrapper.find('.lightbox-error').exists()).toBe(false)
    expect(wrapper.find('.lightbox-image').exists()).toBe(true)
  })
})
