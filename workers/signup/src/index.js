const CONFIG_KEY = 'config:current'
const STATE_COOKIE = 'aztecs_oauth_state'
/** OAuth round-trip window. Long enough for a Discord login, short enough to be useless later. */
const STATE_TTL_SECONDS = 600

/** WoW character names: 2-12 letters, including the accented ones the realm allows. */
const CHARACTER_NAME_PATTERN = /^[\p{L}]{2,12}$/u

/** Class keys the signup form can send. Anything else is a malformed or hand-rolled request. */
const ALLOWED_CLASSES = new Set([
  'deathKnight',
  'demonHunter',
  'druid',
  'evoker',
  'hunter',
  'mage',
  'monk',
  'paladin',
  'priest',
  'rogue',
  'shaman',
  'warlock',
  'warrior',
])

const MAX_SPEC_NAME_LENGTH = 32

export default {
  /**
   * @param {Request} request
   * @param {{
   *   SIGNUPS: KVNamespace,
   *   DISCORD_CLIENT_ID: string,
   *   DISCORD_CLIENT_SECRET: string,
   *   JWT_SECRET: string,
   *   ADMIN_SECRET: string,
   *   ADMIN_DISCORD_IDS: string,
   *   FRONTEND_URL: string
   * }} env
   */
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    if (method === 'OPTIONS') {
      return corsResponse(env.FRONTEND_URL, 204)
    }

    try {
      if (path === '/auth/discord' && method === 'GET') {
        return handleDiscordRedirect(url, env)
      }
      if (path === '/auth/discord/callback' && method === 'GET') {
        return await handleDiscordCallback(url, env, request)
      }
      if (path === '/api/config' && method === 'GET') {
        return await handleGetConfig(env)
      }
      if (path === '/api/admin/config' && method === 'PUT') {
        return await handleAdminConfig(request, env)
      }
      if (path === '/api/submissions' && method === 'GET') {
        return await handleGetSubmissions(env)
      }
      if (path === '/api/submissions' && method === 'PUT') {
        return await handlePutSubmission(request, env)
      }
      if (path === '/api/submissions' && method === 'DELETE') {
        return await handleDeleteSubmission(request, env)
      }

      return corsResponse(env.FRONTEND_URL, 404, { error: 'Not found' })
    } catch (err) {
      // Surfaces in `wrangler tail`; the client still gets a generic message.
      console.error(`[signup] ${method} ${path} failed: ${err?.stack || err}`)
      return corsResponse(env.FRONTEND_URL, 500, { error: 'Internal server error' })
    }
  },
}

// --- Discord OAuth ---

function handleDiscordRedirect(url, env) {
  const state = crypto.randomUUID()
  const redirectUri = `${url.origin}/auth/discord/callback`
  const discordUrl = new URL('https://discord.com/api/oauth2/authorize')
  discordUrl.searchParams.set('client_id', env.DISCORD_CLIENT_ID)
  discordUrl.searchParams.set('redirect_uri', redirectUri)
  discordUrl.searchParams.set('response_type', 'code')
  discordUrl.searchParams.set('scope', 'identify')
  discordUrl.searchParams.set('state', state)

  // The callback comes back to this same origin as a top-level GET, so a
  // first-party SameSite=Lax cookie survives the Discord round trip. Without
  // it the `state` we send is never checked, and an attacker can complete the
  // flow with their own code and sign the victim into the attacker's account.
  return new Response(null, {
    status: 302,
    headers: {
      Location: discordUrl.toString(),
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=${STATE_TTL_SECONDS}`,
    },
  })
}

/**
 * Reads one cookie from a request's Cookie header.
 * @param {Request} request
 * @param {string} name
 * @returns {string | null}
 */
function readCookie(request, name) {
  const header = request.headers.get('Cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return null
}

/** Clears the state cookie once the round trip is over, successfully or not. */
const CLEAR_STATE_COOKIE = `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=0`

/**
 * @param {string} location
 * @returns {Response}
 */
function redirectClearingState(location) {
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'Set-Cookie': CLEAR_STATE_COOKIE },
  })
}

async function handleDiscordCallback(url, env, request) {
  const code = url.searchParams.get('code')
  if (!code) {
    return redirectClearingState(`${env.FRONTEND_URL}/next-tier#error=missing_code`)
  }

  const expectedState = readCookie(request, STATE_COOKIE)
  const receivedState = url.searchParams.get('state')
  if (!expectedState || !receivedState || !timingSafeEqual(expectedState, receivedState)) {
    return redirectClearingState(`${env.FRONTEND_URL}/next-tier#error=invalid_state`)
  }

  const redirectUri = `${url.origin}/auth/discord/callback`

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    return redirectClearingState(`${env.FRONTEND_URL}/next-tier#error=token_exchange_failed`)
  }

  const tokenData = await tokenRes.json()
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) {
    return redirectClearingState(`${env.FRONTEND_URL}/next-tier#error=user_fetch_failed`)
  }

  const user = await userRes.json()
  const jwt = await createJwt(
    { sub: user.id, username: user.username, isAdmin: isAdminUser(user.id, env) },
    env.JWT_SECRET,
  )

  return redirectClearingState(`${env.FRONTEND_URL}/next-tier#token=${jwt}`)
}

