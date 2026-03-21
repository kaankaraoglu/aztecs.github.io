/**
 * @typedef {{
 *   tier: string,
 *   expansion: string,
 *   season?: string,
 *   dates: { start: string, end?: string },
 *   bosses: number,
 *   progress: string,
 *   notable?: string,
 * }} TierEntry
 */

/** @type {TierEntry[]} */
export const tierHistory = [
  {
    tier: 'Manaforge Omega',
    expansion: 'The War Within',
    season: 'Season 2',
    dates: { start: '2025-09-02' },
    bosses: 8,
    progress: '8/8 Heroic',
    notable: 'AOTC + Glory of the Omega Raider',
  },
  {
    tier: 'Liberation of Undermine',
    expansion: 'The War Within',
    season: 'Season 1',
    dates: { start: '2025-03-04', end: '2025-09-01' },
    bosses: 8,
    progress: '8/8 Heroic',
    notable: 'AOTC + Glory of the Liberation Raider',
  },
  {
    tier: 'Ulduar',
    expansion: 'Wrath of the Lich King',
    dates: { start: '2009-04-14' },
    bosses: 14,
    progress: '14/14 Normal',
    notable: 'Yogg-Saron killed',
  },
  {
    tier: 'Obsidian Sanctum',
    expansion: 'Wrath of the Lich King',
    dates: { start: '2008-11-13' },
    bosses: 1,
    progress: '1/1 Normal',
  },
]
