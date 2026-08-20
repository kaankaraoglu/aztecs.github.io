import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const WORKER_URL = 'https://signup.test'
const TOKEN_KEY = 'aztecs-signup-jwt'

/** Module-level state is shared across calls, so every test re-imports the module. */
async function loadModule() {
  vi.resetModules()
  return import('../useNextTierSignups')
}

async function loadComposable() {
  const { useNextTierSignups } = await loadModule()
  return useNextTierSignups()
}

/** In-memory localStorage; `overrides` lets a test make a method throw. */
function stubStorage(overrides = {}) {
  const store = new Map()
  const storage = {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value))
    }),
    removeItem: vi.fn((key) => {
      store.delete(key)
    }),
    ...overrides,
  }
  vi.stubGlobal('localStorage', storage)
  return { store, storage }
}

function base64Url(obj) {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function makeToken(payload) {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`
}

const futureExp = () => Math.floor(Date.now() / 1000) + 3600
const pastExp = () => Math.floor(Date.now() / 1000) - 3600

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, json: () => Promise.resolve(body) }
}

function unparseableResponse({ ok = false, status = 500 } = {}) {
  return { ok, status, json: () => Promise.reject(new SyntaxError('Unexpected token <')) }
}

function setHash(hash) {
  history.replaceState(null, '', `/next-tier${hash}`)
}

describe('useNextTierSignups', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SIGNUP_WORKER_URL', WORKER_URL)
    stubStorage()
    history.replaceState(null, '', '/next-tier')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    history.replaceState(null, '', '/')
  })

  describe('handleAuthCallback', () => {
    it('stores the token, populates currentUser from the JWT payload and strips the hash', async () => {
      const token = makeToken({ sub: '4242', username: 'kaank', isAdmin: true, exp: futureExp() })
      setHash(`#token=${token}`)
      const replaceState = vi.spyOn(history, 'replaceState')

      const { handleAuthCallback, currentUser, isAdmin } = await loadComposable()
      handleAuthCallback()

      expect(localStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, token)
      expect(currentUser.value).toEqual({
        discordId: '4242',
        discordUsername: 'kaank',
        isAdmin: true,
      })
      expect(isAdmin.value).toBe(true)
      expect(replaceState).toHaveBeenCalledWith(null, '', '/next-tier')
      expect(window.location.hash).toBe('')
    })

    it('defaults isAdmin to false when the payload does not claim it', async () => {
      const token = makeToken({ sub: '7', username: 'raider', exp: futureExp() })
      setHash(`#token=${token}`)

      const { handleAuthCallback, currentUser, isAdmin } = await loadComposable()
      handleAuthCallback()

      expect(currentUser.value).toEqual({
        discordId: '7',
        discordUsername: 'raider',
        isAdmin: false,
      })
      expect(isAdmin.value).toBe(false)
    })

    it('leaves a non-OAuth hash completely alone', async () => {
      setHash('#roster')
      const replaceState = vi.spyOn(history, 'replaceState')

      const { handleAuthCallback, currentUser, error } = await loadComposable()
      handleAuthCallback()

      expect(localStorage.setItem).not.toHaveBeenCalled()
      expect(replaceState).not.toHaveBeenCalled()
      expect(window.location.hash).toBe('#roster')
      expect(currentUser.value).toBeNull()
      expect(error.value).toBeNull()
    })

    it('does nothing when there is no hash at all', async () => {
      const replaceState = vi.spyOn(history, 'replaceState')

      const { handleAuthCallback, currentUser } = await loadComposable()
      handleAuthCallback()

      expect(replaceState).not.toHaveBeenCalled()
      expect(localStorage.setItem).not.toHaveBeenCalled()
      expect(currentUser.value).toBeNull()
    })

    it('surfaces an error hash as a sign-in message and strips the hash', async () => {
      setHash('#error=access_denied')
      const replaceState = vi.spyOn(history, 'replaceState')

      const { handleAuthCallback, error, currentUser } = await loadComposable()
      handleAuthCallback()

      expect(error.value).toBe('Discord sign-in failed: access_denied')
      expect(currentUser.value).toBeNull()
      expect(replaceState).toHaveBeenCalledWith(null, '', '/next-tier')
    })

    it('keeps the sign-in message visible across a later fetchSubmissions', async () => {
      setHash('#error=invalid_grant')
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(jsonResponse([{ discordId: '1' }]))),
      )

      const { handleAuthCallback, fetchSubmissions, error, submissions } = await loadComposable()
      handleAuthCallback()
      expect(error.value).toBe('Discord sign-in failed: invalid_grant')

      await fetchSubmissions()

      expect(submissions.value).toEqual([{ discordId: '1' }])
      expect(error.value).toBe('Discord sign-in failed: invalid_grant')
    })

    it('clears a previous sign-in message once a token arrives', async () => {
      setHash('#error=access_denied')
      const { handleAuthCallback, error } = await loadComposable()
      handleAuthCallback()
      expect(error.value).toBe('Discord sign-in failed: access_denied')

      setHash(`#token=${makeToken({ sub: '9', username: 'back', exp: futureExp() })}`)
      handleAuthCallback()

      expect(error.value).toBeNull()
    })
  })

  describe('stored session', () => {
    it('restores currentUser from a valid stored token', async () => {
      const { store } = stubStorage()
      store.set(TOKEN_KEY, makeToken({ sub: '55', username: 'stored', exp: futureExp() }))

      const { currentUser } = await loadComposable()

      expect(currentUser.value).toEqual({
        discordId: '55',
        discordUsername: 'stored',
        isAdmin: false,
      })
    })

    it('drops an expired token from storage and clears currentUser', async () => {
      const { store, storage } = stubStorage()
      const { useNextTierSignups } = await loadModule()

      setHash(`#token=${makeToken({ sub: '55', username: 'stored', exp: futureExp() })}`)
      const first = useNextTierSignups()
      first.handleAuthCallback()
      expect(first.currentUser.value).not.toBeNull()

      store.set(TOKEN_KEY, makeToken({ sub: '55', username: 'stored', exp: pastExp() }))
      const second = useNextTierSignups()

      expect(second.currentUser.value).toBeNull()
      expect(storage.removeItem).toHaveBeenCalledWith(TOKEN_KEY)
      expect(store.has(TOKEN_KEY)).toBe(false)
    })

    it('drops an unparseable token from storage', async () => {
      const { store, storage } = stubStorage()
      store.set(TOKEN_KEY, 'not-a-jwt')

      const { currentUser } = await loadComposable()

      expect(currentUser.value).toBeNull()
      expect(storage.removeItem).toHaveBeenCalledWith(TOKEN_KEY)
      expect(store.has(TOKEN_KEY)).toBe(false)
    })

    it('keeps a token that carries no expiry', async () => {
      const { store } = stubStorage()
      store.set(TOKEN_KEY, makeToken({ sub: '3', username: 'forever' }))

      const { currentUser } = await loadComposable()

      expect(currentUser.value.discordId).toBe('3')
      expect(store.has(TOKEN_KEY)).toBe(true)
    })

    it('does not throw when localStorage is blocked', async () => {
      const blocked = () => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      }
      stubStorage({
        getItem: vi.fn(blocked),
        setItem: vi.fn(blocked),
        removeItem: vi.fn(blocked),
      })

      const { useNextTierSignups } = await loadModule()
      expect(() => useNextTierSignups()).not.toThrow()

      const token = makeToken({ sub: '8', username: 'private', exp: futureExp() })
      setHash(`#token=${token}`)
      const { handleAuthCallback, currentUser } = useNextTierSignups()
      expect(() => handleAuthCallback()).not.toThrow()
      // The session can't survive a reload, but it still works for this page view.
      expect(currentUser.value.discordId).toBe('8')
    })

    it('signOut clears the stored token, the user and the sign-in message', async () => {
      const { store } = stubStorage()
      setHash('#error=access_denied')

      const { handleAuthCallback, signOut, currentUser, error } = await loadComposable()
      handleAuthCallback()
      store.set(TOKEN_KEY, makeToken({ sub: '1', username: 'x', exp: futureExp() }))

      signOut()

      expect(store.has(TOKEN_KEY)).toBe(false)
      expect(currentUser.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })

  describe('fetchConfig', () => {
    it('stores the tier config from a successful response', async () => {
      const tier = { currentTierId: 'manaforge-omega', tierName: 'Manaforge Omega', isOpen: true }
      const fetchMock = vi.fn(() => Promise.resolve(jsonResponse(tier)))
      vi.stubGlobal('fetch', fetchMock)

      const { fetchConfig, config, error } = await loadComposable()
      await fetchConfig()

      expect(fetchMock).toHaveBeenCalledWith(`${WORKER_URL}/api/config`)
      expect(config.value).toEqual(tier)
      expect(error.value).toBeNull()
    })

    it('reports the worker error field on a non-ok response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            jsonResponse({ error: 'KV namespace unavailable' }, { ok: false, status: 503 }),
          ),
        ),
      )

      const { fetchConfig, config, error } = await loadComposable()
      await fetchConfig()

      expect(error.value).toBe('KV namespace unavailable')
      expect(config.value).toEqual({ currentTierId: null, tierName: null, isOpen: false })
    })

    it('falls back to a generic message when the error body is unreadable', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(unparseableResponse())),
      )

      const { fetchConfig, error } = await loadComposable()
      await fetchConfig()

      expect(error.value).toBe('Unable to load signup configuration')
    })

    it('reports a network failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
      )

      const { fetchConfig, error } = await loadComposable()
      await fetchConfig()

      expect(error.value).toBe('Unable to load signup configuration')
    })

    it('reports a missing worker URL without calling fetch', async () => {
      vi.stubEnv('VITE_SIGNUP_WORKER_URL', '')
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const { fetchConfig, error } = await loadComposable()
      await fetchConfig()

      expect(fetchMock).not.toHaveBeenCalled()
      expect(error.value).toBe('Signups are not configured for this environment')
    })
  })

  describe('fetchSubmissions', () => {
    it('stores submissions and toggles loading', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(jsonResponse([{ discordId: '1', characterName: 'Aztec' }]))),
      )

      const { fetchSubmissions, submissions, loading } = await loadComposable()
      const pending = fetchSubmissions()
      expect(loading.value).toBe(true)
      await pending

      expect(submissions.value).toEqual([{ discordId: '1', characterName: 'Aztec' }])
      expect(loading.value).toBe(false)
    })

    it('reports the worker error field on a non-ok response and stops loading', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(jsonResponse({ error: 'Rate limited' }, { ok: false, status: 429 })),
        ),
      )

      const { fetchSubmissions, submissions, loading, error } = await loadComposable()
      await fetchSubmissions()

      expect(error.value).toBe('Rate limited')
      expect(submissions.value).toEqual([])
      expect(loading.value).toBe(false)
    })

    it('falls back to a generic message when the error body is unreadable', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(unparseableResponse({ status: 502 }))),
      )

      const { fetchSubmissions, error } = await loadComposable()
      await fetchSubmissions()

      expect(error.value).toBe('Unable to load submissions')
    })
  })

  describe('submitSignup', () => {
    it('PUTs the signup with the bearer token and refetches on success', async () => {
      const { store } = stubStorage()
      const token = makeToken({ sub: '1', username: 'kaank', exp: futureExp() })
      store.set(TOKEN_KEY, token)
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ ok: true }))
        .mockResolvedValueOnce(jsonResponse([{ discordId: '1', characterName: 'Aztec' }]))
      vi.stubGlobal('fetch', fetchMock)

      const { submitSignup, submissions, error } = await loadComposable()
      await submitSignup({ characterName: 'Aztec', className: 'Warlock', specName: 'Demonology' })

      expect(fetchMock).toHaveBeenCalledWith(`${WORKER_URL}/api/submissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterName: 'Aztec',
          className: 'Warlock',
          specName: 'Demonology',
        }),
      })
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(submissions.value).toEqual([{ discordId: '1', characterName: 'Aztec' }])
      expect(error.value).toBeNull()
    })

    it('omits the Authorization header when nothing is stored', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
      vi.stubGlobal('fetch', fetchMock)

      const { submitSignup } = await loadComposable()
      await submitSignup({ characterName: 'Aztec', className: 'Warlock', specName: 'Demonology' })

      expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json' })
    })

    it('clears the session and reports an expired session on 401', async () => {
      const { store } = stubStorage()
      store.set(TOKEN_KEY, makeToken({ sub: '1', username: 'x', exp: futureExp() }))
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse({ error: 'Bad token' }, { ok: false, status: 401 }))
      vi.stubGlobal('fetch', fetchMock)

      const { submitSignup, currentUser, error } = await loadComposable()
      expect(currentUser.value).not.toBeNull()

      await submitSignup({ characterName: 'Aztec', className: 'Warlock', specName: 'Demonology' })

      expect(error.value).toBe('Session expired, please sign in again')
      expect(currentUser.value).toBeNull()
      expect(store.has(TOKEN_KEY)).toBe(false)
      // No refetch after a rejected write.
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('reports the worker error field on other failures', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(
            jsonResponse({ error: 'Signups are closed' }, { ok: false, status: 403 }),
          ),
      )

      const { submitSignup, currentUser, error } = await loadComposable()
      await submitSignup({ characterName: 'Aztec', className: 'Warlock', specName: 'Demonology' })

      expect(error.value).toBe('Signups are closed')
      expect(currentUser.value).toBeNull()
    })

    it('reports a network failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
      )

      const { submitSignup, error } = await loadComposable()
      await submitSignup({ characterName: 'Aztec', className: 'Warlock', specName: 'Demonology' })

      expect(error.value).toBe('Failed to submit signup')
    })
  })

  describe('deleteSignup', () => {
    it('encodes a given discordId into the query string', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ ok: true }))
        .mockResolvedValueOnce(jsonResponse([]))
      vi.stubGlobal('fetch', fetchMock)

      const { deleteSignup } = await loadComposable()
      await deleteSignup('12 34&56')

      expect(fetchMock.mock.calls[0][0]).toBe(
        `${WORKER_URL}/api/submissions?discordId=12%2034%2656`,
      )
      expect(fetchMock.mock.calls[0][1].method).toBe('DELETE')
    })

    it('omits the query entirely when no discordId is given', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ ok: true }))
        .mockResolvedValueOnce(jsonResponse([]))
      vi.stubGlobal('fetch', fetchMock)

      const { deleteSignup, submissions } = await loadComposable()
      await deleteSignup()

      expect(fetchMock.mock.calls[0][0]).toBe(`${WORKER_URL}/api/submissions`)
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(submissions.value).toEqual([])
    })

    it('clears the session and reports an expired session on 401', async () => {
      const { store } = stubStorage()
      store.set(TOKEN_KEY, makeToken({ sub: '1', username: 'x', exp: futureExp() }))
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, { ok: false, status: 401 }))
      vi.stubGlobal('fetch', fetchMock)

      const { deleteSignup, currentUser, error } = await loadComposable()
      await deleteSignup()

      expect(error.value).toBe('Session expired, please sign in again')
      expect(currentUser.value).toBeNull()
      expect(store.has(TOKEN_KEY)).toBe(false)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('falls back to a generic message on other failures', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(unparseableResponse({ status: 500 })))

      const { deleteSignup, error } = await loadComposable()
      await deleteSignup()

      expect(error.value).toBe('Failed to remove signup')
    })
  })

  describe('derived state', () => {
    it('matches existingSubmission to the signed-in user', async () => {
      const { store } = stubStorage()
      store.set(TOKEN_KEY, makeToken({ sub: '4242', username: 'kaank', exp: futureExp() }))
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          jsonResponse([
            { discordId: '1', characterName: 'Other' },
            { discordId: '4242', characterName: 'Aztec' },
          ]),
        ),
      )

      const { fetchSubmissions, existingSubmission, signOut } = await loadComposable()
      await fetchSubmissions()

      expect(existingSubmission.value).toEqual({ discordId: '4242', characterName: 'Aztec' })

      signOut()
      expect(existingSubmission.value).toBeNull()
    })

    it('builds the Discord auth URL from the worker URL', async () => {
      const { getDiscordAuthUrl } = await loadComposable()
      expect(getDiscordAuthUrl()).toBe(`${WORKER_URL}/auth/discord`)
    })
  })
})
