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
    bosses: [{ name: 'Chimaerus, the Undreamt God', normal: false, heroic: false }],
  },
  {
    name: 'The Voidspire',
    bosses: [
      { name: 'Imperator Averzian', normal: false, heroic: false },
      { name: 'Vorasius', normal: false, heroic: false },
      { name: 'Fallen-King Salhadaar', normal: false, heroic: false },
      { name: 'Vaelgor & Ezzorak', normal: false, heroic: false },
      { name: 'Lightblinded Vanguard', normal: false, heroic: false },
      { name: 'Crown of the Cosmos', normal: false, heroic: false },
    ],
  },
  {
    name: "March on Quel'Danas",
    bosses: [
      { name: "Belo'ren", normal: false, heroic: false },
      { name: 'Midnight Falls', normal: false, heroic: false },
    ],
  },
]

/** @param {boolean} killed @returns {string} */
export function killMark(killed) {
  return killed ? '💀' : '-'
}
