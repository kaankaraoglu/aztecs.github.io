import { onMounted, onUnmounted } from 'vue'

/**
 * Observes `.reveal` elements within a container and adds `.revealed` class
 * when they scroll into view.
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 */
export function useScrollReveal(containerRef) {
  let observer

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
    container.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
  })

  onUnmounted(() => observer?.disconnect())
}
