import { onMounted, onUnmounted } from 'vue'

/**
 * Observes `.reveal` elements within a container and adds `.revealed` class
 * when they scroll into view.
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 */
export function useScrollReveal(containerRef) {
  /** @type {IntersectionObserver | undefined} */
  let observer
  /** @type {MutationObserver | undefined} */
  let mutations

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    const container = containerRef.value ?? document.body
    const observeWithin = (root) => {
      if (root.classList?.contains('reveal')) observer.observe(root)
      root.querySelectorAll?.('.reveal').forEach((el) => observer.observe(el))
    }

    observeWithin(container)

    // A single mount-time scan missed anything rendered later behind a `v-if` —
    // most visibly the Next Tier error banner, which stayed at opacity 0
    // forever because it was never observed.
    mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) observeWithin(/** @type {Element} */ (node))
        }
      }
    })
    mutations.observe(container, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    observer?.disconnect()
    mutations?.disconnect()
  })
}
