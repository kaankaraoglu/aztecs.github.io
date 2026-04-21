import { ref, watch } from 'vue'

/** @typedef {'dark' | 'light'} Theme */

const STORAGE_KEY = 'aztecs-theme'

/**
 * Read the initial theme: stored preference > OS preference > dark (brand default).
 * @returns {Theme}
 */
function readInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* storage may be unavailable (private mode, sandboxed tests, etc.) */
  }
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

/** Shared across all call sites so a toggle in one component updates the whole app. */
const theme = ref(readInitialTheme())

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', theme.value)

  watch(theme, (next) => {
    document.documentElement.setAttribute('data-theme', next)
    try {
      window.localStorage?.setItem(STORAGE_KEY, next)
    } catch {
      /* storage may be unavailable (private mode, etc.) — ignore */
    }
  })
}

export function useTheme() {
  /** @param {Theme} next */
  function setTheme(next) {
    theme.value = next
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, setTheme, toggleTheme }
}
