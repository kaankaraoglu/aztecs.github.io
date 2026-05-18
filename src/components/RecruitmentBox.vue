<template>
  <InfoBox v-if="neededClasses.length" no-hover class="recruitment-box">
    <p class="recruitment-label">LOOKING FOR</p>
    <div class="class-list">
      <span v-for="cls in neededClasses" :key="cls.key" :class="['class-tag', cls.cssClass]">
        {{ cls.name }}
      </span>
    </div>
    <router-link to="/next-tier" class="signup-link">Sign up for the next tier</router-link>
  </InfoBox>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useNextTierSignups } from '@/composables/useNextTierSignups.js'
import { useBuffAnalysis } from '@/composables/useBuffAnalysis.js'
import { WOW_CLASSES } from '@/data/wow-classes.js'
import InfoBox from '@/components/InfoBox.vue'

const { submissions, fetchConfig, fetchSubmissions } = useNextTierSignups()
const { missingBuffs } = useBuffAnalysis(submissions)

/** @param {string} key */
function toClassCss(key) {
  return key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}

const neededClasses = computed(() => {
  if (submissions.value.length === 0) return []

  const classKeys = new Set(missingBuffs.value.flatMap((buff) => buff.classes))
  return [...classKeys]
    .filter((key) => WOW_CLASSES[key])
    .sort((a, b) => WOW_CLASSES[a].name.localeCompare(WOW_CLASSES[b].name))
    .map((key) => ({
      key,
      name: WOW_CLASSES[key].name,
      cssClass: toClassCss(key),
    }))
})

onMounted(async () => {
  await Promise.all([fetchConfig(), fetchSubmissions()])
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.recruitment-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
}

.recruitment-label {
  margin: 0;
  font-size: 0.75em;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $color-text-subtle;
}

.class-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-2;
}

.class-tag {
  font-size: 0.9em;
  font-weight: 600;
  padding: $space-1 $space-3;
  border-radius: $radius-md;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid currentColor;
  opacity: 0.9;
}

.signup-link {
  font-size: 0.8em;
  font-weight: 600;
  color: $accent-color;
  text-decoration: none;
  transition: color $duration-fast $ease-default;

  &:hover {
    text-decoration: underline;
  }
}
</style>
