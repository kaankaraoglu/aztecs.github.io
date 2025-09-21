// Centralized kill card data similar to progression.js
// Each entry corresponds to a KillCardView instance.
// Date format (YYYY-MM-DD HH:mm or YYYY-MM-DD) for display.

import liberationOfUndermineImage from '@/assets/images/kills/liberation_of_undermine_2025_04_20.png'
import gloryOfLiberationImage from '@/assets/images/kills/glory_of_the_liberation_of_undermine_raider_2025_04_27.jpg'
import yoggSaronImage from '@/assets/images/kills/yoggsaron_2009_06_01.jpg'
import ulduarImage from '@/assets/images/kills/ulduar_2009_04_19.jpg'
import obsidianSanctumImage from '@/assets/images/kills/obsidian_sanctum_2009_02_23.jpg'
import manaforgeOmegaImage from '@/assets/images/kills/manaforge_omega_2025_09_17.jpg'
import gloryOfTheOmegaRaiderImage from '@/assets/images/kills/glory_of_the_omega_raider_2025_09_21.jpg'

export const kills = [
    {
    raidName: 'Glory of the Omega Raider',
    imageUrl: gloryOfTheOmegaRaiderImage,
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
    imageUrl: manaforgeOmegaImage,
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
