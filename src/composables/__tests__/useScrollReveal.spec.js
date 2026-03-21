import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useScrollReveal } from '../useScrollReveal'

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
const mockUnobserve = vi.fn()

let intersectionCallback

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn((callback) => {
    intersectionCallback = callback
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: mockUnobserve,
    }
  }),
)

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: (fn) => fn(),
    onUnmounted: (fn) => {
      globalThis.__unmountFn = fn
    },
  }
})

describe('useScrollReveal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('observes .reveal elements within the container ref', () => {
    const mockEl = document.createElement('div')
    const revealChild = document.createElement('div')
    revealChild.classList.add('reveal')
    mockEl.appendChild(revealChild)

    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    expect(mockObserve).toHaveBeenCalledWith(revealChild)
  })

  it('adds revealed class when element intersects', () => {
    const mockEl = document.createElement('div')
    const revealChild = document.createElement('div')
    revealChild.classList.add('reveal')
    mockEl.appendChild(revealChild)

    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    intersectionCallback([{ target: revealChild, isIntersecting: true }])

    expect(revealChild.classList.contains('revealed')).toBe(true)
    expect(mockUnobserve).toHaveBeenCalledWith(revealChild)
  })

  it('disconnects observer on unmount', () => {
    const mockEl = document.createElement('div')
    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    globalThis.__unmountFn()

    expect(mockDisconnect).toHaveBeenCalled()
  })
})