// --- JWT ---

async function createJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + 86400 }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(fullPayload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  const encodedSignature = base64url(signature)

  return `${signingInput}.${encodedSignature}`
}

async function verifyJwt(token, secret) {
  try {
    return await verifyJwtUnsafe(token, secret)
  } catch {
    // Malformed base64 or JSON in a hand-crafted token: not authenticated,
    // not a server error.
    return null
  }
}

async function verifyJwtUnsafe(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  const signatureBytes = base64urlDecode(encodedSignature)
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    new TextEncoder().encode(signingInput),
  )

  if (!valid) return null

  const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')))
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

  return payload
}

function base64url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Constant-time string comparison. Both values are compared over the length of
 * the longer one so an early mismatch does not return faster.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
  const length = Math.max(a.length, b.length)
  let mismatch = a.length ^ b.length
  for (let i = 0; i < length; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return mismatch === 0
}

function base64urlDecode(str) {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4)
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function requireAuth(request, secret) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyJwt(authHeader.slice(7), secret)
}

/**
 * Whether a Discord user id is in the admin allowlist.
 * `ADMIN_DISCORD_IDS` is a comma-separated list of Discord user ids.
 */
function isAdminUser(discordId, env) {
  if (!discordId || !env.ADMIN_DISCORD_IDS) return false
  return env.ADMIN_DISCORD_IDS.split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(discordId)
}

// --- Config ---

async function handleGetConfig(env) {
  const config = await env.SIGNUPS.get(CONFIG_KEY, 'json')
  if (!config) {
    return corsResponse(env.FRONTEND_URL, 200, {
      currentTierId: null,
      tierName: null,
      isOpen: false,
    })
  }
  return corsResponse(env.FRONTEND_URL, 200, config)
}

async function handleAdminConfig(request, env) {
  // Without this guard an unset ADMIN_SECRET makes the literal header
  // "Bearer undefined" a valid credential.
  if (!env.ADMIN_SECRET) {
    console.error('[signup] ADMIN_SECRET is not configured; refusing admin config write')
    return corsResponse(env.FRONTEND_URL, 503, { error: 'Admin endpoint not configured' })
  }

  const authHeader = request.headers.get('Authorization') ?? ''
  if (!timingSafeEqual(authHeader, `Bearer ${env.ADMIN_SECRET}`)) {
    return corsResponse(env.FRONTEND_URL, 401, { error: 'Unauthorized' })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return corsResponse(env.FRONTEND_URL, 400, { error: 'Invalid JSON' })
  }

  const config = {
    currentTierId: body.currentTierId ?? null,
    tierName: body.tierName ?? null,
    isOpen: body.isOpen ?? false,
  }

  await env.SIGNUPS.put(CONFIG_KEY, JSON.stringify(config))
  return corsResponse(env.FRONTEND_URL, 200, config)
}

// --- Submissions ---

/**
 * Validates a signup body server-side. The form already checks these, but the
 * endpoint is reachable with any Bearer token and writes straight to a shared
 * KV value, so an oversized or wrong-typed field would land in every reader's
 * response.
 * @param {any} body
 * @returns {string | null} error message, or null when the body is acceptable
 */
