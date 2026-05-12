import statsData from '@/data/wcl-stats.json'

/**
 * @typedef {{ name: string, class: string, count: number }} DeathStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} HighestDamageDoneStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} HighestDamageDoneMplusStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} BestHealerStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} BestHealerMplusStat
 * @typedef {{ mostDeaths: DeathStat|null, highestDamageDone: HighestDamageDoneStat|null, highestDamageDoneMplus: HighestDamageDoneMplusStat|null, bestHealer: BestHealerStat|null, bestHealerMplus: BestHealerMplusStat|null }} RaidStats
 */

export function useRaidStats() {
  const stats = statsData.stats
  const hasData = !!(
    stats.mostDeaths ||
    stats.highestDamageDone ||
    stats.highestDamageDoneMplus ||
    stats.bestHealer ||
    stats.bestHealerMplus
  )

  return {
    zone: statsData.zone,
    stats,
    hasData,
  }
}
