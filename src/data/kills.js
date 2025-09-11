// Centralized kill card data similar to progression.js
// Each entry corresponds to a KillCardView instance.
// Date format (YYYY-MM-DD HH:mm or YYYY-MM-DD) for display.

import liberationOfUndermineImage from '@/assets/images/kills/liberation_of_undermine_2025_04_20.png'
import gloryOfLiberationImage from '@/assets/images/kills/glory_of_the_liberation_of_undermine_raider_2025_04_27.jpg'
import yoggSaronImage from '@/assets/images/kills/yoggsaron_2009_06_01.jpg'
import ulduarImage from '@/assets/images/kills/ulduar_2009_04_19.jpg'
import obsidianSanctumImage from '@/assets/images/kills/obsidian_sanctum_2009_02_23.jpg'

export const kills = [
  {
    raidName: 'Liberation of Undermine (AOTC)',
    imageUrl: liberationOfUndermineImage,
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
    raidName: 'Glory of the Liberation of Undermine Raider',
    imageUrl: gloryOfLiberationImage,
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
  { raidName: 'Yogg-Saron', imageUrl: yoggSaronImage, date: '2009-06-01' },
  { raidName: 'Ulduar', imageUrl: ulduarImage, date: '2009-04-19' },
  { raidName: 'Obsidian Sanctum', imageUrl: obsidianSanctumImage, date: '2009-02-23' },
]
