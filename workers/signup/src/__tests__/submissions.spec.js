import { describe, it, expect, beforeEach } from 'vitest'
import worker from '../index.js'

const TIER = 'tier-1'
const JWT_SECRET = 'test-secret'
const FRONTEND_URL = 'https://aztecs.se'
const ADMIN_ID = '900'

/**
 * In-memory stand-in for a KV namespace. `put`/`get`/`delete`/`list` cover the
 * surface the worker uses, including per-key metadata.
 */
function fakeKv(initial = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, { value: v, metadata: null }]))
  /** @type {Array<{ op: string, key: string }>} */
  const ops = []
  return {
    store,
    ops,
    async get(key, type) {
      ops.push({ op: 'get', key })
      const entry = store.get(key)
      if (!entry) return null
      return type === 'json' ? JSON.parse(entry.value) : entry.value
    },
    async put(key, value, options = {}) {
      ops.push({ op: 'put', key })
      store.set(key, { value, metadata: options.metadata ?? null })
    },
    async delete(key) {
      ops.push({ op: 'delete', key })
      store.delete(key)
    },
    async list({ prefix = '' } = {}) {
      const keys = [...store.entries()]
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, entry]) => ({ name, metadata: entry.metadata }))
      return { keys, list_complete: true, cursor: undefined }
    },
  }
}

function makeEnv(kv) {
  return {
    SIGNUPS: kv,
    JWT_SECRET,
    FRONTEND_URL,
    ADMIN_DISCORD_IDS: ADMIN_ID,
    ADMIN_SECRET: 'admin-secret',
    DISCORD_CLIENT_ID: 'id',
    DISCORD_CLIENT_SECRET: 'secret',
  }
}

function base64url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Mirrors createJwt in the worker so requireAuth accepts the token. */
async function makeToken(sub, username = 'member') {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({ sub, username, iat: now, exp: now + 3600 }))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  )
  return `${header}.${payload}.${base64url(sig)}`
}

async function expectedHandle(tierId, discordId) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${tierId}:${discordId}`),
  )
  return base64url(digest).slice(0, 22)
}

function put(token, body) {
  return new Request('https://signup.aztecs.se/api/submissions', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function del(token, query = '') {
  return new Request(`https://signup.aztecs.se/api/submissions${query}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

const get = () => new Request('https://signup.aztecs.se/api/submissions')

const signup = (characterName, className = 'mage', specName = 'fire') => ({
  characterName,
  className,
  specName,
})

const OPEN_CONFIG = JSON.stringify({ currentTierId: TIER, tierName: 'Tier 1', isOpen: true })

