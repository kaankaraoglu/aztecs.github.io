<template>
  <div v-if="progression" class="raiderio-widget">
    <p class="raiderio-label">Live Raid Progression</p>
    <p class="raiderio-data">{{ progression }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const progression = ref(null)

const CACHE_KEY = 'raiderio_guild_progression'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

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

async function fetchProgression() {
  const cached = getCached()
  if (cached) {
    progression.value = cached
    return
  }

  try {
    const res = await fetch(
      'https://raider.io/api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=raid_progression',
    )
    if (!res.ok) return

    const json = await res.json()
    const raidProg = json.raid_progression
    if (!raidProg) return

    // Get the latest raid tier (first key)
    const raids = Object.entries(raidProg)
    if (raids.length === 0) return

    const [raidName, data] = raids[0]
    const summary = `${raidName}: ${data.summary}`
    progression.value = summary
    setCache(summary)
  } catch {
    // Silently fail — widget just won't show
  }
}

onMounted(fetchProgression)
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.raiderio-widget {
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba($accent-color, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);

  .raiderio-label {
    margin: 0 0 0.25rem;
    font-size: 0.85em;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .raiderio-data {
    margin: 0;
    font-size: 1.1em;
    color: $color-yellow;
    font-weight: 600;
  }
}
</style>
