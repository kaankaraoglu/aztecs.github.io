<template>
  <a
    v-if="raid"
    :href="profileUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="raiderio-widget"
  >
    <span class="raiderio-label">Current Progression</span>
    <span class="raiderio-bars">
      <span v-if="raid.normal > 0" class="bar normal">
        <span class="bar-fill" :style="{ width: normalPct }"></span>
        <span class="bar-text">{{ raid.normal }}/{{ raid.total }} N</span>
      </span>
      <span v-if="raid.heroic > 0" class="bar heroic">
        <span class="bar-fill" :style="{ width: heroicPct }"></span>
        <span class="bar-text">{{ raid.heroic }}/{{ raid.total }} HC</span>
      </span>
      <span v-if="raid.mythic > 0" class="bar mythic">
        <span class="bar-fill" :style="{ width: mythicPct }"></span>
        <span class="bar-text">{{ raid.mythic }}/{{ raid.total }} M</span>
      </span>
    </span>
  </a>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const CACHE_KEY = 'raiderio_guild_progression'
const CACHE_DURATION = 60 * 60 * 1000
const PROFILE_URL = 'https://raider.io/guilds/eu/alakir/Aztecs'

const profileUrl = PROFILE_URL

/**
 * @typedef {{ total: number, normal: number, heroic: number, mythic: number }} RaidProgress
 */

/** @type {import('vue').Ref<RaidProgress | null>} */
const raid = ref(null)

const normalPct = computed(() =>
  raid.value ? `${(raid.value.normal / raid.value.total) * 100}%` : '0%',
)
const heroicPct = computed(() =>
  raid.value ? `${(raid.value.heroic / raid.value.total) * 100}%` : '0%',
)
const mythicPct = computed(() =>
  raid.value ? `${(raid.value.mythic / raid.value.total) * 100}%` : '0%',
)

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }
    return cached.data
  } catch {
    return null
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // ignore storage errors
  }
}

/** @param {Record<string, { total_bosses: number, normal_bosses_killed: number, heroic_bosses_killed: number, mythic_bosses_killed: number }>} raidProg */
function parseProgression(raidProg) {
  const entries = Object.values(raidProg)
  if (entries.length === 0) return null

  const tier = entries[0]
  return {
    total: tier.total_bosses,
    normal: tier.normal_bosses_killed,
    heroic: tier.heroic_bosses_killed,
    mythic: tier.mythic_bosses_killed,
  }
}

async function fetchProgression() {
  const cached = getCached()
  if (cached) {
    raid.value = cached
    return
  }

  try {
    const res = await fetch(
      'https://raider.io/api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=raid_progression',
    )
    if (!res.ok) return

    const json = await res.json()
    if (!json.raid_progression) return

    const parsed = parseProgression(json.raid_progression)
    if (!parsed || parsed.total === 0) return

    raid.value = parsed
    setCache(parsed)
  } catch {
    // Silently fail
  }
}

onMounted(fetchProgression)
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.raiderio-widget {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.6rem 1.25rem;
  border: 1px solid rgba($accent-color, 0.25);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  text-decoration: none;
  color: inherit;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: rgba($color-yellow, 0.05);
    border-color: rgba($accent-color, 0.5);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
  }
}

.raiderio-label {
  font-size: 0.75em;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.raiderio-bars {
  display: flex;
  gap: 0.5rem;
  flex: 1;

  @media (max-width: 600px) {
    width: 100%;
  }
}

.bar {
  position: relative;
  flex: 1;
  height: 1.6rem;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  min-width: 5rem;

  .bar-fill {
    position: absolute;
    inset: 0;
    border-radius: 6px;
    transition: width 0.6s ease;
  }

  .bar-text {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 0.8em;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  &.normal .bar-fill {
    background: rgba($quality-rare, 0.4);
  }
  &.heroic .bar-fill {
    background: rgba($quality-epic, 0.4);
  }
  &.mythic .bar-fill {
    background: rgba($quality-legendary, 0.4);
  }
}
</style>
