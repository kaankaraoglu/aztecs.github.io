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
        <RouterLink class="nav-link" to="/" @click="menuOpen = false"
          >Home</RouterLink
        >
        <RouterLink class="nav-link" to="/wow" @click="menuOpen = false"
          >World of Warcraft</RouterLink
        >
        <RouterLink class="nav-link" to="/history" @click="menuOpen = false"
          >History</RouterLink
        >
        <RouterLink class="nav-link" to="/contact" @click="menuOpen = false"
          >Contact</RouterLink
        >
        <svg
          class="discord-svg"
          xmlns="http://www.w3.org/2000/svg"
          height="1.2em"
          viewBox="0 -28.5 256 256"
          preserveAspectRatio="xMidYMid"
          @click="openDiscordInvite"
        >
          <g>
            <path
              class="discord-svg-path"
              d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
              fill="#FFFFFF"
              fill-rule="nonzero"
            ></path>
          </g>
        </svg>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: "HeaderView",
  data() {
    return {
      menuOpen: false,
      splashMessages: [
        "tip to tip",
        "Rule #1: IGNORE Rhys",
        "Blood Price!",
        "DO NOT RELEASE!!!",
        "mxk ydb",
        "Soak the balls!",
      ],
      currentSplash: "",
      splashInterval: null,
    };
  },
  mounted() {
    this.rotateSplash();
    this.splashInterval = setInterval(this.rotateSplash, 3000);
  },
  beforeUnmount() {
    clearInterval(this.splashInterval);
  },
  methods: {
    openDiscordInvite() {
      const discordInviteUrl = "https://discord.gg/GfmnD24VHa";
      window.open(discordInviteUrl, "_blank");
    },
    rotateSplash() {
      const index = Math.floor(Math.random() * this.splashMessages.length);
      this.currentSplash = this.splashMessages[index];
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_variables.scss";

.header-view {
  .logo-wrapper {
    position: relative;
    display: inline-block;

    .logo {
      height: 10em;
      margin-top: 3em;
    }
  }

  .splash-text {
    font-size: 1em;
    font-weight: bold;
    color: #fdbe00;
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
  }

  .nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50px;

    .nav-header {
      display: none;

      @media (max-width: 768px) {
        display: flex;
        width: 100%;
        justify-content: flex-end;
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
          color: #fdbe00;
          transition: color 0.3s ease;
        }
      }

      .discord-svg {
        cursor: pointer;

        .discord-svg-path {
          fill: white;
          transition: fill 0.3s ease;

          &:hover {
            fill: #7289da;
          }
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
        margin-top: 1rem;
        display: none;

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
