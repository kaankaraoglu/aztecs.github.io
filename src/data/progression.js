// Centralized current tier progression data
// Extend objects with more metadata if needed (e.g. order, mythic status, ids)
export const tierName = 'Manaforge Omega'
export const bosses = [
  { name: 'Plexus Sentinel', normal: true, heroic: true },
  { name: "Loom'ithar", normal: true, heroic: true },
  { name: 'Soulbinder Naazindhri', normal: true, heroic: true },
  { name: 'Forgeweaver Araz', normal: true, heroic: true },
  { name: 'The Soul Hunters', normal: true, heroic: true },
  { name: 'Fractillus', normal: true, heroic: true },
  { name: 'Nexus-King Salhadaar', normal: true, heroic: true },
  { name: 'Dimensius', normal: true, heroic: false },
]

// Helper to map boolean -> display symbol
export function killMark(killed) {
  return killed ? '💀' : '-'
}
