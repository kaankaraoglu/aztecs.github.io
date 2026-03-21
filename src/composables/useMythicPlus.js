import mpData from '@/data/rio-mythicplus.json'

/**
 * @typedef {{ name: string, class: string, score: number, topKeys: string[] }} MpRunner
 * @typedef {{ dungeon: string, level: number, timed: boolean, team: string[] }} DungeonBest
 */

export function useMythicPlus() {
  const hasData = mpData.topRunners && mpData.topRunners.length > 0

  return {
    season: mpData.season,
    topRunners: mpData.topRunners,
    dungeonBests: mpData.dungeonBests,
    hasData,
  }
}
