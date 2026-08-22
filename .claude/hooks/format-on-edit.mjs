#!/usr/bin/env node
// PostToolUse hook: format + lint a file right after Claude edits it, instead
// of waiting for the pre-commit lint-staged pass to catch it.
//
// Mirrors the lint-staged glob in package.json for prettier, and eslint's own
// `files` glob in eslint.config.js (only js/mjs/vue) for eslint --fix.
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { execFileSync } from 'node:child_process'

const PRETTIER_EXTS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.vue',
  '.scss',
  '.css',
  '.md',
  '.json',
  '.yml',
  '.yaml',
])
const ESLINT_EXTS = new Set(['.js', '.mjs', '.vue'])

let input
try {
  input = JSON.parse(readFileSync(0, 'utf-8'))
} catch {
  process.exit(0)
}

const filePath = input?.tool_input?.file_path
const ext = filePath ? extname(filePath) : ''
if (!filePath || !PRETTIER_EXTS.has(ext)) process.exit(0)

try {
  execFileSync('npx', ['prettier', '--write', filePath], { stdio: 'ignore' })
} catch {
  // Non-blocking: CI's format:check and lint:check are the real gates.
}

if (ESLINT_EXTS.has(ext)) {
  try {
    execFileSync('npx', ['eslint', '--fix', filePath], { stdio: 'ignore' })
  } catch {
    // eslint --fix exits non-zero when unfixable warnings remain; that's fine.
  }
}

process.exit(0)
