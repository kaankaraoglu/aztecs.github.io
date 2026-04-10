import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

let mountedFn
let unmountedFn

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: (fn) => {
      mountedFn = fn
    },
    onUnmounted: (fn) => {
      unmountedFn = fn
    },
  }
})

function stubMatchMedia({ hover = true, reducedMotion = false } = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches: query.includes('hover') ? hover : reducedMotion,
    })),
  )
}

describe('useTiltEffect', () => {
  beforeEach(() => {
    vi.resetModules()
    mountedFn = null
    unmountedFn = null
  })

  it('returns empty tiltStyle and skips setup when hover is not supported', async () => {
    stubMatchMedia({ hover: false })
    const { useTiltEffect } = await import('../useTiltEffect')
    const el = ref(document.createElement('div'))
    const { tiltStyle } = useTiltEffect(el)

    expect(tiltStyle.value).toEqual({})
    expect(mountedFn).toBeNull()
  })

  it('returns empty tiltStyle and skips setup when prefers-reduced-motion is set', async () => {
    stubMatchMedia({ hover: true, reducedMotion: true })
    const { useTiltEffect } = await import('../useTiltEffect')
    const el = ref(document.createElement('div'))
    const { tiltStyle } = useTiltEffect(el)

    expect(tiltStyle.value).toEqual({})
    expect(mountedFn).toBeNull()
  })

  it('adds event listeners on mount and removes on unmount', async () => {
    stubMatchMedia({ hover: true })
    const { useTiltEffect } = await import('../useTiltEffect')
    const mockEl = document.createElement('div')
    const addSpy = vi.spyOn(mockEl, 'addEventListener')
    const removeSpy = vi.spyOn(mockEl, 'removeEventListener')
    const el = ref(mockEl)

    useTiltEffect(el)
    mountedFn()

    expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))

    unmountedFn()

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))
  })

  it('computes tilt transform on mousemove', async () => {
    stubMatchMedia({ hover: true })
    const { useTiltEffect } = await import('../useTiltEffect')
    const mockEl = document.createElement('div')
    // Simulate element at (0,0) with 200x100 size
    vi.spyOn(mockEl, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    })
    const el = ref(mockEl)

    const { tiltStyle } = useTiltEffect(el, { maxTilt: 10, scale: 1.05 })
    mountedFn()

    // Mouse at center (100, 50) → x=0, y=0 → no tilt
    mockEl.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 50 }))
    expect(tiltStyle.value.transform).toBe(
      'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1.05)',
    )
    expect(tiltStyle.value.willChange).toBe('transform')

    // Mouse at top-left corner (0, 0) → x=-0.5, y=-0.5
    mockEl.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }))
    expect(tiltStyle.value.transform).toBe(
      'perspective(800px) rotateY(-5deg) rotateX(5deg) scale(1.05)',
    )
  })

  it('resets tilt on mouseleave', async () => {
    stubMatchMedia({ hover: true })
    const { useTiltEffect } = await import('../useTiltEffect')
    const mockEl = document.createElement('div')
    vi.spyOn(mockEl, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    })
    const el = ref(mockEl)

    const { tiltStyle } = useTiltEffect(el)
    mountedFn()

    // Trigger a move then leave
    mockEl.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 25 }))
    mockEl.dispatchEvent(new MouseEvent('mouseleave'))

    expect(tiltStyle.value).toEqual({ willChange: 'auto' })
  })

  it('does not crash on mount when elementRef is null', async () => {
    stubMatchMedia({ hover: true })
    const { useTiltEffect } = await import('../useTiltEffect')
    const el = ref(null)

    useTiltEffect(el)

    // Should not throw
    expect(() => mountedFn()).not.toThrow()
  })

  it('does not crash on unmount when elementRef is null', async () => {
    stubMatchMedia({ hover: true })
    const { useTiltEffect } = await import('../useTiltEffect')
    const el = ref(null)

    useTiltEffect(el)
    mountedFn()

    expect(() => unmountedFn()).not.toThrow()
  })

  it('uses default maxTilt of 8 and scale of 1.02', async () => {
    stubMatchMedia({ hover: true })
    const { useTiltEffect } = await import('../useTiltEffect')
    const mockEl = document.createElement('div')
    vi.spyOn(mockEl, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    })
    const el = ref(mockEl)

    const { tiltStyle } = useTiltEffect(el)
    mountedFn()

    // Mouse at far right center (200, 50) → x=0.5, y=0
    mockEl.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 50 }))
    expect(tiltStyle.value.transform).toBe(
      'perspective(800px) rotateY(4deg) rotateX(0deg) scale(1.02)',
    )
  })
})