describe('signup worker submissions', () => {
  let kv
  let env

  beforeEach(() => {
    kv = fakeKv({ 'config:current': OPEN_CONFIG })
    env = makeEnv(kv)
  })

  it('never returns a Discord id to an unauthenticated reader', async () => {
    await worker.fetch(put(await makeToken('111'), signup('Aztecmage')), env)

    const body = await (await worker.fetch(get(), env)).json()

    expect(body).toHaveLength(1)
    expect(body[0]).toEqual({
      handle: await expectedHandle(TIER, '111'),
      discordUsername: 'member',
      characterName: 'Aztecmage',
      className: 'mage',
      specName: 'fire',
      submittedAt: expect.any(String),
      updatedAt: expect.any(String),
    })
    expect(JSON.stringify(body)).not.toContain('111')
  })

  it('writes one member without reading or rewriting another member', async () => {
    // The invariant behind the lost-update fix. Storing a tier as one array
    // meant every signup was a read-modify-write of everyone's data, and KV has
    // no compare-and-set, so overlapping writes dropped one of the two.
    // Asserting the access pattern catches that deterministically, where racing
    // two requests only catches it when the interleaving happens to be unlucky.
    await worker.fetch(put(await makeToken('111', 'ann'), signup('Annmage')), env)

    const ann = await expectedHandle(TIER, '111')
    const bo = await expectedHandle(TIER, '222')
    kv.ops.length = 0

    await worker.fetch(put(await makeToken('222', 'bo'), signup('Bomage')), env)

    const touched = kv.ops.filter((o) => o.key.startsWith(`tier:${TIER}`))
    expect(touched.every((o) => o.key === `tier:${TIER}:${bo}`)).toBe(true)
    expect(touched.some((o) => o.key === `tier:${TIER}:${ann}`)).toBe(false)
    expect(touched.some((o) => o.key === `tier:${TIER}`)).toBe(false)
    expect(touched.filter((o) => o.op === 'put')).toHaveLength(1)
  })

  it('keeps both signups when two members write concurrently', async () => {
    const [a, b] = await Promise.all([makeToken('111', 'ann'), makeToken('222', 'bo')])

    await Promise.all([
      worker.fetch(put(a, signup('Annmage')), env),
      worker.fetch(put(b, signup('Bodk', 'deathKnight', 'frost')), env),
    ])

    const body = await (await worker.fetch(get(), env)).json()
    expect(body.map((s) => s.characterName).sort()).toEqual(['Annmage', 'Bodk'])
  })

  it('updates a signup in place and preserves submittedAt', async () => {
    const token = await makeToken('111')
    const first = await (await worker.fetch(put(token, signup('Aztecmage')), env)).json()
    const second = await (
      await worker.fetch(put(token, signup('Aztecpriest', 'priest', 'holy')), env)
    ).json()

    const body = await (await worker.fetch(get(), env)).json()
    expect(body).toHaveLength(1)
    expect(second.submittedAt).toBe(first.submittedAt)
    expect(body[0].characterName).toBe('Aztecpriest')
  })

  it('lets a member remove only their own signup', async () => {
    const [a, b] = await Promise.all([makeToken('111'), makeToken('222')])
    await worker.fetch(put(a, signup('Annmage')), env)
    await worker.fetch(put(b, signup('Bomage')), env)

    const theirHandle = await expectedHandle(TIER, '222')
    const forbidden = await worker.fetch(del(a, `?handle=${theirHandle}`), env)
    expect(forbidden.status).toBe(403)

    await worker.fetch(del(a), env)
    const body = await (await worker.fetch(get(), env)).json()
    expect(body.map((s) => s.characterName)).toEqual(['Bomage'])
  })

  it('lets an admin remove someone else by handle', async () => {
    const [member, admin] = await Promise.all([makeToken('111'), makeToken(ADMIN_ID, 'officer')])
    await worker.fetch(put(member, signup('Annmage')), env)

    const handle = await expectedHandle(TIER, '111')
    const res = await worker.fetch(del(admin, `?handle=${handle}`), env)

    expect(res.status).toBe(200)
    expect(await (await worker.fetch(get(), env)).json()).toEqual([])
  })

  it('migrates a tier stored as a single array and then serves it per key', async () => {
    await kv.put(
      `tier:${TIER}`,
      JSON.stringify([
        {
          discordId: '111',
          discordUsername: 'ann',
          characterName: 'Annmage',
          className: 'mage',
          specName: 'fire',
          submittedAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )

    // Readable before any write triggers the migration.
    const before = await (await worker.fetch(get(), env)).json()
    expect(before.map((s) => s.characterName)).toEqual(['Annmage'])
    expect(before[0].handle).toBe(await expectedHandle(TIER, '111'))

    await worker.fetch(put(await makeToken('222', 'bo'), signup('Bomage')), env)

    expect(kv.store.has(`tier:${TIER}`)).toBe(false)
    expect(kv.store.has(`tier:${TIER}:${await expectedHandle(TIER, '111')}`)).toBe(true)

    const after = await (await worker.fetch(get(), env)).json()
    expect(after.map((s) => s.characterName).sort()).toEqual(['Annmage', 'Bomage'])
    expect(after.find((s) => s.characterName === 'Annmage').submittedAt).toBe(
      '2026-01-01T00:00:00.000Z',
    )
  })

  it('rejects a write when signups are closed', async () => {
    await kv.put('config:current', JSON.stringify({ currentTierId: TIER, isOpen: false }))
    const res = await worker.fetch(put(await makeToken('111'), signup('Aztecmage')), env)
    expect(res.status).toBe(403)
  })

  it('rejects an invalid character name and an unknown class', async () => {
    const token = await makeToken('111')
    expect((await worker.fetch(put(token, signup('X')), env)).status).toBe(400)
    expect((await worker.fetch(put(token, signup('Aztecmage', 'bard')), env)).status).toBe(400)
    expect(await (await worker.fetch(get(), env)).json()).toEqual([])
  })

  it('rejects an unsigned token', async () => {
    const forged = `${base64url('{}')}.${base64url(JSON.stringify({ sub: '111' }))}.nope`
    expect((await worker.fetch(put(forged, signup('Aztecmage')), env)).status).toBe(401)
  })
})
