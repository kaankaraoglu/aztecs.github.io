/** @typedef {{ name: string, role: 'tank' | 'healer' | 'melee' | 'ranged', buffs: string[] }} SpecDef */
/** @typedef {{ name: string, specs: Record<string, SpecDef> }} ClassDef */
/** @typedef {{ name: string, description: string, icon: string, classes: string[] }} BuffDef */

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
      holy: {
        name: 'Holy',
        role: 'healer',
        buffs: ['devotionAura', 'blessingOfSummer', 'masteryAura'],
      },
      protection: {
        name: 'Protection',
        role: 'tank',
        buffs: ['devotionAura', 'blessingOfSummer', 'masteryAura'],
      },
      retribution: {
        name: 'Retribution',
        role: 'melee',
        buffs: ['devotionAura', 'blessingOfSummer', 'masteryAura'],
      },
    },
  },
  hunter: {
    name: 'Hunter',
    specs: {
      beastMastery: { name: 'Beast Mastery', role: 'ranged', buffs: ['huntersMark', 'bloodlust'] },
      marksmanship: { name: 'Marksmanship', role: 'ranged', buffs: ['huntersMark', 'bloodlust'] },
      survival: { name: 'Survival', role: 'melee', buffs: ['huntersMark', 'bloodlust'] },
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
      discipline: {
        name: 'Discipline',
        role: 'healer',
        buffs: ['powerWordFortitude', 'powerInfusion'],
      },
      holy: { name: 'Holy', role: 'healer', buffs: ['powerWordFortitude', 'powerInfusion'] },
      shadow: { name: 'Shadow', role: 'ranged', buffs: ['powerWordFortitude', 'powerInfusion'] },
    },
  },
  shaman: {
    name: 'Shaman',
    specs: {
      elemental: { name: 'Elemental', role: 'ranged', buffs: ['bloodlust', 'manaTideTotem'] },
      enhancement: { name: 'Enhancement', role: 'melee', buffs: ['bloodlust', 'manaTideTotem'] },
      restoration: { name: 'Restoration', role: 'healer', buffs: ['bloodlust', 'manaTideTotem'] },
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
      affliction: { name: 'Affliction', role: 'ranged', buffs: ['healthstone'] },
      demonology: { name: 'Demonology', role: 'ranged', buffs: ['healthstone'] },
      destruction: { name: 'Destruction', role: 'ranged', buffs: ['healthstone'] },
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
      havoc: { name: 'Havoc', role: 'melee', buffs: ['chaosBrand', 'darkness'] },
      vengeance: { name: 'Vengeance', role: 'tank', buffs: ['chaosBrand', 'darkness'] },
    },
  },
  deathKnight: {
    name: 'Death Knight',
    specs: {
      blood: { name: 'Blood', role: 'tank', buffs: ['unholyMight'] },
      frost: { name: 'Frost', role: 'melee', buffs: ['unholyMight'] },
      unholy: { name: 'Unholy', role: 'melee', buffs: ['unholyMight'] },
    },
  },
  evoker: {
    name: 'Evoker',
    specs: {
      devastation: {
        name: 'Devastation',
        role: 'ranged',
        buffs: ['bloodlust', 'blessingOfTheBronze'],
      },
      preservation: {
        name: 'Preservation',
        role: 'healer',
        buffs: ['bloodlust', 'blessingOfTheBronze'],
      },
      augmentation: {
        name: 'Augmentation',
        role: 'ranged',
        buffs: ['bloodlust', 'blessingOfTheBronze'],
      },
    },
  },
}

/** @type {Record<string, BuffDef>} */
export const RAID_BUFFS = {
  arcaneIntellect: {
    name: 'Arcane Intellect',
    description: 'Increases Intellect by 5%',
    icon: 'spell_holy_magicalsentry',
    classes: ['mage'],
  },
  battleShout: {
    name: 'Battle Shout',
    description: 'Increases Attack Power by 5%',
    icon: 'ability_warrior_battleshout',
    classes: ['warrior'],
  },
  blessingOfSummer: {
    name: 'Blessing of Summer',
    description: 'Increases damage dealt by target for 30s',
    icon: 'ability_ardenweald_paladin_summer',
    classes: ['paladin'],
  },
  blessingOfTheBronze: {
    name: 'Blessing of the Bronze',
    description: 'Reduces cooldowns of movement abilities and Source of Magic (mana restoration)',
    icon: 'ability_evoker_blessingofthebronze',
    classes: ['evoker'],
  },
  bloodlust: {
    name: 'Bloodlust',
    description: 'Increases Haste by 30% for 40s',
    icon: 'spell_nature_bloodlust',
    classes: ['shaman', 'mage', 'hunter', 'evoker'],
  },
  chaosBrand: {
    name: 'Chaos Brand',
    description: 'Increases Magic damage taken by the target by 5%',
    icon: 'ability_demonhunter_empowerwards',
    classes: ['demonHunter'],
  },
  darkness: {
    name: 'Darkness',
    description: 'Chaos Nova (AoE stun) and Darkness (20% avoidance for the raid)',
    icon: 'ability_demonhunter_darkness',
    classes: ['demonHunter'],
  },
  devotionAura: {
    name: 'Devotion Aura',
    description: 'Reduces damage taken by 3% for all party/raid members within 40 yards',
    icon: 'spell_holy_devotionaura',
    classes: ['paladin'],
  },
  healthstone: {
    name: 'Healthstone',
    description: 'Creates a Soulwell for a 25% max HP heal',
    icon: 'warlock_-healthstone',
    classes: ['warlock'],
  },
  huntersMark: {
    name: "Hunter's Mark",
    description: 'Increases damage dealt to the target by 5%',
    icon: 'ability_hunter_markedfordeath',
    classes: ['hunter'],
  },
  manaTideTotem: {
    name: 'Mana Tide Totem',
    description: 'Restores mana to the raid over time',
    icon: 'ability_shaman_manatidetotem',
    classes: ['shaman'],
  },
  markOfTheWild: {
    name: 'Mark of the Wild',
    description: 'Increases Versatility by 3%',
    icon: 'spell_nature_regeneration',
    classes: ['druid'],
  },
  masteryAura: {
    name: 'Mastery Aura',
    description: 'Increases Mastery by a set amount',
    icon: 'spell_holy_crusade',
    classes: ['paladin'],
  },
  mysticTouch: {
    name: 'Mystic Touch',
    description: 'Increases Physical damage taken by the target by 5%',
    icon: 'ability_monk_sparring',
    classes: ['monk'],
  },
  powerInfusion: {
    name: 'Power Infusion',
    description: 'Increases Haste by 20% for 20s',
    icon: 'spell_holy_powerinfusion',
    classes: ['priest'],
  },
  powerWordFortitude: {
    name: 'Power Word: Fortitude',
    description: 'Increases Stamina by 5%',
    icon: 'spell_holy_wordfortitude',
    classes: ['priest'],
  },
  unholyMight: {
    name: 'Unholy Might',
    description: 'Increases Strength by 5%',
    icon: 'spell_holy_blessingofstrength',
    classes: ['deathKnight'],
  },
}
