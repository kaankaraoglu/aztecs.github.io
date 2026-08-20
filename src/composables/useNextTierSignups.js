import { ref, computed } from 'vue'

const WORKER_URL = import.meta.env.VITE_SIGNUP_WORKER_URL ?? ''
const TOKEN_KEY = 'aztecs-signup-jwt'

/**
 * @typedef {{ discordId: string, discordUsername: string, isAdmin: boolean }} CurrentUser
 * @typedef {{
 *   handle: string,
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

/**
 * Sign-in failures and request failures are tracked separately: the sign-in
 * message arrives from the OAuth redirect during mount, and the fetches that
 * follow would otherwise clear it before it could ever render.
 * @type {import('vue').Ref<string | null>}
 */
const authError = ref(null)
/** @type {import('vue').Ref<string | null>} */
const requestError = ref(null)

/**
 * The signed-in member's pseudonym for the current tier.
 *
 * The public submissions list identifies people by a per-tier hash rather than
 * their Discord id, so matching "which row is mine" means computing the same
 * hash the worker does.
 * @type {import('vue').Ref<string | null>}
 */
const myHandle = ref(null)

/**
 * Must match `submissionHandle` in workers/signup/src/index.js.
 * @param {string} tierId
 * @param {string} discordId
 * @returns {Promise<string | null>} null when Web Crypto is unavailable
 */
export async function submissionHandle(tierId, discordId) {
  try {
    const bytes = new TextEncoder().encode(`${tierId}:${discordId}`)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    const binary = Array.from(new Uint8Array(digest), (b) => String.fromCharCode(b)).join('')
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 22)
  } catch {
    // Web Crypto needs a secure context; fall back to the discordId match below.
    return null
  }
}

/**
 * Recomputes the signed-in member's handle for the current tier.
 *
 * Deliberately awaited rather than driven by a watcher: the digest is async, so
 * a watcher would leave a window where the member's own row is not recognised
 * and the page briefly offers to create a signup they already have.
 */
async function refreshMyHandle() {
  const user = currentUser.value
  const tierId = config.value.currentTierId
  myHandle.value = user && tierId ? await submissionHandle(tierId, user.discordId) : null
}

/**
 * localStorage throws rather than returning null when storage is blocked
 * (Safari private browsing, "block all cookies", some embedded webviews). The
 * signups composable runs during HomeView's setup, so an unguarded read took
 * the whole page down.
 * @param {string} key
 * @returns {string | null}
 */
function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** @param {string} key @param {string} value */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable — the session simply won't survive a reload */
  }
}

/** @param {string} key */
function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* nothing stored to remove */
  }
}

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/** @param {Record<string, any>} payload @returns {CurrentUser} */
function toCurrentUser(payload) {
  return {
    discordId: payload.sub,
    discordUsername: payload.username,
    isAdmin: payload.isAdmin === true,
  }
}

function loadStoredUser() {
  const token = safeGetItem(TOKEN_KEY)
  if (!token) return
  const payload = parseJwtPayload(token)
  if (!payload || (payload.exp && payload.exp < Date.now() / 1000)) {
    safeRemoveItem(TOKEN_KEY)
    // Also drop the in-memory user: an expired token used to leave the UI
    // showing a signed-in state whose every write came back 401.
    currentUser.value = null
    return
  }
  currentUser.value = toCurrentUser(payload)
}

