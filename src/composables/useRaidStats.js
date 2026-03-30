import statsData from '@/data/wcl-stats.json'

/**
 * @typedef {{ name: string, class: string, count: number }} DeathStat
 * @typedef {{ name: string, class: string, killsAttended: number }} IronRaiderStat
 * @typedef {{ name: string, class: string, amount: number, ability: string, boss: string, report?: string }} BiggestHitStat
 * @typedef {{ name: string, class: string, amount: number, boss: string, report?: string }} BestHealerStat
 * @typedef {{ mostDeaths: DeathStat|null, ironRaider: IronRaiderStat|null, biggestHit: BiggestHitStat|null, bestHealer: BestHealerStat|null }} RaidStats
 */

export function useRaidStats() {
  const stats = statsData.stats
  const hasData = !!(stats.mostDeaths || stats.ironRaider || stats.biggestHit || stats.bestHealer)

  return {
    zone: statsData.zone,
    stats,
    hasData,
  }
}
