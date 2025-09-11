<template>
  <div class="home-view">
    <h1 class="welcome-heading">Welcome to Aztecs!</h1>
    <div class="content-wrapper">
      <div class="top-boxes">
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
        <div class="info-box raid-schedule">
          <h2 class="info-box-heading">Raid Schedule</h2>
          <p>2 raids/week</p>
          <p class="raid-day">Wednesdays at 20:00 - 22:00 ST</p>
          <p class="raid-day">Sundays at 19:00 - 22:00 ST</p>
          <p>
            We sometimes skip raids that correspond with holidays <br />but they are announced in
            advance.
          </p>
          <p>
            Every tier, we start with normals, switch to heroics when we feel like we can manage and
            after the AOTC, we do an achievement run.
          </p>
        </div>
      </div>
      <div class="about-box">
        <p class="who-are-we">
          <b>"Aztecs"</b> are an established, multi-national Horde guild based on Al'Akir, where
          we've been the home of more than 160 accounts and over 900 characters. <br /><br />
          We formed on the <b>9th of September, 2005</b>, making us one of the few remaining launch
          day guilds on Al'Akir. We're from all over Europe - most members are in their 30s-40s,
          although we have several "more experienced" colleagues :) Many of us have played games
          together for up to 15 years, as the guild/clan previously existed in other MMOs and FPSs.
          <br /><br />
          Although everyone hasn't been around all that time, we've made many new friends along the
          way, as the server merged with Xavius and Skullcrusher, and recently with Burning Legion.
          By this stage, blood is thicker than water ;)
          <br /><br />
          If you can give and take the odd joke, like to try kill raid dragons (or do regular
          Mythic+ dungeons of any level!), and to make the most of your WoW time, feel free to join
          us! Our raiding history is a long and proud one since Vanilla, when we were one of the
          most active/leading Horde raiders on a very active Al'Akir server.
          <br /><br />
          Nowadays, we're more chilled. Our raiding goals are usually to complete AOTC/Heroic in
          good time each tier, then try Mythic when it goes cross-realm or if we have enough
          interest. We know people's time is precious, so we want to make the most of the time we
          spend, whatever it is :)
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { tierName, bosses, killMark } from '@/data/progression.js'
export default {
  name: 'HomeView',
  data() {
    return { tierName, bosses }
  },
  methods: { killMark },
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
.home-view {
  background-color: $background-color;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  max-width: 100%;

  @media (max-width: 700px) {
    padding: 0 1.2rem 2.5rem;
  }

  .welcome-heading {
    font-weight: 800;
    font-size: 4.5em;
    margin: 0.3em 0 0.4em;
    @media (max-width: 1200px) {
      font-size: 2.4em;
    }
  }

  .top-boxes {
    display: flex;
    gap: 18px;
    align-items: stretch;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .top-boxes .info-box {
    flex: 1 1 250px;
    min-width: 250px;
    text-align: left; /* ensure small boxes content is left-aligned */
  }
  @media (max-width: 900px) {
    .top-boxes {
      flex-direction: column;
    }
  }

  .info-box {
    border: 1px dashed $accent-color;
    border-radius: 20px;
    padding: 24px 26px;
    background: rgba(255, 255, 255, 0.02);
    box-sizing: border-box;
  }
  .info-box-heading {
    color: $accent-color;
    margin-top: 0;
    text-align: left;
  }

  .progression table {
    width: 100%;
    border-collapse: collapse;
  }
  .progression table tr .boss-name {
    font-size: 0.95em;
    @media (max-width: 700px) {
      font-size: 0.7em;
    }
  }
  .progression table tr .difficulty {
    font-size: 1.15em;
    text-align: center;
  }
  .progression table tr .killed-or-not {
    font-size: 0.7em;
    text-align: center;
  }
  .progression table th:first-child {
    text-align: left;
  }

  .raid-schedule .raid-day {
    font-size: 1.3em;
    margin: 0;
    @media (max-width: 900px) {
      font-size: 1.05em;
    }
  }
  .raid-schedule p {
    max-width: 30em;
    text-align: left;
  }

  .about-box {
    border: 2px dotted $color-yellow;
    border-radius: 20px;
    padding: 32px 40px;
    background: rgba($color-yellow, 0.05);
    text-align: center;
    line-height: 1.55;
    margin-top: 18px;
    @media (max-width: 900px) {
      padding: 28px 32px;
    }
    @media (max-width: 600px) {
      padding: 22px 20px;
    }
    .who-are-we {
      margin: 0;
      font-size: 1.25em;
      @media (max-width: 700px) {
        font-size: 1.05em;
      }
    }
  }
}
</style>
