<template>
  <div class="home-view">
    <img class="logo" alt="Aztecs logo" src="@/assets/images/logo.png" />
    <h1 class="welcome-heading">Welcome to Aztecs!</h1>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  props: {},
  methods: {
    openDiscordInvite() {
      const discordInviteUrl = "https://discord.gg/GfmnD24VHa";
      window.open(discordInviteUrl, "_blank");
    },
  },
};
</script>

<style scoped>
.home-view {
  height: 100px;

  .logo {
    height: 12em;
  }

  .welcome-heading {
    font-weight: 800;
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
