#!/usr/bin/env node
// PreToolUse hook: block hand-edits to the JSON files scripts/fetch-*.js write
// on the 30-minute fetch-data.yml cron. A manual edit gets overwritten by the
// next run, and is likely to break the byte-identical-output invariant those
// scripts rely on (stable sort order, carried-over lastUpdated) — see
// CLAUDE.md's "fetchers must produce byte-identical output" note.
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

const GENERATED_BY = new Map([
  ['wcl-progression.json', 'scripts/fetch-wcl-data.js'],
  ['rio-mythicplus.json', 'scripts/fetch-rio-data.js'],
  ['wcl-stats.json', 'scripts/fetch-wcl-stats.js'],
])

let input
try {
  input = JSON.parse(readFileSync(0, 'utf-8'))
} catch {
  process.exit(0)
}

const filePath = input?.tool_input?.file_path || ''
const generator = GENERATED_BY.get(basename(filePath))

if (generator && filePath.includes('src/data/')) {
  console.error(
    `Blocked: ${basename(filePath)} is written by ${generator} on a 30-minute cron; a manual edit ` +
      `gets overwritten on the next run and risks breaking that script's deterministic-output guarantee. ` +
      `Edit ${generator} instead, or run \`npm run fetch-data\` to regenerate this file.`,
  )
  process.exit(2)
}

process.exit(0)
