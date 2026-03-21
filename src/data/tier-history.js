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
  // ── Midnight ──
  // Current tier shown live via progression box

  // ── The War Within ──
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
    tier: "Nerub'ar Palace",
    expansion: 'The War Within',
    dates: { start: '2024-09-10', end: '2025-03-03' },
    bosses: 8,
    progress: '8/8 Heroic',
    notable: 'AOTC',
  },

  // ── Dragonflight ──
  {
    tier: "Amirdrassil, the Dream's Hope",
    expansion: 'Dragonflight',
    season: 'Season 3',
    dates: { start: '2023-11-14', end: '2024-04-22' },
    bosses: 9,
    progress: '9/9 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Aberrus, the Shadowed Crucible',
    expansion: 'Dragonflight',
    season: 'Season 2',
    dates: { start: '2023-05-09', end: '2023-11-13' },
    bosses: 9,
    progress: '9/9 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Vault of the Incarnates',
    expansion: 'Dragonflight',
    season: 'Season 1',
    dates: { start: '2022-12-12', end: '2023-05-08' },
    bosses: 8,
    progress: '8/8 Heroic',
    notable: 'AOTC',
  },

  // ── Shadowlands ──
  {
    tier: 'Sepulcher of the First Ones',
    expansion: 'Shadowlands',
    season: 'Season 3',
    dates: { start: '2022-03-01', end: '2022-08-01' },
    bosses: 11,
    progress: '11/11 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Sanctum of Domination',
    expansion: 'Shadowlands',
    season: 'Season 2',
    dates: { start: '2021-07-06', end: '2022-02-28' },
    bosses: 10,
    progress: '10/10 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Castle Nathria',
    expansion: 'Shadowlands',
    season: 'Season 1',
    dates: { start: '2020-12-08', end: '2021-07-05' },
    bosses: 10,
    progress: '10/10 Heroic',
    notable: 'AOTC',
  },

  // ── Battle for Azeroth ──
  {
    tier: "Ny'alotha, the Waking City",
    expansion: 'Battle for Azeroth',
    season: 'Season 4',
    dates: { start: '2020-01-21', end: '2020-10-12' },
    bosses: 12,
    progress: '12/12 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'The Eternal Palace',
    expansion: 'Battle for Azeroth',
    season: 'Season 3',
    dates: { start: '2019-07-09', end: '2020-01-20' },
    bosses: 8,
    progress: '8/8 Heroic',
    notable: 'AOTC',
  },
  {
    tier: "Battle of Dazar'alor",
    expansion: 'Battle for Azeroth',
    season: 'Season 2',
    dates: { start: '2019-01-22', end: '2019-07-08' },
    bosses: 9,
    progress: '9/9 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Uldir',
    expansion: 'Battle for Azeroth',
    season: 'Season 1',
    dates: { start: '2018-09-04', end: '2019-01-21' },
    bosses: 8,
    progress: '8/8 Heroic',
    notable: 'AOTC',
  },

  // ── Legion ──
  {
    tier: 'Antorus, the Burning Throne',
    expansion: 'Legion',
    dates: { start: '2017-11-28', end: '2018-07-16' },
    bosses: 11,
    progress: '11/11 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Tomb of Sargeras',
    expansion: 'Legion',
    dates: { start: '2017-06-20', end: '2017-11-27' },
    bosses: 9,
    progress: '9/9 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'The Nighthold',
    expansion: 'Legion',
    dates: { start: '2017-01-17', end: '2017-06-19' },
    bosses: 10,
    progress: '10/10 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'The Emerald Nightmare',
    expansion: 'Legion',
    dates: { start: '2016-09-20', end: '2017-01-16' },
    bosses: 7,
    progress: '7/7 Heroic',
    notable: 'AOTC',
  },

  // ── Warlords of Draenor ──
  {
    tier: 'Hellfire Citadel',
    expansion: 'Warlords of Draenor',
    dates: { start: '2015-06-23', end: '2016-07-18' },
    bosses: 13,
    progress: '13/13 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Blackrock Foundry',
    expansion: 'Warlords of Draenor',
    dates: { start: '2015-02-03', end: '2015-06-22' },
    bosses: 10,
    progress: '10/10 Heroic',
    notable: 'AOTC',
  },
  {
    tier: 'Highmaul',
    expansion: 'Warlords of Draenor',
    dates: { start: '2014-12-02', end: '2015-02-02' },
    bosses: 7,
    progress: '7/7 Heroic',
    notable: 'AOTC',
  },

  // ── Mists of Pandaria ──
  {
    tier: 'Siege of Orgrimmar',
    expansion: 'Mists of Pandaria',
    dates: { start: '2013-09-10', end: '2014-10-13' },
    bosses: 14,
    progress: '14/14 Normal',
  },
  {
    tier: 'Throne of Thunder',
    expansion: 'Mists of Pandaria',
    dates: { start: '2013-03-05', end: '2013-09-09' },
    bosses: 13,
    progress: '13/13 Normal',
  },
  {
    tier: "Mogu'shan Vaults / Heart of Fear / Terrace of Endless Spring",
    expansion: 'Mists of Pandaria',
    dates: { start: '2012-10-02', end: '2013-03-04' },
    bosses: 16,
    progress: '16/16 Normal',
  },

  // ── Cataclysm ──
  {
    tier: 'Dragon Soul',
    expansion: 'Cataclysm',
    dates: { start: '2011-11-29', end: '2012-08-27' },
    bosses: 8,
    progress: '8/8 Normal',
  },
  {
    tier: 'Firelands',
    expansion: 'Cataclysm',
    dates: { start: '2011-06-28', end: '2011-11-28' },
    bosses: 7,
    progress: '7/7 Normal',
  },
  {
    tier: 'Blackwing Descent / Bastion of Twilight / Throne of the Four Winds',
    expansion: 'Cataclysm',
    dates: { start: '2010-12-07', end: '2011-06-27' },
    bosses: 13,
    progress: '13/13 Normal',
  },

  // ── Wrath of the Lich King ──
  {
    tier: 'Icecrown Citadel',
    expansion: 'Wrath of the Lich King',
    dates: { start: '2009-12-08', end: '2010-10-11' },
    bosses: 12,
    progress: '12/12 Normal',
    notable: 'The Lich King defeated',
  },
  {
    tier: 'Trial of the Crusader',
    expansion: 'Wrath of the Lich King',
    dates: { start: '2009-08-04', end: '2009-12-07' },
    bosses: 5,
    progress: '5/5 Normal',
  },
  {
    tier: 'Ulduar',
    expansion: 'Wrath of the Lich King',
    dates: { start: '2009-04-14', end: '2009-08-03' },
    bosses: 14,
    progress: '14/14 Normal',
    notable: 'Yogg-Saron killed',
  },
  {
    tier: 'Naxxramas / Obsidian Sanctum / Eye of Eternity',
    expansion: 'Wrath of the Lich King',
    dates: { start: '2008-11-13', end: '2009-04-13' },
    bosses: 17,
    progress: '17/17 Normal',
  },

  // ── The Burning Crusade ──
  {
    tier: 'Sunwell Plateau',
    expansion: 'The Burning Crusade',
    dates: { start: '2008-03-25', end: '2008-11-12' },
    bosses: 6,
    progress: '6/6 Normal',
  },
  {
    tier: 'Black Temple / Mount Hyjal',
    expansion: 'The Burning Crusade',
    dates: { start: '2007-05-22', end: '2008-03-24' },
    bosses: 14,
    progress: '14/14 Normal',
  },
  {
    tier: 'Serpentshrine Cavern / Tempest Keep',
    expansion: 'The Burning Crusade',
    dates: { start: '2007-01-15', end: '2007-05-21' },
    bosses: 10,
    progress: '10/10 Normal',
  },
  {
    tier: 'Karazhan / Gruul / Magtheridon',
    expansion: 'The Burning Crusade',
    dates: { start: '2007-01-15', end: '2007-05-21' },
    bosses: 14,
    progress: '14/14 Normal',
  },

  // ── Classic ──
  {
    tier: 'Naxxramas',
    expansion: 'Classic',
    dates: { start: '2006-06-20', end: '2007-01-14' },
    bosses: 15,
    progress: '15/15',
  },
  {
    tier: "Temple of Ahn'Qiraj",
    expansion: 'Classic',
    dates: { start: '2006-01-03', end: '2006-06-19' },
    bosses: 9,
    progress: '9/9',
  },
  {
    tier: 'Blackwing Lair',
    expansion: 'Classic',
    dates: { start: '2005-09-09', end: '2006-01-02' },
    bosses: 8,
    progress: '8/8',
    notable: 'Guild founded Sep 9, 2005',
  },
  {
    tier: 'Molten Core / Onyxia',
    expansion: 'Classic',
    dates: { start: '2005-09-09', end: '2006-01-02' },
    bosses: 11,
    progress: '11/11',
    notable: 'Where it all began',
  },
]
