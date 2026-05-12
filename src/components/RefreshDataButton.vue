<template>
  <button
    class="refresh-btn"
    :class="state"
    :disabled="state !== 'idle'"
    :aria-label="ariaLabel"
    @click="handleRefresh"
  >
    <svg
      class="refresh-icon"
      :class="{ spinning: state === 'submitting' }"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.3-3.56" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M13.5 2.5v2.5H11" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="refresh-label">{{ label }}</span>
  </button>
  <div ref="turnstileRef" class="turnstile-widget"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'

const WORKER_URL = import.meta.env.VITE_REFRESH_WORKER_URL
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

/** @type {'idle' | 'submitting' | 'success' | 'error' | 'rate-limited'} */
const state = ref('idle')
const retryCountdown = ref(0)
const actionsUrl = ref('')
const turnstileRef = ref(null)

/** @type {string | null} */
let turnstileWidgetId = null
/** @type {number | null} */
let countdownTimer = null

const { trackEvent } = useAnalytics()

const STATE_MESSAGES = {
  idle: { label: 'Refresh', ariaLabel: 'Refresh progression data' },
  submitting: { label: 'Refreshing…', ariaLabel: 'Refreshing progression data…' },
  success: { label: 'Triggered!', ariaLabel: 'Data refresh triggered successfully' },
  error: { label: 'Failed', ariaLabel: 'Data refresh failed, try again later' },
}

const label = computed(() => {
  if (state.value === 'rate-limited') return `Wait ${formatCountdown(retryCountdown.value)}`
  return STATE_MESSAGES[state.value]?.label ?? STATE_MESSAGES.idle.label
})

const ariaLabel = computed(() => {
  if (state.value === 'rate-limited')
    return `Rate limited, retry in ${formatCountdown(retryCountdown.value)}`
  return STATE_MESSAGES[state.value]?.ariaLabel ?? STATE_MESSAGES.idle.ariaLabel
})

/**
 * @param {number} seconds
 * @returns {string}
 */
function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

function startCountdown(seconds) {
  retryCountdown.value = seconds
  state.value = 'rate-limited'
  countdownTimer = window.setInterval(() => {
    retryCountdown.value--
    if (retryCountdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
      state.value = 'idle'
      resetTurnstile()
    }
  }, 1000)
}

function resetTurnstile() {
  if (turnstileWidgetId != null && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId)
  }
}

function loadTurnstileScript() {
  if (document.querySelector('script[src*="turnstile"]')) return
  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  script.async = true
  script.defer = true
  script.onload = renderTurnstile
  document.head.appendChild(script)
}

function renderTurnstile() {
  if (!window.turnstile || !turnstileRef.value) return
  turnstileWidgetId = window.turnstile.render(turnstileRef.value, {
    sitekey: SITE_KEY,
    size: 'invisible',
    callback: () => {},
  })
}

async function getTurnstileToken() {
  if (!window.turnstile || turnstileWidgetId == null) return null
  return new Promise((resolve) => {
    window.turnstile.execute(turnstileWidgetId, {
      callback: (token) => resolve(token),
      'error-callback': () => resolve(null),
    })
  })
}

async function handleRefresh() {
  if (state.value !== 'idle' || !WORKER_URL) return
  state.value = 'submitting'
  trackEvent('refresh_data', { action: 'click' })

  try {
    let turnstileToken = null
    if (SITE_KEY) {
      turnstileToken = await getTurnstileToken()
      if (!turnstileToken) {
        state.value = 'error'
        scheduleReset()
        return
      }
    }

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turnstileToken }),
    })

    const data = await response.json()

    if (response.status === 429) {
      startCountdown(data.retryAfter || 600)
      trackEvent('refresh_data', { action: 'rate_limited' })
      return
    }

    if (!response.ok) {
      state.value = 'error'
      trackEvent('refresh_data', { action: 'error', status: response.status })
      scheduleReset()
      return
    }

    actionsUrl.value = data.actionsUrl || ''
    state.value = 'success'
    trackEvent('refresh_data', { action: 'success' })
    scheduleReset()
  } catch {
    state.value = 'error'
    trackEvent('refresh_data', { action: 'error' })
    scheduleReset()
  }
}

function scheduleReset() {
  setTimeout(() => {
    state.value = 'idle'
    resetTurnstile()
  }, 4000)
}

onMounted(() => {
  if (SITE_KEY) {
    if (window.turnstile) {
      renderTurnstile()
    } else {
      loadTurnstileScript()
    }
  }
})

onUnmounted(() => {
  if (countdownTimer != null) {
    clearInterval(countdownTimer)
  }
  if (turnstileWidgetId != null && window.turnstile) {
    window.turnstile.remove(turnstileWidgetId)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.25em 0.6em;
  font-size: 0.7em;
  font-weight: 600;
  color: $color-text-muted;
  background: transparent;
  border: 1px solid rgba(var(--t-text-primary-rgb), 0.1);
  border-radius: $radius-sm;
  cursor: pointer;
  transition:
    color $duration-fast,
    border-color $duration-fast,
    background $duration-fast;
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: $accent-color;
    border-color: rgba(var(--t-accent-rgb), 0.4);
    background: rgba(var(--t-accent-rgb), 0.06);
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  &.success {
    color: $quality-uncommon;
    border-color: rgba($quality-uncommon, 0.3);
  }

  &.error {
    color: $color-red;
    border-color: rgba($color-red, 0.3);
  }

  &.rate-limited {
    color: $color-text-subtle;
    border-color: rgba(var(--t-text-primary-rgb), 0.06);
  }
}

.refresh-icon {
  flex-shrink: 0;

  &.spinning {
    animation: spin 1s linear infinite;
  }
}

.turnstile-widget {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
