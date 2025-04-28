<template>
  <div class="home-view">
    <h1 class="welcome-heading">Welcome to Aztecs!</h1>
    <p class="who-are-we">
      <b>"Aztecs"</b> are an established, multinational Horde guild based on
      Al’Akir, where we've been the home of more than 160 accounts and over 900
      characters. <br /><br />
      We formed on the <b>9th of September, 2005</b>, making us one of the few
      remaining launch day guilds on Al'Akir. We're from all over Europe - most
      members are in their 20s-30s, although we have several ‘more experienced’
      colleagues :) Many of us have played games together for up to 15 years, as
      the guild/clan previously existed in other MMOs and FPSs. <br /><br />
      Although everyone hasn't been around all that time, we've made many new
      friends along the way, as the server merged with Xavius and Skullcrusher,
      and recently with Burning Legion. By this stage, blood is thicker than
      water ;)
      <br /><br />
      If you can give and take the odd joke, like to try kill raid dragons (or
      do regular Mythic+ dungeoning of any level!), and to make the most of your
      WoW time, feel free to join us! Our raiding history is a long and proud
      one since Vanilla, when we were one of the most active/leading Horde
      raiders on a very active Al'Akir server.
      <br /><br />
      Nowadays, we're more chilled. Our raiding goals are usually to complete
      AOTC/Heroic in good time each tier, then try Mythic when it goes
      cross-realm or if we have enough interest. We know people's time is
      precious, so we want to make the most of the time we spend, whatever it is
      :)
    </p>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  components: {},
  props: {},
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_variables.scss";

.home-view {
  height: 100px;
  background-color: $background-color;

  .welcome-heading {
    font-weight: 800;

  }

  .who-are-we {
    font-size: 1.5em;
    font-weight: 500;
    margin: auto;
    padding: 20px;
    width: 65vw;
    line-height: 1.5;
    text-align: justify;
    font-family: "Cal Sans", sans-serif;

    @media (min-width: 768px) {
      max-width: 66vw;
    }

    @media (min-width: 1200px) {
      max-width: 60vw;
    }
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