function getAuthHeaders() {
  const token = safeGetItem(TOKEN_KEY)
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

function clearSession() {
  safeRemoveItem(TOKEN_KEY)
  currentUser.value = null
  myHandle.value = null
}

export function useNextTierSignups() {
  const error = computed(() => authError.value ?? requestError.value)

  const existingSubmission = computed(() => {
    const rows = submissions.value
    const handle = myHandle.value
    const discordId = currentUser.value?.discordId
    return (
      (handle && rows.find((s) => s.handle === handle)) ||
      // Tolerates a worker that still returns `discordId`, so the frontend and
      // the worker can be deployed in either order.
      (discordId && rows.find((s) => s.discordId === discordId)) ||
      null
    )
  })

  const isAdmin = computed(() => currentUser.value?.isAdmin === true)

  function handleAuthCallback() {
    const hash = window.location.hash
    if (!hash) return

    const params = new URLSearchParams(hash.slice(1))
    const token = params.get('token')
    const authErrorCode = params.get('error')

    // Leave ordinary in-page anchors alone; only an OAuth hash is ours to strip.
    if (!token && !authErrorCode) return

    if (token) {
      safeSetItem(TOKEN_KEY, token)
      const payload = parseJwtPayload(token)
      if (payload) {
        currentUser.value = toCurrentUser(payload)
        authError.value = null
      }
    }

    if (authErrorCode) {
      authError.value = `Discord sign-in failed: ${authErrorCode}`
    }

    history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  /**
   * @param {Response} res
   * @param {string} fallbackMessage
   * @returns {Promise<string>}
   */
  async function readError(res, fallbackMessage) {
    const data = await res.json().catch(() => ({}))
    return data.error ?? fallbackMessage
  }

  /** Every request needs the worker; without it the calls would resolve against the site's own origin. */
  function workerMissing() {
    if (WORKER_URL) return false
    requestError.value = 'Signups are not configured for this environment'
    return true
  }

  async function fetchConfig() {
    if (workerMissing()) return
    try {
      const res = await fetch(`${WORKER_URL}/api/config`)
      if (!res.ok) {
        // Previously a 5xx here was indistinguishable from "signups closed".
        requestError.value = await readError(res, 'Unable to load signup configuration')
        return
      }
      config.value = await res.json()
      await refreshMyHandle()
    } catch {
      requestError.value = 'Unable to load signup configuration'
    }
  }

  async function fetchSubmissions() {
    if (workerMissing()) return
    loading.value = true
    requestError.value = null
    try {
      const res = await fetch(`${WORKER_URL}/api/submissions`)
      if (!res.ok) {
        requestError.value = await readError(res, 'Unable to load submissions')
        return
      }
      submissions.value = await res.json()
    } catch {
      requestError.value = 'Unable to load submissions'
    } finally {
      loading.value = false
    }
  }

  /**
   * @param {{ handle?: string, discordId?: string }} [submission]
   * @returns {string} query string targeting another member's signup, or '' for one's own
   */
  function buildDeleteQuery(submission) {
    if (!submission) return ''
    if (submission.handle) return `?handle=${encodeURIComponent(submission.handle)}`
    if (submission.discordId) return `?discordId=${encodeURIComponent(submission.discordId)}`
    return ''
  }

  async function submitSignup({ characterName, className, specName }) {
    requestError.value = null
    if (workerMissing()) return
    try {
      const res = await fetch(`${WORKER_URL}/api/submissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ characterName, className, specName }),
      })
      if (res.status === 401) {
        clearSession()
        requestError.value = 'Session expired, please sign in again'
        return
      }
      if (!res.ok) {
        requestError.value = await readError(res, 'Failed to submit signup')
        return
      }
      await fetchSubmissions()
    } catch {
      requestError.value = 'Failed to submit signup'
    }
  }

  /**
   * Remove a signup. Pass the submission row to remove another member's signup
   * (admin only); omit it to remove the current user's own signup.
   * @param {{ handle?: string, discordId?: string }} [submission]
   */
  async function deleteSignup(submission) {
    requestError.value = null
    if (workerMissing()) return
    try {
      const query = buildDeleteQuery(submission)
      const res = await fetch(`${WORKER_URL}/api/submissions${query}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (res.status === 401) {
        clearSession()
        requestError.value = 'Session expired, please sign in again'
        return
      }
      if (!res.ok) {
        requestError.value = await readError(res, 'Failed to remove signup')
        return
      }
      await fetchSubmissions()
    } catch {
      requestError.value = 'Failed to remove signup'
    }
  }

  function signOut() {
    clearSession()
    authError.value = null
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
    myHandle,
    handleAuthCallback,
    fetchConfig,
    fetchSubmissions,
    submitSignup,
    deleteSignup,
    signOut,
    getDiscordAuthUrl,
  }
}
