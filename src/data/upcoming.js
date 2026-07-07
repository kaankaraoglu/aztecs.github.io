// Upcoming raids not yet tracked on Warcraft Logs.
//
// useProgression() appends these to the live (WCL/fallback) progression so an
// announced tier can be shown alongside the current one before any logs exist.
// Once the raid goes live on WCL, remove it here and add it to the fetch config
// (CURRENT_ZONE_IDS in scripts/wcl-api.js, plus RAID_INSTANCE_ENCOUNTERS and
// MYTHIC_FLEX_INSTANCES in scripts/fetch-wcl-data.js).

/**
 * @typedef {import('@/composables/useProgression.js').Boss} Boss
 * @typedef {import('@/composables/useProgression.js').Raid} Raid
 */

/** @type {Raid[]} */
export const upcomingRaids = []
