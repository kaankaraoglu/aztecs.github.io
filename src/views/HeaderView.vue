<template>
  <div class="header-view">
    <div class="logo-wrapper">
      <RouterLink to="/" aria-label="Go to home" class="logo-home-link" @click="menuOpen = false">
        <img class="logo" alt="Aztecs logo" src="@/assets/images/logo.png" />
      </RouterLink>
      <div class="splash-text" :style="{ opacity: splashVisible ? 1 : 0 }">{{ currentSplash }}</div>
    </div>

    <nav class="nav">
      <div class="nav-header">
        <div :class="['hamburger', { open: menuOpen }]" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div :class="['nav-links', { open: menuOpen }]">
        <RouterLink class="nav-link" to="/" @click="menuOpen = false">Home</RouterLink>
        <RouterLink class="nav-link" to="/achievements" @click="menuOpen = false"
          >Achievements</RouterLink
        >
        <RouterLink class="nav-link" to="/raiding" @click="menuOpen = false">Raiding</RouterLink>
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
        'Tip to tip',
        'Rule #1: IGNORE Rhys',
        'Blood Price!',
        'DO NOT RELEASE!!!',
        'mxk ydb',
        'Soak the balls!',
        'What do you mean "you people"?',
        'Just a gentle jerk',
        'Get sucked',
        'Nilay NO!!!',
        'Proud on you',
        'Damit Delmos!',
        "My wife is home, let's kill the bitch!",
      ],
      currentSplash: '',
      splashVisible: true,
      splashInterval: null,
      shuffledSplashes: [],
      splashIndex: 0,
    }
  },
  mounted() {
    this.shuffledSplashes = this.shuffleArray(this.splashMessages)
    this.splashIndex = 0
    this.currentSplash = this.shuffledSplashes[this.splashIndex]
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
    shuffleArray(array) {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },
    nextSplash() {
      this.splashIndex++
      if (this.splashIndex >= this.shuffledSplashes.length) {
        const lastItem = this.shuffledSplashes[this.shuffledSplashes.length - 1]
        let newShuffle = this.shuffleArray(this.splashMessages)
        while (newShuffle[0] === lastItem && this.splashMessages.length > 1) {
          newShuffle = this.shuffleArray(this.splashMessages)
        }
        this.shuffledSplashes = newShuffle
        this.splashIndex = 0
      }
      return this.shuffledSplashes[this.splashIndex]
    },
    rotateSplash() {
      this.splashVisible = false
      setTimeout(() => {
        this.currentSplash = this.nextSplash()
        this.splashVisible = true
      }, 500)
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
      height: 14em;
      margin-top: 1rem;
      @media (max-width: 600px) {
        height: 8em;
      }
    }

    .logo-home-link {
      display: inline-block;
      line-height: 0; /* remove extra inline spacing */
      cursor: pointer;
      text-decoration: none;
      outline: none;

      &:focus-visible {
        outline: 2px solid $accent-color;
        outline-offset: 4px;
        border-radius: 4px;
      }
    }
  }

  .splash-text {
    position: absolute;
    bottom: 0.5rem;
    right: -2rem;
    font-size: 1em;
    font-weight: bold;
    color: $color-yellow;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    transform: rotate(-8deg);
    transform-origin: center center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
    transition: opacity 0.5s ease;
    @media (max-width: 600px) {
      font-size: 0.75em;
      right: -1rem;
      bottom: 0.25rem;
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
    margin: 2rem 0;
    @media (max-width: 600px) {
      margin: 1rem 0;
    }

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
        transition:
          transform 0.3s ease,
          opacity 0.3s ease;
      }

      &.open span:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      &.open span:nth-child(2) {
        opacity: 0;
      }
      &.open span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .nav-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.875rem;

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
        gap: 0.3125rem;

        &.open {
          display: flex;
        }

        .nav-link {
          padding: 0.5rem 0;
        }

        .nav-link.router-link-active {
          border-left: 3px solid $accent-color;
          padding-left: 0.5rem;
        }
      }
    }
  }
}
</style>
