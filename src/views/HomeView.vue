<template>
  <div class="home-view">
    <h1 class="welcome-heading">Welcome to Aztecs!</h1>
    <div class="info-boxes">
      <div class="info-box">
        <h2 class="info-box-heading">Liberation of Undermine Progress</h2>
        <table>
          <thead>
            <tr>
              <th class="accent-color">Boss</th>
              <th class="quality-rare difficulty">Normal</th>
              <th class="quality-epic difficulty">Heroic</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td class="boss-name">Vexie Fullthrottle and The Geargrinders</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
            </tr>

            <tr>
              <td class="boss-name">Cauldron of Carnage</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
            </tr>

            <tr>
              <td class="boss-name">Rik Reverb</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
            </tr>

            <tr>
              <td class="boss-name">Stix Bunkjunker</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
            </tr>

            <tr>
              <td class="boss-name">Sprocketmonger Lockenstock</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
            </tr>

            <tr>
              <td class="boss-name">One-Armed Bandit</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
            </tr>

            <tr>
              <td class="boss-name">Mug'Zee</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
            </tr>

            <tr>
              <td class="boss-name">Chrome King Gallywix</td>
              <td class="killed-or-not">💀</td>
              <td class="killed-or-not">💀</td>
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

      <div class="info-box">
        <h2 class="info-box-heading">Requirements for raiding</h2>
        <ul class="raid-requirements">
          <li>
            Sign up for raids on discord #raidcalendar channel. If you don't have access, talk to an
            officer in game or ask in discord.
          </li>
          <li>
            During progression raids, we require everyone to;
            <ul>
              <li>Have a reasonable item level</li>
              <li>
                Have your gear enchanted (We understand that some enchants may be expensive for
                people who don't play much, so we can help with this. Just ask for help in discord
                or guild chat)
              </li>
              <li>
                It is <b>NOT MANDATORY</b> but we appreciate if you are active on comms during the
                raids.
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <p class="who-are-we">
      <b>"Aztecs"</b> are an established, multi-national Horde guild based on Al'Akir, where we've
      been the home of more than 160 accounts and over 900 characters. <br /><br />
      We formed on the <b>9th of September, 2005</b>, making us one of the few remaining launch day
      guilds on Al'Akir. We're from all over Europe - most members are in their 30s-40s, although we
      have several "more experienced" colleagues :) Many of us have played games together for up to
      15 years, as the guild/clan previously existed in other MMOs and FPSs. <br /><br />
      Although everyone hasn't been around all that time, we've made many new friends along the way,
      as the server merged with Xavius and Skullcrusher, and recently with Burning Legion. By this
      stage, blood is thicker than water ;)
      <br /><br />
      If you can give and take the odd joke, like to try kill raid dragons (or do regular Mythic+
      dungeons of any level!), and to make the most of your WoW time, feel free to join us! Our
      raiding history is a long and proud one since Vanilla, when we were one of the most
      active/leading Horde raiders on a very active Al'Akir server.
      <br /><br />
      Nowadays, we're more chilled. Our raiding goals are usually to complete AOTC/Heroic in good
      time each tier, then try Mythic when it goes cross-realm or if we have enough interest. We
      know people's time is precious, so we want to make the most of the time we spend, whatever it
      is :)
    </p>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  components: {},
  props: {},
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.home-view {
  background-color: $background-color;
  margin: auto;
  max-width: 60vw;

  @media (max-width: 1440px) {
    max-width: 80vw;
  }

  @media (max-width: 750px) {
    max-width: 85vw;
  }

  .info-boxes {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: stretch;
    margin-bottom: 3em;
    text-align: left;
    gap: 10px;

    @media (max-width: 1200px) {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 3em;
      text-align: left;
    }

    .raid-schedule {
      p {
        max-width: 32em;
      }
    }

    .info-box {
      border: 1px dashed $accent-color;
      border-radius: 20px;
      padding: 30px;
      margin: 10px;
      display: flex;
      flex-direction: column;

      .info-box-heading {
        color: $accent-color;
        margin-top: 0;
      }

      .raid-requirements {
        max-width: 500px;
        padding: 0;

        li {
          margin-bottom: 1em;
        }
      }

      table {
        width: 100%;

        tr {
          .boss-name {
            font-size: 1em;

            @media (max-width: 1440px) {
              font-size: 1em;
            }

            @media screen and (max-width: 768px) {
              font-size: 0.6em;
            }
          }

          .difficulty {
            font-size: 1.2em;
            text-align: center;
          }

          .killed-or-not {
            font-size: 0.7em;
            text-align: center;
          }
        }
      }

      .raid-day {
        font-size: 1.8em;
        margin: 0;

        @media (max-width: 1440px) {
          font-size: 1em;
        }
      }
    }
  }

  .welcome-heading {
    font-weight: 800;
    font-size: 5em;

    @media (max-width: 1200px) {
      font-size: 2em;
    }
  }

  .who-are-we {
    font-size: 1.5em;
    font-weight: 500;
    margin: auto;
    width: 100%;
    line-height: 1.5;
    text-align: justify;
    font-family: 'Cal Sans', sans-serif;
  }

  .discord-svg {
    fill: white;
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .discord-button:hover {
    background-color: #5b6eae;
    transition: background-color 0.3s ease;
  }
  .discord-button:active {
    background-color: #4e5b8d;
    transition: background-color 0.1s ease;
  }
  .discord-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.5);
  }
  .discord-button:disabled {
    background-color: #4e5b8d;
    cursor: not-allowed;
  }

  .discord-button {
    background-color: #7289da;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 12px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-top: 20px;
  }
}
</style>
