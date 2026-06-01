const CONFIG_KEY = 'config:current'

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
        return await handleDiscordCallback(url, env)
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
    } catch {
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

  return new Response(null, {
    status: 302,
    headers: { Location: discordUrl.toString() },
  })
}

async function handleDiscordCallback(url, env) {
  const code = url.searchParams.get('code')
  if (!code) {
    return Response.redirect(`${env.FRONTEND_URL}/next-tier#error=missing_code`, 302)
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
    return Response.redirect(`${env.FRONTEND_URL}/next-tier#error=token_exchange_failed`, 302)
  }

  const tokenData = await tokenRes.json()
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) {
    return Response.redirect(`${env.FRONTEND_URL}/next-tier#error=user_fetch_failed`, 302)
  }

  const user = await userRes.json()
  const jwt = await createJwt(
    { sub: user.id, username: user.username, isAdmin: isAdminUser(user.id, env) },
    env.JWT_SECRET,
  )

  return Response.redirect(`${env.FRONTEND_URL}/next-tier#token=${jwt}`, 302)
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
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
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
  if (!body?.characterName || !body?.className || !body?.specName) {
    return corsResponse(env.FRONTEND_URL, 400, {
      error: 'characterName, className, and specName are required',
    })
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
