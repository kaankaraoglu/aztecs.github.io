import { ref, computed } from 'vue'

const WORKER_URL = import.meta.env.VITE_SIGNUP_WORKER_URL ?? ''
const TOKEN_KEY = 'aztecs-signup-jwt'

/**
 * @typedef {{ discordId: string, discordUsername: string, isAdmin: boolean }} CurrentUser
 * @typedef {{
 *   discordId: string,
 *   discordUsername: string,
 *   characterName: string,
 *   className: string,
 *   specName: string,
 *   submittedAt: string,
 *   updatedAt: string
 * }} Submission
 * @typedef {{ currentTierId: string | null, tierName: string | null, isOpen: boolean }} TierConfig
 */

/** @type {import('vue').Ref<Submission[]>} */
const submissions = ref([])

/** @type {import('vue').Ref<TierConfig>} */
const config = ref({ currentTierId: null, tierName: null, isOpen: false })

/** @type {import('vue').Ref<CurrentUser | null>} */
const currentUser = ref(null)

/** @type {import('vue').Ref<boolean>} */
const loading = ref(false)

/** @type {import('vue').Ref<string | null>} */
const error = ref(null)

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function loadStoredUser() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return
  const payload = parseJwtPayload(token)
  if (!payload || (payload.exp && payload.exp < Date.now() / 1000)) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  currentUser.value = {
    discordId: payload.sub,
    discordUsername: payload.username,
    isAdmin: payload.isAdmin === true,
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export function useNextTierSignups() {
  const existingSubmission = computed(
    () => submissions.value.find((s) => s.discordId === currentUser.value?.discordId) ?? null,
  )

  const isAdmin = computed(() => currentUser.value?.isAdmin === true)

  function handleAuthCallback() {
    const hash = window.location.hash
    if (!hash) return

    const params = new URLSearchParams(hash.slice(1))
    const token = params.get('token')
    const authError = params.get('error')

    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      const payload = parseJwtPayload(token)
      if (payload) {
        currentUser.value = {
          discordId: payload.sub,
          discordUsername: payload.username,
          isAdmin: payload.isAdmin === true,
        }
      }
    }

    if (authError) {
      error.value = `Discord sign-in failed: ${authError}`
    }

    history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  async function fetchConfig() {
    try {
      const res = await fetch(`${WORKER_URL}/api/config`)
      if (res.ok) {
        config.value = await res.json()
      }
    } catch {
      error.value = 'Unable to load signup configuration'
    }
  }

  async function fetchSubmissions() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${WORKER_URL}/api/submissions`)
      if (res.ok) {
        submissions.value = await res.json()
      }
    } catch {
      error.value = 'Unable to load submissions'
    } finally {
      loading.value = false
    }
  }

  async function submitSignup({ characterName, className, specName }) {
    error.value = null
    try {
      const res = await fetch(`${WORKER_URL}/api/submissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ characterName, className, specName }),
      })
      if (res.status === 401) {
        currentUser.value = null
        localStorage.removeItem(TOKEN_KEY)
        error.value = 'Session expired, please sign in again'
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        error.value = data.error ?? 'Failed to submit signup'
        return
      }
      await fetchSubmissions()
    } catch {
      error.value = 'Failed to submit signup'
    }
  }

  /**
   * Remove a signup. Pass a `discordId` to remove another member's signup
   * (admin only); omit it to remove the current user's own signup.
   * @param {string} [discordId]
   */
  async function deleteSignup(discordId) {
    error.value = null
    try {
      const query =
        typeof discordId === 'string' ? `?discordId=${encodeURIComponent(discordId)}` : ''
      const res = await fetch(`${WORKER_URL}/api/submissions${query}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (res.status === 401) {
        currentUser.value = null
        localStorage.removeItem(TOKEN_KEY)
        error.value = 'Session expired, please sign in again'
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        error.value = data.error ?? 'Failed to remove signup'
        return
      }
      await fetchSubmissions()
    } catch {
      error.value = 'Failed to remove signup'
    }
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    currentUser.value = null
  }

  function getDiscordAuthUrl() {
    return `${WORKER_URL}/auth/discord`
  }

  loadStoredUser()

  return {
    submissions,
    config,
    currentUser,
    existingSubmission,
    isAdmin,
    loading,
    error,
    handleAuthCallback,
    fetchConfig,
    fetchSubmissions,
    submitSignup,
    deleteSignup,
    signOut,
    getDiscordAuthUrl,
  }
}
