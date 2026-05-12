import { ref, watch } from 'vue'

/** @typedef {'dark' | 'light'} Theme */

const STORAGE_KEY = 'aztecs-theme'
/** Brand default — dark is the Aztecs look, users opt into light explicitly. */
const DEFAULT_THEME = 'dark'

/**
 * Read the initial theme: stored explicit preference > brand default (dark).
 * An explicit user pick (set via the header switch) is persisted and always
 * wins over the default on subsequent loads.
 * @returns {Theme}
 */
function readInitialTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* storage may be unavailable (private mode, sandboxed tests, etc.) */
  }
  return DEFAULT_THEME
}

/** Shared across all call sites so a toggle in one component updates the whole app. */
const theme = ref(readInitialTheme())

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', theme.value)

  watch(theme, (next) => {
    document.documentElement.setAttribute('data-theme', next)
  })
}

export function useTheme() {
  /** @param {Theme} next */
  function setTheme(next) {
    theme.value = next
    try {
      window.localStorage?.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore storage errors */
    }
  }

  return { theme, setTheme }
}
