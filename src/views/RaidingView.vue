<template>
  <div ref="containerRef" class="raiding-view content-wrapper">
    <div class="side-by-side">
      <section class="schedule info-box reveal">
        <h2 class="info-box-heading">Raid Schedule</h2>
        <ul>
          <li>Wednesdays 20:00 - 22:00 ST</li>
          <li>Sundays 19:00 - 22:00 ST</li>
        </ul>
        <p class="note">Holiday adjustments are announced in advance.</p>
      </section>

      <section class="loot-section reveal">
        <div class="info-box loot-rules">
          <h2 class="info-box-heading">Loot Rules</h2>
          <ol class="loot-rules-list">
            <li>One loot specialisation per raid (DO NOT switch roles mid-raid)</li>
            <li>
              Your loot spec must match your sign up role in the
              <a
                href="https://discord.com/channels/150712806054821889/784846321332781076"
                target="_blank"
                rel="noopener noreferrer"
                >#raidcalendar</a
              >
              unless you've been asked to switch by an officer, in which case it can be either but
              rule #1 still applies.
            </li>
            <li>
              During the progression raids, we are gearing up your main raid spec, not M+ spec. This
              applies until we go into farming mode, where everything becomes free for all including
              off-spec and transmogs.
            </li>
          </ol>
          <p>Feel free to talk to any of the officers if you have any questions or objections.</p>
        </div>
      </section>

      <section class="requirements info-box reveal">
        <h2 class="info-box-heading">Requirements & Expectations</h2>
        <ul class="raid-requirements">
          <li>
            Sign up for raids on Discord
            <a
              href="https://discord.com/channels/150712806054821889/784846321332781076"
              target="_blank"
              rel="noopener noreferrer"
              >#raidcalendar</a
            >
            channel. If you don't have access, talk to an officer in game or ask in Discord.
          </li>
          <li>
            During progression raids, we require everyone to:
            <ul>
              <li>Have a reasonable item level (+-10 of group average)</li>
              <li>
                Have your gear enchanted (We understand some enchants may be expensive for people
                who don't play much, so we can help. Just ask in Discord or guild chat.)
              </li>
              <li>
                It is <b>NOT MANDATORY</b> but we appreciate if you are active on comms during the
                raids.
              </li>
            </ul>
          </li>
        </ul>
      </section>
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
@use '@/assets/styles/_info-box.scss';
@use '@/assets/styles/tokens' as *;
@use 'sass:color';

.raiding-view {
  position: relative;
  z-index: 10;
  margin: 0 auto;
  text-align: left;
  background-color: transparent;

  p,
  li {
    font-size: 1.1em;
    line-height: 1.5;
  }

  .info-box {
    padding: $space-8;
    margin: $space-2 0 $space-8;
    display: flex;
    flex-direction: column;
  }
  .progression {
    min-width: 0;
  }

  .side-by-side {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: $space-6;
    align-items: stretch;

    > * {
      display: flex;
      flex-direction: column;
    }

    .info-box {
      flex: 1;
    }

    @include desktop-sm {
      grid-template-columns: 1fr 1fr;
    }
    @include tablet {
      grid-template-columns: 1fr;
    }
  }

  ul {
    padding-left: $space-5;
  }
  .note {
    font-style: italic;
    color: color.adjust($accent-color, $lightness: 10%);
  }

  .schedule {
    margin-bottom: $space-8;
  }
  .loot-rules {
    .loot-rules-list {
      margin: 0;
      padding-left: $space-5;
      li {
        margin-bottom: $space-3;
      }
    }
  }
  .raid-requirements {
    max-width: none;
    width: 100%;
    padding-left: $space-5;
    list-style: disc outside;
    word-break: normal;
    white-space: normal;
    li {
      margin-bottom: 1rem;
    }
    ul {
      list-style: circle;
      margin-top: 0.5rem;
      padding-left: $space-5;
    }
  }

  a {
    font-weight: 700;
    color: $color-yellow;
  }
  a:visited {
    color: $color-yellow;
  }
  a:hover {
    text-shadow: 0 0 12px rgba($accent-color, 0.6);
  }

  .requirements {
    margin-bottom: $space-8;
  }
}
</style>
