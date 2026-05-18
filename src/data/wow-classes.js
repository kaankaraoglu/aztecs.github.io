/** @typedef {{ name: string, role: 'tank' | 'healer' | 'melee' | 'ranged', buffs: string[] }} SpecDef */
/** @typedef {{ name: string, specs: Record<string, SpecDef> }} ClassDef */
/** @typedef {{ name: string, classes: string[] }} BuffDef */

/** @type {Record<string, ClassDef>} */
export const WOW_CLASSES = {
  warrior: {
    name: 'Warrior',
    specs: {
      arms: { name: 'Arms', role: 'melee', buffs: ['battleShout'] },
      fury: { name: 'Fury', role: 'melee', buffs: ['battleShout'] },
      protection: { name: 'Protection', role: 'tank', buffs: ['battleShout'] },
    },
  },
  paladin: {
    name: 'Paladin',
    specs: {
      holy: { name: 'Holy', role: 'healer', buffs: ['devotionAura'] },
      protection: { name: 'Protection', role: 'tank', buffs: ['devotionAura'] },
      retribution: { name: 'Retribution', role: 'melee', buffs: ['devotionAura'] },
    },
  },
  hunter: {
    name: 'Hunter',
    specs: {
      beastMastery: { name: 'Beast Mastery', role: 'ranged', buffs: ['huntersMark'] },
      marksmanship: { name: 'Marksmanship', role: 'ranged', buffs: ['huntersMark'] },
      survival: { name: 'Survival', role: 'melee', buffs: ['huntersMark'] },
    },
  },
  rogue: {
    name: 'Rogue',
    specs: {
      assassination: { name: 'Assassination', role: 'melee', buffs: [] },
      outlaw: { name: 'Outlaw', role: 'melee', buffs: [] },
      subtlety: { name: 'Subtlety', role: 'melee', buffs: [] },
    },
  },
  priest: {
    name: 'Priest',
    specs: {
      discipline: { name: 'Discipline', role: 'healer', buffs: ['powerWordFortitude'] },
      holy: { name: 'Holy', role: 'healer', buffs: ['powerWordFortitude'] },
      shadow: { name: 'Shadow', role: 'ranged', buffs: ['powerWordFortitude'] },
    },
  },
  shaman: {
    name: 'Shaman',
    specs: {
      elemental: { name: 'Elemental', role: 'ranged', buffs: ['bloodlust', 'skyfury'] },
      enhancement: { name: 'Enhancement', role: 'melee', buffs: ['bloodlust', 'skyfury'] },
      restoration: { name: 'Restoration', role: 'healer', buffs: ['bloodlust', 'skyfury'] },
    },
  },
  mage: {
    name: 'Mage',
    specs: {
      arcane: { name: 'Arcane', role: 'ranged', buffs: ['arcaneIntellect', 'bloodlust'] },
      fire: { name: 'Fire', role: 'ranged', buffs: ['arcaneIntellect', 'bloodlust'] },
      frost: { name: 'Frost', role: 'ranged', buffs: ['arcaneIntellect', 'bloodlust'] },
    },
  },
  warlock: {
    name: 'Warlock',
    specs: {
      affliction: { name: 'Affliction', role: 'ranged', buffs: [] },
      demonology: { name: 'Demonology', role: 'ranged', buffs: [] },
      destruction: { name: 'Destruction', role: 'ranged', buffs: [] },
    },
  },
  monk: {
    name: 'Monk',
    specs: {
      brewmaster: { name: 'Brewmaster', role: 'tank', buffs: ['mysticTouch'] },
      mistweaver: { name: 'Mistweaver', role: 'healer', buffs: ['mysticTouch'] },
      windwalker: { name: 'Windwalker', role: 'melee', buffs: ['mysticTouch'] },
    },
  },
  druid: {
    name: 'Druid',
    specs: {
      balance: { name: 'Balance', role: 'ranged', buffs: ['markOfTheWild'] },
      feral: { name: 'Feral', role: 'melee', buffs: ['markOfTheWild'] },
      guardian: { name: 'Guardian', role: 'tank', buffs: ['markOfTheWild'] },
      restoration: { name: 'Restoration', role: 'healer', buffs: ['markOfTheWild'] },
    },
  },
  demonHunter: {
    name: 'Demon Hunter',
    specs: {
      havoc: { name: 'Havoc', role: 'melee', buffs: ['chaosBrand'] },
      vengeance: { name: 'Vengeance', role: 'tank', buffs: ['chaosBrand'] },
    },
  },
  deathKnight: {
    name: 'Death Knight',
    specs: {
      blood: { name: 'Blood', role: 'tank', buffs: [] },
      frost: { name: 'Frost', role: 'melee', buffs: [] },
      unholy: { name: 'Unholy', role: 'melee', buffs: [] },
    },
  },
  evoker: {
    name: 'Evoker',
    specs: {
      devastation: { name: 'Devastation', role: 'ranged', buffs: ['bloodlust'] },
      preservation: { name: 'Preservation', role: 'healer', buffs: ['bloodlust'] },
      augmentation: { name: 'Augmentation', role: 'ranged', buffs: ['bloodlust'] },
    },
  },
}

/** @type {Record<string, BuffDef>} */
export const RAID_BUFFS = {
  battleShout: { name: 'Battle Shout', classes: ['warrior'] },
  arcaneIntellect: { name: 'Arcane Intellect', classes: ['mage'] },
  markOfTheWild: { name: 'Mark of the Wild', classes: ['druid'] },
  powerWordFortitude: { name: 'Power Word: Fortitude', classes: ['priest'] },
  mysticTouch: { name: 'Mystic Touch', classes: ['monk'] },
  chaosBrand: { name: 'Chaos Brand', classes: ['demonHunter'] },
  bloodlust: { name: 'Bloodlust / Heroism', classes: ['shaman', 'mage', 'evoker'] },
  skyfury: { name: 'Skyfury', classes: ['shaman'] },
  devotionAura: { name: 'Devotion Aura', classes: ['paladin'] },
  huntersMark: { name: "Hunter's Mark", classes: ['hunter'] },
}
