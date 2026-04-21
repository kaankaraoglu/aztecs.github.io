import { ref, watch } from 'vue'

/** @typedef {'dark' | 'light'} Theme */

const STORAGE_KEY = 'aztecs-theme'
/** Hours (24h local time) during which the auto-theme picks light mode. */
const LIGHT_HOURS_START = 7 // 07:00
const LIGHT_HOURS_END = 19 // 19:00 (exclusive)

/**
 * Pick the theme for the current local time.
 * @returns {Theme}
 */
function themeForNow() {
  const h = new Date().getHours()
  return h >= LIGHT_HOURS_START && h < LIGHT_HOURS_END ? 'light' : 'dark'
}

/**
 * Read the initial theme: stored explicit preference > time-of-day default.
 * An explicit user pick (set via the header toggle) always overrides the
 * auto schedule, so toggling doesn't get stomped a minute later.
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
  return themeForNow()
}

/** Shared across all call sites so a toggle in one component updates the whole app. */
const theme = ref(readInitialTheme())
/** Tracks whether the current theme came from the time-of-day default. */
const usingAutoTheme = ref(true)

if (typeof window !== 'undefined') {
  try {
    usingAutoTheme.value = !window.localStorage?.getItem(STORAGE_KEY)
  } catch {
    usingAutoTheme.value = true
  }
}

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', theme.value)

  watch(theme, (next) => {
    document.documentElement.setAttribute('data-theme', next)
  })
}

if (typeof window !== 'undefined') {
  // Re-evaluate on an interval while the user hasn't pinned a preference,
  // so a tab left open across sunset/sunrise flips automatically.
  setInterval(
    () => {
      if (!usingAutoTheme.value) return
      const next = themeForNow()
      if (next !== theme.value) theme.value = next
    },
    5 * 60 * 1000,
  )
}

export function useTheme() {
  /** @param {Theme} next */
  function setTheme(next) {
    theme.value = next
    usingAutoTheme.value = false
    try {
      window.localStorage?.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore storage errors */
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}
