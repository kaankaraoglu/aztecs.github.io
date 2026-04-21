// Centralized kill card data similar to progression.js
// Each entry corresponds to a KillCard instance.
// Date format (YYYY-MM-DD HH:mm or YYYY-MM-DD) for display.

/**
 * @typedef {{ name: string, class: string }} RaidMember
 * @typedef {{
 *   raidName: string,
 *   imageUrl: string,
 *   date: string,
 *   attempts?: number,
 *   tanks?: RaidMember[],
 *   healers?: RaidMember[],
 *   dds?: RaidMember[]
 * }} Kill
 */

const killImage = (filename) => new URL(`../assets/images/kills/${filename}`, import.meta.url).href

/** @type {Kill[]} */
export const kills = [
  {
    raidName: 'Voidspire (Heroic)',
    imageUrl: killImage('voidspire_2026_04_12.webp'),
    date: '2026-04-12 21:49',
    tanks: [
      { name: 'Phruity', class: 'druid' },
      { name: 'Agro', class: 'warrior' },
    ],
    healers: [
      { name: 'Blackmaira', class: 'paladin' },
      { name: 'Samáar', class: 'priest' },
      { name: 'Proto', class: 'evoker' },
      { name: 'Éowyn', class: 'druid' },
    ],
    dds: [
      { name: 'Aerioth', class: 'priest' },
      { name: 'Valorite', class: 'death-knight' },
      { name: 'Lilithh', class: 'warlock' },
      { name: 'Frosteyes', class: 'death-knight' },
      { name: 'Babasiru', class: 'evoker' },
      { name: 'Mxk', class: 'warrior' },
      { name: 'Daruni', class: 'druid' },
      { name: 'Synthia', class: 'demon-hunter' },
      { name: 'Aurielle', class: 'paladin' },
      { name: 'Wablahigh', class: 'druid' },
    ],
  },
  {
    raidName: 'Glory of the Omega Raider',
    imageUrl: killImage('glory_of_the_omega_raider_2025_09_21.webp'),
    date: '2025-09-21 21:15',
    tanks: [
      { name: 'Phruity', class: 'druid' },
      { name: 'Peavy', class: 'warrior' },
    ],
    healers: [
      { name: 'Éowyn', class: 'druid' },
      { name: 'Kiyanne', class: 'evoker' },
      { name: 'Samáar', class: 'paladin' },
      { name: 'Edemption', class: 'priest' },
    ],
    dds: [
      { name: 'Wablakin', class: 'shaman' },
      { name: 'Blackmaira', class: 'paladin' },
      { name: 'Synjin', class: 'shaman' },
      { name: 'Skátari', class: 'warlock' },
      { name: 'Mzk', class: 'rogue' },
      { name: 'Aerioth', class: 'priest' },
      { name: 'Snyxx', class: 'mage' },
      { name: 'Frosteyes', class: 'death-knight' },
      { name: 'Valorite', class: 'death-knight' },
      { name: 'Aurielle', class: 'paladin' },
      { name: 'Rhapidfire', class: 'hunter' },
      { name: 'Agro', class: 'warrior' },
    ],
  },
  {
    raidName: 'Manaforge Omega (AOTC)',
    imageUrl: killImage('manaforge_omega_2025_09_17.webp'),
    date: '2025-09-17 22:01',
    tanks: [
      { name: 'Phruity', class: 'druid' },
      { name: 'Agro', class: 'warrior' },
    ],
    healers: [
      { name: 'Éowyn', class: 'druid' },
      { name: 'Tuck', class: 'monk' },
      { name: 'Kiyanne', class: 'evoker' },
      { name: 'Samáar', class: 'paladin' },
      { name: 'Edemption', class: 'priest' },
    ],
    dds: [
      { name: 'Blackmaira', class: 'paladin' },
      { name: 'Synjin', class: 'shaman' },
      { name: 'Skátari', class: 'warlock' },
      { name: 'Chaos', class: 'warlock' },
      { name: 'Aerioth', class: 'priest' },
      { name: 'Snyxx', class: 'mage' },
      { name: 'Frosteyes', class: 'death-knight' },
      { name: 'Daruni', class: 'druid' },
      { name: 'Valthor', class: 'warrior' },
      { name: 'Trupolini', class: 'warrior' },
      { name: 'Aurielle', class: 'paladin' },
      { name: 'Baraddûr', class: 'death-knight' },
      { name: 'Rhapidfire', class: 'hunter' },
    ],
  },
  {
    raidName: 'Glory of the Liberation of Undermine Raider',
    imageUrl: killImage('glory_of_the_liberation_of_undermine_raider_2025_04_27.jpg'),
    date: '2025-04-27 20:21',
    attempts: 1,
    tanks: [
      { name: 'Phruity', class: 'druid' },
      { name: 'Valorite', class: 'death-knight' },
    ],
    healers: [
      { name: 'Blackmaira', class: 'paladin' },
      { name: 'Éowyn', class: 'druid' },
      { name: 'Redemption', class: 'priest' },
      { name: 'Kiyanne', class: 'evoker' },
      { name: 'Sâmáar', class: 'priest' },
      { name: 'Edemption', class: 'priest' },
    ],
    dds: [
      { name: 'Dimi', class: 'monk' },
      { name: 'Synjin', class: 'shaman' },
      { name: 'Chaos', class: 'warlock' },
      { name: 'Aeripew', class: 'hunter' },
      { name: 'Raspak', class: 'hunter' },
      { name: 'Frosteyes', class: 'death-knight' },
      { name: 'Olidh', class: 'demon-hunter' },
      { name: 'Wabble', class: 'hunter' },
      { name: 'Incendia', class: 'mage' },
      { name: 'Tulkas', class: 'rogue' },
      { name: 'Peltzer', class: 'warlock' },
      { name: 'Daruni', class: 'druid' },
    ],
  },
  {
    raidName: 'Liberation of Undermine (AOTC)',
    imageUrl: killImage('liberation_of_undermine_2025_04_20.webp'),
    date: '2025-04-20 19:39',
    tanks: [
      { name: 'Phing', class: 'monk' },
      { name: 'Agro', class: 'warrior' },
    ],
    healers: [
      { name: 'Blackmaira', class: 'paladin' },
      { name: 'Éowyn', class: 'druid' },
      { name: 'Violator', class: 'paladin' },
      { name: 'Kiyanne', class: 'evoker' },
      { name: 'Sâmáar', class: 'priest' },
      { name: 'Edemption', class: 'priest' },
    ],
    dds: [
      { name: 'Synjin', class: 'shaman' },
      { name: 'Mssk', class: 'paladin' },
      { name: 'Aerioth', class: 'priest' },
      { name: 'Raspak', class: 'hunter' },
      { name: 'Frosteyes', class: 'death-knight' },
      { name: 'Olidh', class: 'demon-hunter' },
      { name: 'Wabble', class: 'hunter' },
      { name: 'Valordin', class: 'paladin' },
      { name: 'Aurielle', class: 'paladin' },
      { name: 'Tulkas', class: 'rogue' },
    ],
  },
  {
    raidName: 'Yogg-Saron',
    imageUrl: killImage('yoggsaron_2009_06_01.jpg'),
    date: '2009-06-01',
  },
  { raidName: 'Ulduar', imageUrl: killImage('ulduar_2009_04_19.jpg'), date: '2009-04-19' },
  {
    raidName: 'Obsidian Sanctum',
    imageUrl: killImage('obsidian_sanctum_2009_02_23.jpg'),
    date: '2009-02-23',
  },
]