function validateSubmission(body) {
  if (!body || typeof body !== 'object') return 'Invalid JSON body'

  const { characterName, className, specName } = body
  if (typeof characterName !== 'string' || typeof className !== 'string') {
    return 'characterName, className, and specName are required'
  }
  if (typeof specName !== 'string') {
    return 'characterName, className, and specName are required'
  }
  if (!CHARACTER_NAME_PATTERN.test(characterName.trim())) {
    return 'characterName must be 2-12 letters'
  }
  if (!ALLOWED_CLASSES.has(className)) return 'Unknown className'
  if (specName.length === 0 || specName.length > MAX_SPEC_NAME_LENGTH) {
    return 'Invalid specName'
  }
  return null
}

async function getCurrentTierId(env) {
  const config = await env.SIGNUPS.get(CONFIG_KEY, 'json')
  return config?.currentTierId ?? null
}

async function handleGetSubmissions(env) {
  const tierId = await getCurrentTierId(env)
  if (!tierId) {
    return corsResponse(env.FRONTEND_URL, 200, [])
  }
  const submissions = await env.SIGNUPS.get(`tier:${tierId}`, 'json')
  return corsResponse(env.FRONTEND_URL, 200, submissions ?? [])
}

async function handlePutSubmission(request, env) {
  const user = await requireAuth(request, env.JWT_SECRET)
  if (!user) {
    return corsResponse(env.FRONTEND_URL, 401, { error: 'Unauthorized' })
  }

  const config = await env.SIGNUPS.get(CONFIG_KEY, 'json')
  if (!config?.isOpen) {
    return corsResponse(env.FRONTEND_URL, 403, { error: 'Signups are closed' })
  }

  const body = await request.json().catch(() => null)
  const invalid = validateSubmission(body)
  if (invalid) {
    return corsResponse(env.FRONTEND_URL, 400, { error: invalid })
  }

  const tierId = config.currentTierId
  const submissions = (await env.SIGNUPS.get(`tier:${tierId}`, 'json')) ?? []
  const now = new Date().toISOString()
  const existingIndex = submissions.findIndex((s) => s.discordId === user.sub)

  const submission = {
    discordId: user.sub,
    discordUsername: user.username,
    characterName: body.characterName.trim(),
    className: body.className,
    specName: body.specName,
    submittedAt: existingIndex >= 0 ? submissions[existingIndex].submittedAt : now,
    updatedAt: now,
  }

  if (existingIndex >= 0) {
    submissions[existingIndex] = submission
  } else {
    submissions.push(submission)
  }

  await env.SIGNUPS.put(`tier:${tierId}`, JSON.stringify(submissions))
  return corsResponse(env.FRONTEND_URL, 200, submission)
}

async function handleDeleteSubmission(request, env) {
  const user = await requireAuth(request, env.JWT_SECRET)
  if (!user) {
    return corsResponse(env.FRONTEND_URL, 401, { error: 'Unauthorized' })
  }

  const admin = isAdminUser(user.sub, env)
  const targetId = new URL(request.url).searchParams.get('discordId')

  // Only admins may remove someone else's signup.
  if (targetId && targetId !== user.sub && !admin) {
    return corsResponse(env.FRONTEND_URL, 403, { error: 'Forbidden' })
  }

  // Regular users may only remove their signup while signups are open;
  // admins can remove any signup at any time.
  if (!admin) {
    const config = await env.SIGNUPS.get(CONFIG_KEY, 'json')
    if (!config?.isOpen) {
      return corsResponse(env.FRONTEND_URL, 403, { error: 'Signups are closed' })
    }
  }

  const tierId = await getCurrentTierId(env)
  if (!tierId) {
    return corsResponse(env.FRONTEND_URL, 404, { error: 'No active tier' })
  }

  const removeId = targetId ?? user.sub
  const submissions = (await env.SIGNUPS.get(`tier:${tierId}`, 'json')) ?? []
  const filtered = submissions.filter((s) => s.discordId !== removeId)

  await env.SIGNUPS.put(`tier:${tierId}`, JSON.stringify(filtered))
  return corsResponse(env.FRONTEND_URL, 200, { deleted: true })
}

// --- CORS ---

function corsResponse(frontendUrl, status, body) {
  const headers = {
    'Access-Control-Allow-Origin': frontendUrl,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (!body) {
    return new Response(null, { status, headers })
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}
