<template>
  <div v-if="progression && !error" class="raiderio-widget">
    <span class="raiderio-label">Live Progression:</span>
    <span class="raiderio-data">{{ formattedProgression }}</span>
    <a
      class="raiderio-link"
      href="https://raider.io/guilds/eu/al-akir/Aztecs"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View guild on Raider.IO"
    >
      Raider.IO
    </a>
  </div>
  <div v-else-if="loading" class="raiderio-widget raiderio-loading">Loading progression...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const CACHE_KEY = 'raiderio_guild_progression'
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

const progression = ref(null)
const loading = ref(true)
const error = ref(false)

const formattedProgression = computed(() => {
  if (!progression.value) return ''
  const entries = Object.entries(progression.value)
  if (entries.length === 0) return ''
  // Show the latest raid (last entry)
  const [raidName, data] = entries[entries.length - 1]
  return `${data.summary} — ${raidName.replace(/-/g, ' ')}`
})

function getCachedData() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function setCachedData(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // Silently fail if sessionStorage is full or unavailable
  }
}

async function fetchProgression() {
  const cached = getCachedData()
  if (cached) {
    progression.value = cached
    loading.value = false
    return
  }

  try {
    const response = await fetch(
      'https://raider.io/api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=raid_progression',
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (data.raid_progression) {
      progression.value = data.raid_progression
      setCachedData(data.raid_progression)
    } else {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProgression()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.raiderio-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.625rem 1rem;
  margin-bottom: 1.125rem;
  border: 1px solid rgba($accent-color, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  font-size: 0.95rem;

  @media (max-width: 600px) {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }
}

.raiderio-label {
  font-weight: 700;
  color: $accent-color;
}

.raiderio-data {
  text-transform: capitalize;
}

.raiderio-link {
  color: $color-light-yellow;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85em;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
}

.raiderio-loading {
  color: #888;
  font-style: italic;
}
</style>
