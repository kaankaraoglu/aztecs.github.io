import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useScrollReveal } from '../useScrollReveal'

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
const mockUnobserve = vi.fn()

let intersectionCallback

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(function (callback) {
    intersectionCallback = callback
    this.observe = mockObserve
    this.disconnect = mockDisconnect
    this.unobserve = mockUnobserve
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

// MutationObserver callbacks run on a microtask, so let the queue drain first.
function flushMutations() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

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

  it('observes a .reveal element appended to the container after mount', async () => {
    const mockEl = document.createElement('div')
    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    expect(mockObserve).not.toHaveBeenCalled()

    const lateChild = document.createElement('div')
    lateChild.classList.add('reveal')
    mockEl.appendChild(lateChild)
    await flushMutations()

    expect(mockObserve).toHaveBeenCalledWith(lateChild)
  })

  it('observes .reveal descendants of a subtree appended after mount', async () => {
    const mockEl = document.createElement('div')
    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    const wrapper = document.createElement('section')
    const nested = document.createElement('p')
    nested.classList.add('reveal')
    wrapper.appendChild(nested)
    mockEl.appendChild(wrapper)
    await flushMutations()

    expect(mockObserve).toHaveBeenCalledWith(nested)
    expect(mockObserve).not.toHaveBeenCalledWith(wrapper)
  })

  it('ignores appended elements without the reveal class', async () => {
    const mockEl = document.createElement('div')
    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    mockEl.appendChild(document.createElement('span'))
    mockEl.appendChild(document.createTextNode('plain text'))
    await flushMutations()

    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('stops observing mutations once unmounted', async () => {
    const mockEl = document.createElement('div')
    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    globalThis.__unmountFn()

    const lateChild = document.createElement('div')
    lateChild.classList.add('reveal')
    mockEl.appendChild(lateChild)
    await flushMutations()

    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('disconnects both the intersection and mutation observers on unmount', () => {
    const mutationDisconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const mockEl = document.createElement('div')
    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    globalThis.__unmountFn()

    expect(mockDisconnect).toHaveBeenCalledTimes(1)
    expect(mutationDisconnect).toHaveBeenCalledTimes(1)

    mutationDisconnect.mockRestore()
  })
})
