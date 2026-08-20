import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a `WOW_CLASSES` key into the kebab-case CSS class that carries the
 * class colour (`deathKnight` -> `death-knight`).
 * @param {string} classKey
 * @returns {string}
 */
export function toClassColorCss(classKey) {
  return classKey.replace(/([A-Z])/g, '-$1').toLowerCase()
}
