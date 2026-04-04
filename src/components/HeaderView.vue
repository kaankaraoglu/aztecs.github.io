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
        <RouterLink class="nav-link" to="/history" @click="menuOpen = false">History</RouterLink>
        <RouterLink class="nav-link" to="/raiding" @click="menuOpen = false">Raiding</RouterLink>
        <RouterLink class="nav-link" to="/about" @click="menuOpen = false">About</RouterLink>
        <RouterLink class="nav-link" to="/contact" @click="menuOpen = false">Contact</RouterLink>
        <DiscordIcon @click="openDiscordInvite" />
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DiscordIcon from '@/components/icons/DiscordIcon.vue'

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const menuOpen = ref(false)

const splashMessages = [
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
  'Do you have a weapon equipped?',
]

const currentSplash = ref('')
const splashVisible = ref(true)
let splashInterval = null
let shuffledSplashes = shuffleArray(splashMessages)
let splashIndex = 0

function rotateSplash() {
  splashVisible.value = false
  setTimeout(() => {
    splashIndex++
    if (splashIndex >= shuffledSplashes.length) {
      const lastSplash = shuffledSplashes[shuffledSplashes.length - 1]
      shuffledSplashes = shuffleArray(splashMessages)
      if (shuffledSplashes[0] === lastSplash) {
        ;[shuffledSplashes[0], shuffledSplashes[1]] = [shuffledSplashes[1], shuffledSplashes[0]]
      }
      splashIndex = 0
    }
    currentSplash.value = shuffledSplashes[splashIndex]
    splashVisible.value = true
  }, 500)
}

function openDiscordInvite() {
  const discordInviteUrl = 'https://discord.gg/GfmnD24VHa'
  window.open(discordInviteUrl, '_blank')
}

onMounted(() => {
  currentSplash.value = shuffledSplashes[0]
  splashInterval = setInterval(rotateSplash, 3000)
})

onBeforeUnmount(() => {
  clearInterval(splashInterval)
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.header-view {
  .logo-wrapper {
    position: relative;
    display: inline-block;

    .logo {
      height: 14em;
      margin-top: $space-4;
      transition: height $duration-normal $ease-default;
      @include mobile {
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
        border-radius: $radius-sm;
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
    transition: opacity $duration-slow $ease-default;
    @include mobile {
      font-size: 0.75em;
      right: -1rem;
      bottom: 0.25rem;
    }
  }

  .router-link-active {
    color: $accent-color !important;
    transition:
      color $duration-normal $ease-default,
      text-shadow $duration-normal $ease-default;

    &:hover {
      text-shadow: 0 0 12px rgba($accent-color, 0.6);
    }

    &::after {
      opacity: 1;
      transform: scaleX(1);
      box-shadow: 0 0 8px rgba($accent-color, 0.4);
    }
  }

  .nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: $space-8 0 0;
    padding-bottom: $space-12;
    @include mobile {
      margin: $space-4 0 0;
      padding-bottom: $space-8;
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
      padding: $space-2;

      span {
        display: block;
        width: 24px;
        height: 3px;
        background: white;
        transition:
          transform $duration-normal $ease-default,
          opacity $duration-normal $ease-default;
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
      gap: $space-8;

      .nav-link {
        text-decoration: none;
        color: #fff;
        font-weight: 800;
        font-size: 1.2em;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -$space-1;
          left: 0;
          right: 0;
          height: 2px;
          background: $accent-color;
          border-radius: 1px;
          opacity: 0;
          transform: scaleX(0);
          transition:
            opacity $duration-normal $ease-default,
            transform $duration-normal $ease-default;
        }

        &:hover {
          color: $accent-color;
          text-shadow: 0 0 12px rgba($accent-color, 0.6);
          transition:
            color $duration-normal $ease-default,
            text-shadow $duration-normal $ease-default;
        }

        &:hover::after {
          opacity: 0.4;
          transform: scaleX(1);
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
          padding: $space-2 0;
        }

        .nav-link.router-link-active {
          border-left: 3px solid $accent-color;
          padding-left: $space-2;
        }

        .nav-link::after {
          display: none;
        }
      }
    }
  }
}
</style>
