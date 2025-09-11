<template>
  <div class="raiding-view content-wrapper">
    <h1 class="heading">Raiding</h1>
    <section class="intro">
      <p>
        Welcome to the Aztecs raiding page. Here you'll find detailed information about our current
        raid tier, loot rules, raid schedule, and requirements & expectations for raiders.
      </p>
      <!-- This page can expand over time with logs, sign-up links, and strategy
        resources. -->
    </section>
    <section class="progression">
      <div class="progression-boxes">
        <div class="info-box progression">
          <h2 class="info-box-heading">{{ tierName }}</h2>
          <table>
            <thead>
              <tr>
                <th class="accent-color">Boss</th>
                <th class="quality-rare difficulty">N</th>
                <th class="quality-epic difficulty">HC</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="boss in bosses" :key="boss.name">
                <td class="boss-name">{{ boss.name }}</td>
                <td class="killed-or-not">{{ killMark(boss.normal) }}</td>
                <td class="killed-or-not">{{ killMark(boss.heroic) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

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
      </div>
    </section>

    <div class="support-boxes">
      <section class="schedule info-box">
        <h2 class="info-box-heading">Raid Schedule</h2>
        <ul>
          <li>Wednesdays 20:00 - 22:00 ST</li>
          <li>Sundays 19:00 - 22:00 ST</li>
        </ul>
        <p class="note">Holiday adjustments are announced in advance.</p>
      </section>

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

<script>
import { tierName, bosses, killMark } from '@/data/progression.js'
export default {
  name: 'RaidingView',
  data() {
    return {
      tierName,
      bosses,
    }
  },
  methods: {
    killMark,
  },
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use 'sass:color';

.raiding-view {
  margin: 0 auto;
  text-align: left;
  background-color: $background-color;

  .heading {
    font-size: 4em;
    font-weight: 800;
    margin: 0 0 0.5em;
    @media (max-width: 1200px) {
      font-size: 2.2em;
    }
  }
  .section-title {
    color: $accent-color;
    margin-top: 2em;
  }
  p,
  li {
    font-size: 1.1em;
    line-height: 1.5;
  }
  .intro p {
    font-size: 1.7em;
    line-height: 1.6;
  }

  .info-box {
    border: 1px dashed $accent-color;
    border-radius: 20px;
    padding: 30px;
    margin: 10px 0 30px;
    display: flex;
    flex-direction: column;
  }
  .progression-boxes .info-box {
    margin: 10px 0 10px;
  }
  .info-box-heading {
    color: $accent-color;
    margin-top: 0;
  }
  .progression {
    min-width: 20em;
  }

  table {
    width: 100%;
  }
  table tr .boss-name {
    font-size: 1em;
    @media (max-width: 1440px) {
      font-size: 1em;
    }
    @media (max-width: 768px) {
      font-size: 0.6em;
    }
  }
  table tr .difficulty {
    font-size: 1.2em;
    text-align: center;
  }
  table tr .killed-or-not {
    font-size: 0.7em;
    text-align: center;
  }

  ul {
    padding-left: 1.2em;
  }
  .note {
    font-style: italic;
    color: color.adjust($accent-color, $lightness: 10%);
  }

  .progression-boxes {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: stretch;
    flex-wrap: nowrap;
    @media (max-width: 1200px) {
      flex-direction: column;
    }
  }
  .support-boxes {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: stretch;
    flex-wrap: nowrap;
    margin-bottom: 30px;
    @media (max-width: 1200px) {
      flex-direction: column;
    }
  }
  .loot-rules {
    .loot-rules-list {
      margin: 0;
      padding-left: 1.2em;
      li {
        margin-bottom: 0.8em;
      }
    }
  }
  .raid-requirements {
    max-width: none;
    width: 100%;
    padding-left: 1.2em;
    list-style: disc outside;
    word-break: normal;
    white-space: normal;
    li {
      margin-bottom: 1em;
    }
    ul {
      list-style: circle;
      margin-top: 0.5em;
      padding-left: 1.2em;
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
    flex: 0 0 35%;
  }
  .progression-boxes > .loot-rules {
    flex: 1 1 0;
  }
  .support-boxes > .schedule {
    flex: 0 0 35%;
  }
  .support-boxes > .requirements {
    flex: 1 1 0;
  }
}
</style>
