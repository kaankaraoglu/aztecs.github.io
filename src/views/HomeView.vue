<template>
  <div ref="containerRef" class="home-view">
    <section class="hero-section">
      <h1 class="welcome-heading">Welcome to Aztecs!</h1>
      <p class="hero-tagline">
        An established, multi-national Horde guild on Al'Akir — raiding since 2005.
      </p>
    </section>
    <div class="content-wrapper">
      <div class="top-boxes">
        <RaidProgressionBox
          :raids="raids"
          :summary="summary"
          :latest-report="latestReport"
          class="info-box info-box--no-hover"
        />
        <MythicPlusBox v-if="hasMpData" class="reveal" />
      </div>
      <template v-if="hasStatsData">
        <FadingDivider />
        <p class="section-label">TIER STATS</p>
        <RaidStatsBox class="reveal" />
      </template>
      <FadingDivider />
      <p class="section-label">LATEST ACHIEVEMENTS</p>
      <div class="latest-achievements">
        <div v-for="kill in latestKills" :key="kill.raidName" class="latest-achievement reveal">
          <p class="achievement-name">{{ kill.raidName }}</p>
          <img
            :src="kill.imageUrl"
            :alt="kill.raidName"
            class="achievement-image"
            @click="lightboxSrc = kill.imageUrl"
          />
        </div>
      </div>
      <ImageLightbox
        :open="!!lightboxSrc"
        :src="lightboxSrc"
        alt="Achievement screenshot"
        @close="lightboxSrc = ''"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { kills } from '@/data/kills.js'
import { useProgression } from '@/composables/useProgression.js'
import { useMythicPlus } from '@/composables/useMythicPlus.js'
import { useRaidStats } from '@/composables/useRaidStats.js'
import { useScrollReveal } from '@/composables/useScrollReveal.js'
import FadingDivider from '@/components/FadingDivider.vue'
import RaidProgressionBox from '@/components/RaidProgressionBox.vue'
import MythicPlusBox from '@/components/MythicPlusBox.vue'
import RaidStatsBox from '@/components/RaidStatsBox.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'

const containerRef = ref(null)
useScrollReveal(containerRef)

const { raids, summary, latestReport } = useProgression()
const { hasData: hasMpData } = useMythicPlus()
const { hasData: hasStatsData } = useRaidStats()
const latestKills = kills.slice(0, 2)
const lightboxSrc = ref('')
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/_info-box.scss';
@use '@/assets/styles/tokens' as *;
.home-view {
  background-color: $background-color;
  margin: 0 auto;
  padding: 0 $space-8 $space-12;
  max-width: 100%;

  @include tablet {
    padding: 0 1.2rem 2.5rem;
  }

  .section-label {
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $color-text-subtle;
    margin: 0 0 $space-4;
  }

  .hero-section {
    text-align: center;
  }

  .welcome-heading {
    font-weight: 800;
    font-size: 4.5em;
    margin: $space-1 0 $space-2;
    @include desktop-sm {
      font-size: 2.4em;
    }
    @include tablet {
      font-size: 3em;
    }
    @include mobile-sm {
      font-size: 1.8em;
    }
  }

  .hero-tagline {
    font-size: 1.2em;
    color: $color-text-muted;
    margin: 0 0 $space-8;

    @include mobile {
      font-size: 1em;
    }
  }

  .top-boxes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-6;
    align-items: stretch;

    @include tablet {
      grid-template-columns: 1fr;
    }
  }

  .latest-achievements {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-6;

    @include tablet {
      grid-template-columns: 1fr;
    }

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  .latest-achievement {
    text-align: center;
    .achievement-name {
      font-size: 1.3em;
      margin: 0 0 0.75rem;
      color: $color-yellow;
      @include mobile {
        font-size: 1.05em;
      }
    }
    .achievement-image {
      width: 100%;
      border-radius: $radius-lg;
      border: 1px solid rgba($accent-color, 0.3);
      cursor: zoom-in;
    }
  }
}
</style>
