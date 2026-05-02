// Centralized current tier progression data
// Each raid has its own name and boss list

/**
 * @typedef {{ name: string, normal: boolean, heroic: boolean }} Boss
 * @typedef {{ name: string, bosses: Boss[] }} Raid
 */

/** @type {Raid[]} */
export const raids = [
  {
    name: 'The Dreamrift',
    bosses: [
      {
        name: 'Chimaerus, the Undreamt God',
        normal: true,
        heroic: false,
        pullsByDifficulty: { normal: 23 },
        bestPercent: 45.2,
        killedAt: '2026-02-10',
        roster: {
          tanks: [
            { name: 'Kaank', class: 'warrior', spec: 'Protection' },
            { name: 'Rhys', class: 'paladin', spec: 'Protection' },
          ],
          healers: [
            { name: 'Nilay', class: 'priest', spec: 'Holy' },
            { name: 'Delmos', class: 'druid', spec: 'Restoration' },
          ],
          dps: [
            { name: 'Mxk', class: 'death-knight', spec: 'Frost' },
            { name: 'Zarthax', class: 'mage', spec: 'Fire' },
            { name: 'Grimbold', class: 'hunter', spec: 'Marksmanship' },
          ],
        },
      },
    ],
  },
  {
    name: 'The Voidspire',
    bosses: [
      {
        name: 'Imperator Averzian',
        normal: true,
        heroic: true,
        pullsByDifficulty: { normal: 4, heroic: 12 },
        killedAt: '2026-01-15',
        roster: {
          tanks: [{ name: 'Kaank', class: 'warrior', spec: 'Protection' }],
          healers: [{ name: 'Nilay', class: 'priest', spec: 'Holy' }],
          dps: [
            { name: 'Mxk', class: 'death-knight', spec: 'Frost' },
            { name: 'Zarthax', class: 'mage', spec: 'Fire' },
          ],
        },
      },
      {
        name: 'Vorasius',
        normal: true,
        heroic: true,
        pullsByDifficulty: { normal: 3, heroic: 8 },
        killedAt: '2026-01-22',
      },
      {
        name: 'Fallen-King Salhadaar',
        normal: true,
        heroic: true,
        pullsByDifficulty: { normal: 11, heroic: 34 },
        killedAt: '2026-02-05',
      },
      {
        name: 'Vaelgor & Ezzorak',
        normal: true,
        heroic: false,
        pullsByDifficulty: { normal: 15 },
        killedAt: '2026-02-12',
      },
      {
        name: 'Lightblinded Vanguard',
        normal: true,
        heroic: false,
        pullsByDifficulty: { normal: 6 },
        killedAt: '2026-02-19',
      },
      {
        name: 'Crown of the Cosmos',
        normal: false,
        heroic: false,
        bestPercent: 62.3,
        pullsByDifficulty: { normal: 47 },
      },
    ],
  },
  {
    name: "March on Quel'Danas",
    bosses: [
      {
        name: "Belo'ren",
        normal: true,
        heroic: true,
        pullsByDifficulty: { normal: 2, heroic: 5 },
        killedAt: '2026-01-10',
      },
      {
        name: 'Midnight Falls',
        normal: true,
        heroic: false,
        pullsByDifficulty: { normal: 18 },
        killedAt: '2026-01-28',
      },
    ],
  },
]

/** @param {boolean} killed @returns {string} */
export function killMark(killed) {
  return killed ? '💀' : '-'
}
