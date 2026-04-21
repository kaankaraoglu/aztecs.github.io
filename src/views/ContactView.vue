<template>
  <div ref="containerRef" class="contact-view content-wrapper">
    <div class="contact-box reveal">
      <h1 class="contact-heading">Contact & Guild Roster</h1>
      <p class="contact-info">
        Reach out to any of the online officers or veterans in-game or on Discord for an invite to
        the guild.
      </p>
      <table class="table">
        <caption class="sr-only">
          Guild contacts and social links
        </caption>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" class="quality-legendary">Guild Master/Figurehead</th>
            <td class="druid">Phruity</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="death-knight">Valorite</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Achievement Officer</th>
            <td class="paladin">Aurielle</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="demon-hunter">Synthia</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="death-knight">Hammeh</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="evoker">Kiyanne</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="mage">Zebron</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="paladin">Petsy</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Sympathy Hire</th>
            <td class="death-knight">Rhysbroo</td>
          </tr>
        </tbody>
      </table>
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
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.contact-view {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding: 2rem 2rem 4rem;
  max-width: 64rem;
  box-sizing: border-box;
  @include mobile {
    padding: 1rem 1rem 3rem;
  }
}

.contact-box {
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-10 $space-12;
  max-width: 780px; // restore previous card width
  width: 100%;
  background: $surface-1;
  transition:
    background $duration-normal $ease-default,
    border-color $duration-normal $ease-default;
  &:hover {
    background: $surface-accent-hover;
    border-color: $color-border-hover;
  }
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  margin: 0 auto; // center inside custom width

  @include tablet {
    padding: $space-8;
  }
  @include mobile {
    padding: $space-6 $space-5;
  }
}

.contact-heading {
  margin: 0 0 1rem;
  font-size: 2.2em;
  font-weight: 800;
  color: $accent-color;
  text-shadow: 0 0 20px rgba($accent-color, 0.3);
  text-align: center;
  @include mobile {
    font-size: 1.6em;
  }
}

.contact-info {
  font-size: 1.3em;
  line-height: 1.5;
  font-weight: 500;
  margin: 0 0 $space-6;
  text-align: center;
  @include mobile {
    font-size: 1.05em;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.05em;
  @include mobile-sm {
    font-size: 0.9em;
  }

  thead th {
    color: $accent-color;
    font-weight: 800;
    text-align: left;
    padding: $space-2 $space-3;
  }

  tbody tr th,
  tbody tr td {
    font-weight: 700;
    padding: $space-1 $space-3;
    text-align: left; /* added to override global center alignment */
  }

  tbody tr:nth-child(even) {
    background: $surface-1;
  }
  tbody tr {
    transition: background $duration-fast $ease-default;
    &:hover {
      background: $surface-2;
    }
  }
}
</style>
