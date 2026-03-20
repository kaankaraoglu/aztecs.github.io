<template>
  <div class="raiding-view content-wrapper">
    <section class="progression">
      <div class="progression-boxes">
        <RaidProgressionBox
          v-for="raid in raids"
          :key="raid.name"
          :raid="raid"
          class="info-box progression"
        />
      </div>
    </section>

    <FadingDivider />

    <section class="loot-section">
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

    <FadingDivider />

    <section class="requirements info-box">
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
              Have your gear enchanted (We understand some enchants may be expensive for people who
              don't play much, so we can help. Just ask in Discord or guild chat.)
            </li>
            <li>
              It is <b>NOT MANDATORY</b> but we appreciate if you are active on comms during the
              raids.
            </li>
          </ul>
        </li>
      </ul>
    </section>

    <FadingDivider />

    <section class="schedule info-box">
      <h2 class="info-box-heading">Raid Schedule</h2>
      <ul>
        <li>Wednesdays 20:00 - 22:00 ST</li>
        <li>Sundays 19:00 - 22:00 ST</li>
      </ul>
      <p class="note">Holiday adjustments are announced in advance.</p>
    </section>
  </div>
</template>

<script setup>
import { useRaiderIO } from '@/composables/useRaiderIO.js'
import RaidProgressionBox from '@/components/RaidProgressionBox.vue'
import FadingDivider from '@/components/FadingDivider.vue'

const { raids } = useRaiderIO()
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/_info-box.scss';
@use 'sass:color';

.raiding-view {
  margin: 0 auto;
  text-align: left;
  background-color: $background-color;

  p,
  li {
    font-size: 1.1em;
    line-height: 1.5;
  }

  .info-box {
    padding: 1.875rem;
    margin: 0.625rem 0 1.875rem;
    display: flex;
    flex-direction: column;
  }
  .progression-boxes .info-box {
    margin: 0.625rem 0;
  }
  .progression {
    min-width: 0;
  }

  ul {
    padding-left: 1.2rem;
  }
  .note {
    font-style: italic;
    color: color.adjust($accent-color, $lightness: 10%);
  }

  .progression-boxes {
    display: flex;
    flex-direction: row;
    gap: 0.625rem;
    align-items: stretch;
    flex-wrap: wrap;
    @media (max-width: 900px) {
      flex-direction: column;
    }
  }
  .schedule {
    margin-bottom: 1.875rem;
  }
  .loot-rules {
    .loot-rules-list {
      margin: 0;
      padding-left: 1.2rem;
      li {
        margin-bottom: 0.8rem;
      }
    }
  }
  .raid-requirements {
    max-width: none;
    width: 100%;
    padding-left: 1.2rem;
    list-style: disc outside;
    word-break: normal;
    white-space: normal;
    li {
      margin-bottom: 1rem;
    }
    ul {
      list-style: circle;
      margin-top: 0.5rem;
      padding-left: 1.2rem;
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
    color: $accent-color-hover;
  }

  .progression-boxes > .progression {
    flex: 1 1 250px;
    min-width: 0;
  }
  .requirements {
    margin-bottom: 1.875rem;
  }
}
</style>
