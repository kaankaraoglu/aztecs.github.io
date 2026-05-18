/** @typedef {{ name: string, role: 'tank' | 'healer' | 'melee' | 'ranged', buffs: string[] }} SpecDef */
/** @typedef {{ name: string, specs: Record<string, SpecDef> }} ClassDef */
/** @typedef {{ name: string, description: string, classes: string[], category: 'throughput' | 'utility' }} BuffDef */

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
        buffs: ['devotionAura', 'concentrationAura', 'masteryAura'],
      },
      protection: {
        name: 'Protection',
        role: 'tank',
        buffs: ['devotionAura', 'concentrationAura', 'masteryAura'],
      },
      retribution: {
        name: 'Retribution',
        role: 'melee',
        buffs: ['devotionAura', 'concentrationAura', 'masteryAura'],
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
      assassination: { name: 'Assassination', role: 'melee', buffs: ['atrophicPoison'] },
      outlaw: { name: 'Outlaw', role: 'melee', buffs: ['atrophicPoison'] },
      subtlety: { name: 'Subtlety', role: 'melee', buffs: ['atrophicPoison'] },
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
      elemental: {
        name: 'Elemental',
        role: 'ranged',
        buffs: ['bloodlust', 'skyfury', 'manaTideTotem'],
      },
      enhancement: {
        name: 'Enhancement',
        role: 'melee',
        buffs: ['bloodlust', 'skyfury', 'manaTideTotem'],
      },
      restoration: {
        name: 'Restoration',
        role: 'healer',
        buffs: ['bloodlust', 'skyfury', 'manaTideTotem'],
      },
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
      affliction: {
        name: 'Affliction',
        role: 'ranged',
        buffs: ['demonicGateway', 'soulstone', 'healthstone'],
      },
      demonology: {
        name: 'Demonology',
        role: 'ranged',
        buffs: ['demonicGateway', 'soulstone', 'healthstone'],
      },
      destruction: {
        name: 'Destruction',
        role: 'ranged',
        buffs: ['demonicGateway', 'soulstone', 'healthstone'],
      },
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
      devourer: { name: 'Devourer', role: 'ranged', buffs: ['chaosBrand', 'darkness'] },
    },
  },
  deathKnight: {
    name: 'Death Knight',
    specs: {
      blood: {
        name: 'Blood',
        role: 'tank',
        buffs: ['unholyMight', 'deathGrip', 'abominationLimb', 'gorefiendsGrasp'],
      },
      frost: { name: 'Frost', role: 'melee', buffs: ['unholyMight', 'deathGrip'] },
      unholy: { name: 'Unholy', role: 'melee', buffs: ['unholyMight', 'deathGrip'] },
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
    description: 'Increases Intellect by 3% for 1 hour',
    classes: ['mage'],
    category: 'throughput',
  },
  atrophicPoison: {
    name: 'Atrophic Poison',
    description: 'Each strike has a 30% chance to reduce enemy damage by 3% for 10s',
    classes: ['rogue'],
    category: 'throughput',
  },
  battleShout: {
    name: 'Battle Shout',
    description: 'Increases Attack Power by 5% for 1 hour',
    classes: ['warrior'],
    category: 'throughput',
  },
  blessingOfTheBronze: {
    name: 'Blessing of the Bronze',
    description: 'Reduces cooldown of a major movement ability by 15% for 1 hour',
    classes: ['evoker'],
    category: 'throughput',
  },
  bloodlust: {
    name: 'Bloodlust',
    description: 'Increases Haste by 30% for 40s',
    classes: ['shaman', 'mage', 'hunter', 'evoker'],
    category: 'throughput',
  },
  chaosBrand: {
    name: 'Chaos Brand',
    description: 'Increases Magic damage taken by the target by 3%',
    classes: ['demonHunter'],
    category: 'throughput',
  },
  concentrationAura: {
    name: 'Concentration Aura',
    description:
      'Interrupt and Silence effects on party/raid members within 40 yds are 30% shorter',
    classes: ['paladin'],
    category: 'throughput',
  },
  devotionAura: {
    name: 'Devotion Aura',
    description: 'Reduces damage taken by 3% for party/raid members within 40 yds',
    classes: ['paladin'],
    category: 'throughput',
  },
  huntersMark: {
    name: "Hunter's Mark",
    description: 'Increases damage taken by the target by 3%',
    classes: ['hunter'],
    category: 'throughput',
  },
  manaTideTotem: {
    name: 'Mana Tide Totem',
    description: 'Restores mana to the raid over time',
    classes: ['shaman'],
    category: 'utility',
  },
  markOfTheWild: {
    name: 'Mark of the Wild',
    description: 'Increases Versatility by 3% for 1 hour',
    classes: ['druid'],
    category: 'throughput',
  },
  masteryAura: {
    name: 'Mastery Aura',
    description: 'Increases Mastery by a set amount',
    classes: ['paladin'],
    category: 'throughput',
  },
  mysticTouch: {
    name: 'Mystic Touch',
    description: 'Increases Physical damage taken by the target by 5%',
    classes: ['monk'],
    category: 'throughput',
  },
  powerInfusion: {
    name: 'Power Infusion',
    description: 'Increases Haste by 20% for 20s',
    classes: ['priest'],
    category: 'throughput',
  },
  powerWordFortitude: {
    name: 'Power Word: Fortitude',
    description: 'Increases Stamina by 5% for 1 hour',
    classes: ['priest'],
    category: 'throughput',
  },
  skyfury: {
    name: 'Skyfury',
    description:
      'Grants 2% Mastery and 20% chance for auto attacks to instantly strike again for 1 hour',
    classes: ['shaman'],
    category: 'throughput',
  },
  unholyMight: {
    name: 'Unholy Might',
    description: 'Increases Strength by 5%',
    classes: ['deathKnight'],
    category: 'throughput',
  },
  abominationLimb: {
    name: 'Abomination Limb',
    description: 'Pulls enemies further than 8 yds every 1s (Blood only)',
    classes: ['deathKnight'],
    category: 'utility',
  },
  darkness: {
    name: 'Darkness',
    description: 'Chaos Nova (AoE stun) and Darkness (20% avoidance for the raid)',
    classes: ['demonHunter'],
    category: 'utility',
  },
  deathGrip: {
    name: 'Death Grip',
    description: 'Draws the target toward you',
    classes: ['deathKnight'],
    category: 'utility',
  },
  demonicGateway: {
    name: 'Demonic Gateway',
    description: 'Creates a gateway between two locations for raid transport',
    classes: ['warlock'],
    category: 'utility',
  },
  gorefiendsGrasp: {
    name: "Gorefiend's Grasp",
    description: 'Pulls all enemies within 15 yds to the target and silences for 3s (Blood only)',
    classes: ['deathKnight'],
    category: 'utility',
  },
  healthstone: {
    name: 'Healthstone',
    description: 'Instantly restores 25% health',
    classes: ['warlock'],
    category: 'utility',
  },
  soulstone: {
    name: 'Soulstone',
    description: 'Allows resurrection upon death with 60% health and 20% mana',
    classes: ['warlock'],
    category: 'utility',
  },
}
