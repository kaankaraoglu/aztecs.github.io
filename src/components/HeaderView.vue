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
        <div
          :class="['hamburger', { open: menuOpen }]"
          role="button"
          tabindex="0"
          :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'"
          :aria-expanded="String(menuOpen)"
          @click="toggleMenu"
          @keydown.enter.prevent="toggleMenu"
          @keydown.space.prevent="toggleMenu"
        >
          <span></span><span></span><span></span>
        </div>
      </div>

      <div :class="['nav-links', { open: menuOpen }]">
        <RouterLink class="nav-link" to="/" @click="menuOpen = false">Home</RouterLink>
        <RouterLink class="nav-link" to="/achievements" @click="menuOpen = false"
          >Achievements</RouterLink
        >
        <RouterLink class="nav-link" to="/raiding" @click="menuOpen = false">Raiding</RouterLink>
        <RouterLink class="nav-link" to="/about" @click="menuOpen = false">About</RouterLink>
        <RouterLink class="nav-link" to="/contact" @click="menuOpen = false">Contact</RouterLink>
        <DiscordIcon @click="openDiscordInvite" />
        <button
          type="button"
          class="theme-toggle"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          :aria-pressed="theme === 'light'"
          @click="onToggleTheme"
        >
          <svg
            v-if="theme === 'dark'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DiscordIcon from '@/components/icons/DiscordIcon.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useTheme } from '@/composables/useTheme'

const { trackEvent } = useAnalytics()
const { theme, toggleTheme } = useTheme()

function onToggleTheme() {
  toggleTheme()
  trackEvent('theme_toggle', { state: theme.value })
}

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
  'We don\'t want "kind", we want pumpers! -Samaar',
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
  trackEvent('click', { link_type: 'discord_invite' })
  const discordInviteUrl = 'https://discord.gg/GfmnD24VHa'
  window.open(discordInviteUrl, '_blank')
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  trackEvent('menu_toggle', { state: menuOpen.value ? 'open' : 'close' })
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

    .logo {
      filter: var(--t-logo-filter, none);
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
    transition: color $duration-normal $ease-default;

    &::after {
      opacity: 1;
      transform: scaleX(1);
      box-shadow: 0 0 8px rgba(var(--t-accent-rgb), 0.4);
    }
  }

  .nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: $space-8 0 0;
    padding-bottom: $space-4;
    @include mobile {
      margin: $space-4 0 0;
      padding-bottom: $space-8;
    }

    .nav-header {
      display: none;

      @include tablet-md {
        display: flex;
        width: 100%;
        justify-content: center;
      }
    }

    .theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: $space-2;
      background: transparent;
      border: 1px solid $color-border;
      border-radius: $radius-md;
      color: $color-text-primary;
      cursor: pointer;
      transition:
        background $duration-fast $ease-default,
        border-color $duration-fast $ease-default,
        color $duration-fast $ease-default;

      &:hover {
        background: $surface-accent-hover;
        border-color: $color-border-hover;
        color: $accent-color;
      }

      &:focus-visible {
        outline: 2px solid $accent-color;
        outline-offset: 2px;
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
        background: $color-text-primary;
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

      &:focus-visible {
        outline: 2px solid $accent-color;
        outline-offset: 4px;
        border-radius: $radius-sm;
      }

      @include tablet-md {
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
        color: $color-text-primary;
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
          transition: color $duration-normal $ease-default;
        }

        &:hover::after {
          opacity: 0.4;
          transform: scaleX(1);
        }
      }

      @include tablet-md {
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
