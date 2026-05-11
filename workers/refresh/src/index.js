const ALLOWED_ORIGIN = 'https://aztecs.se'
const REPO = 'kaankaraoglu/aztecs.github.io'
const WORKFLOW_FILE = 'fetch-data.yml'
const RATE_LIMIT_KEY = 'last-refresh'
const RATE_LIMIT_SECONDS = 600

export default {
  /**
   * @param {Request} request
   * @param {{ GITHUB_TOKEN: string, TURNSTILE_SECRET: string, RATE_LIMIT: KVNamespace }} env
   */
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsResponse(204)
    }

    if (request.method !== 'POST') {
      return corsResponse(405, { error: 'Method not allowed' })
    }

    const origin = request.headers.get('Origin')
    if (origin !== ALLOWED_ORIGIN) {
      return corsResponse(403, { error: 'Forbidden' })
    }

    const body = await request.json().catch(() => null)
    if (!body?.turnstileToken) {
      return corsResponse(400, { error: 'Missing turnstile token' })
    }

    const turnstileValid = await verifyTurnstile(body.turnstileToken, env.TURNSTILE_SECRET, request)
    if (!turnstileValid) {
      return corsResponse(403, { error: 'Turnstile verification failed' })
    }

    const lastRefresh = await env.RATE_LIMIT.get(RATE_LIMIT_KEY)
    if (lastRefresh) {
      const elapsed = (Date.now() - Number(lastRefresh)) / 1000
      if (elapsed < RATE_LIMIT_SECONDS) {
        const retryAfter = Math.ceil(RATE_LIMIT_SECONDS - elapsed)
        return corsResponse(429, { error: 'Rate limited', retryAfter })
      }
    }

    const dispatchResult = await dispatchWorkflow(env.GITHUB_TOKEN)
    if (!dispatchResult.ok) {
      return corsResponse(502, { error: 'Failed to dispatch workflow' })
    }

    await env.RATE_LIMIT.put(RATE_LIMIT_KEY, String(Date.now()), {
      expirationTtl: RATE_LIMIT_SECONDS,
    })

    return corsResponse(200, {
      message: 'Refresh triggered',
      actionsUrl: `https://github.com/${REPO}/actions/workflows/${WORKFLOW_FILE}`,
    })
  },
}

/**
 * @param {string} token
 * @param {string} secret
 * @param {Request} request
 * @returns {Promise<boolean>}
 */
async function verifyTurnstile(token, secret, request) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: request.headers.get('CF-Connecting-IP') || '',
    }),
  })
  const result = await response.json()
  return result.success === true
}

/**
 * @param {string} token
 * @returns {Promise<Response>}
 */
async function dispatchWorkflow(token) {
  return fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'aztecs-refresh-worker',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main' }),
    },
  )
}

/**
 * @param {number} status
 * @param {Record<string, unknown>} [body]
 * @returns {Response}
 */
function corsResponse(status, body) {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
