<template>
  <div ref="containerRef" class="about-view content-wrapper">
    <h1 class="page-heading">About Us</h1>
    <p class="intro-text">
      <b>"Aztecs"</b> are an established, multi-national Horde guild based on Al'Akir, where we've
      been the home of more than 160 accounts and over 900 characters.
    </p>

    <div class="about-cards">
      <div class="about-card reveal">
        <h2 class="info-box-heading">Our History</h2>
        <p>
          We formed on the <b>9th of September, 2005</b>, making us one of the few remaining launch
          day guilds on Al'Akir. We're from all over Europe — most members are in their 30s-40s.
          Many of us have played games together for up to 15 years, as the guild previously existed
          in other MMOs and FPSs.
        </p>
        <p>
          Although everyone hasn't been around all that time, we've made many new friends along the
          way, as the server merged with Xavius, Skullcrusher, and recently Burning Legion. By this
          stage, blood is thicker than water ;)
        </p>
      </div>

      <div class="about-card reveal">
        <h2 class="info-box-heading">What We Do</h2>
        <p>
          Our raiding history is long and proud since Vanilla. Nowadays, we're more chilled — our
          goals are usually to complete AOTC/Heroic each tier, then try Mythic when it goes
          cross-realm or if we have enough interest.
        </p>
        <p>
          If you can give and take the odd joke, like to try kill raid dragons (or do regular
          Mythic+ dungeons of any level!), and want to make the most of your WoW time — feel free to
          join us! We know people's time is precious, so we want to make the most of it :)
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal.js'

const containerRef = ref(null)
useScrollReveal(containerRef)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/tokens' as *;

.about-view {
  position: relative;
  z-index: 10;
  text-align: center;
}

.page-heading {
  color: $accent-color;
  text-shadow: 0 0 20px rgba($accent-color, 0.3);
  font-size: 2.5em;
  margin: 0 0 $space-4;

  @include mobile {
    font-size: 1.8em;
  }
}

.intro-text {
  font-size: 1.2em;
  line-height: 1.6;
  color: $color-text-muted;
  max-width: 50em;
  margin: 0 auto $space-8;

  @include mobile {
    font-size: 1.05em;
  }
}

.about-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-6;
  text-align: left;

  @include tablet {
    grid-template-columns: 1fr;
  }
}

.about-card {
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-6 $space-8;
  background: $surface-1;
  line-height: 1.6;
  transition:
    background $duration-normal $ease-default,
    border-color $duration-normal $ease-default;

  &:hover {
    background: $surface-accent-hover;
    border-color: $color-border-hover;
  }

  @include mobile {
    padding: $space-4 $space-6;
  }

  p {
    margin: 0 0 $space-4;
    color: $color-text-muted;
    font-size: 1.05em;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
