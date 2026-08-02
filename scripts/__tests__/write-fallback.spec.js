import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeFallback } from '../write-fallback.js'

const EMPTY = { zone: null, raids: [], summary: { total: 0 } }
const REAL = { zone: 'Sporefall', raids: [{ name: 'Rotmire' }], summary: { total: 1 } }

describe('writeFallback', () => {
  let dir
  let outputPath

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'write-fallback-'))
    outputPath = join(dir, 'wcl-progression.json')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('keeps previously fetched data instead of blanking it', () => {
    writeFileSync(outputPath, JSON.stringify(REAL, null, 2) + '\n')

    writeFallback(outputPath, EMPTY, '[wcl]', 'No credentials')

    expect(JSON.parse(readFileSync(outputPath, 'utf-8'))).toEqual(REAL)
  })

  it('writes empty output when no file exists yet', () => {
    writeFallback(outputPath, EMPTY, '[wcl]', 'No credentials')

    expect(JSON.parse(readFileSync(outputPath, 'utf-8'))).toEqual(EMPTY)
  })

  it('replaces a corrupt file rather than keeping it', () => {
    writeFileSync(outputPath, '{"zone": "trunca')

    writeFallback(outputPath, EMPTY, '[wcl]', 'No credentials')

    expect(JSON.parse(readFileSync(outputPath, 'utf-8'))).toEqual(EMPTY)
  })

  it('does not create a file in a missing directory tree', () => {
    const nested = join(dir, 'absent', 'wcl-progression.json')

    expect(() => writeFallback(nested, EMPTY, '[wcl]', 'No credentials')).toThrow()
    expect(existsSync(nested)).toBe(false)
  })

  it('reports which file it kept', () => {
    writeFileSync(outputPath, JSON.stringify(REAL, null, 2) + '\n')

    writeFallback(outputPath, EMPTY, '[wcl]', 'No credentials')

    expect(console.warn).toHaveBeenCalledWith(
      '[wcl] No credentials, keeping existing wcl-progression.json',
    )
  })

  it('preserves data for every fetcher output shape', () => {
    const cases = [
      ['rio-mythicplus.json', { season: null, topRunners: [], dungeonBests: [] }],
      ['wcl-stats.json', { stats: {}, lastUpdated: null }],
    ]

    for (const [name, empty] of cases) {
      const path = join(dir, name)
      writeFileSync(path, JSON.stringify(REAL, null, 2) + '\n')

      writeFallback(path, empty, '[test]', 'Failed to fetch')

      expect(JSON.parse(readFileSync(path, 'utf-8'))).toEqual(REAL)
    }
  })
})

describe('write-fallback directory setup', () => {
  it('writes into an existing directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'write-fallback-nested-'))
    const sub = join(dir, 'data')
    mkdirSync(sub)
    const path = join(sub, 'wcl-stats.json')

    writeFallback(path, EMPTY, '[wcl-stats]', 'No credentials')

    expect(JSON.parse(readFileSync(path, 'utf-8'))).toEqual(EMPTY)
    rmSync(dir, { recursive: true, force: true })
  })
})
