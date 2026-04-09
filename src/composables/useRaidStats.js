import statsData from '@/data/wcl-stats.json'

/**
 * @typedef {{ name: string, class: string, count: number }} DeathStat
 * @typedef {{ name: string, class: string, killsAttended: number }} IronRaiderStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} HighestDamageDoneStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} HighestDamageDoneMplusStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} BestHealerStat
 * @typedef {{ mostDeaths: DeathStat|null, ironRaider: IronRaiderStat|null, highestDamageDone: HighestDamageDoneStat|null, highestDamageDoneMplus: HighestDamageDoneMplusStat|null, bestHealer: BestHealerStat|null }} RaidStats
 */

export function useRaidStats() {
  const stats = statsData.stats
  const hasData = !!(
    stats.mostDeaths ||
    stats.ironRaider ||
    stats.highestDamageDone ||
    stats.highestDamageDoneMplus ||
    stats.bestHealer
  )

  return {
    zone: statsData.zone,
    stats,
    hasData,
  }
}
