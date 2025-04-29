<template>
  <div class="header-view">
    <div class="logo-wrapper">
      <img class="logo" alt="Aztecs logo" src="@/assets/images/logo.png" />
    </div>
    <div class="splash-text">{{ currentSplash }}</div>

    <nav class="nav">
      <div class="nav-header">
        <div class="hamburger" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div :class="['nav-links', { open: menuOpen }]">
        <RouterLink class="nav-link" to="/" @click="menuOpen = false">Home</RouterLink>
        <RouterLink class="nav-link" to="/wow" @click="menuOpen = false"
          >World of Warcraft</RouterLink
        >
        <RouterLink class="nav-link" to="/contact" @click="menuOpen = false">Contact</RouterLink>
        <DiscordIcon @click="openDiscordInvite" />
      </div>
    </nav>
  </div>
</template>

<script>
import DiscordIcon from '@/components/icons/DiscordIcon.vue'

export default {
  name: 'HeaderView',
  components: {
    DiscordIcon,
  },
  data() {
    return {
      menuOpen: false,
      splashMessages: [
        'tip to tip',
        'Rule #1: IGNORE Rhys',
        'Blood Price!',
        'DO NOT RELEASE!!!',
        'mxk ydb',
        'Soak the balls!',
      ],
      currentSplash: '',
      splashInterval: null,
    }
  },
  mounted() {
    this.rotateSplash()
    this.splashInterval = setInterval(this.rotateSplash, 3000)
  },
  beforeUnmount() {
    clearInterval(this.splashInterval)
  },
  methods: {
    openDiscordInvite() {
      const discordInviteUrl = 'https://discord.gg/GfmnD24VHa'
      window.open(discordInviteUrl, '_blank')
    },
    rotateSplash() {
      const index = Math.floor(Math.random() * this.splashMessages.length)
      this.currentSplash = this.splashMessages[index]
    },
  },
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.header-view {
  .logo-wrapper {
    position: relative;
    display: inline-block;

    .logo {
      height: 10em;
      margin-top: 1em;
    }
  }

  .splash-text {
    font-size: 1em;
    font-weight: bold;
    color: $accent-color;
    animation: fadeIn 1s ease-in-out;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    margin-bottom: 1em;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .router-link-active {
    color: $accent-color !important;
    transition: color 0.3s ease;

    &:hover {
      color: $accent-color-hover !important;
    }
  }

  .nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2em 0 5em;

    .nav-header {
      display: none;

      @media (max-width: 768px) {
        display: flex;
        width: 100%;
        justify-content: center;
      }
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 4px;
      cursor: pointer;
      padding: 0.5rem;

      span {
        display: block;
        width: 24px;
        height: 3px;
        background: white;
        transition: 0.3s;
      }

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .nav-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 30px;

      .nav-link {
        text-decoration: none;
        color: #fff;
        font-weight: 800;
        font-size: 1.2em;

        &:hover {
          color: $accent-color-hover;
          transition: color 0.3s ease;
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
        margin-top: 0.5rem;
        display: none;
        gap: 5px;

        &.open {
          display: flex;
        }

        .nav-link {
          padding: 0.5rem 0;
        }
      }
    }
  }
}
</style>
