<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <img src="@/assets/images/logo.png" alt="Aztecs" class="footer-logo" />
      </div>
      <div class="footer-links">
        <h4 class="footer-heading">Quick Links</h4>
        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/raiding">Raiding</RouterLink>
          <RouterLink to="/achievements">Achievements</RouterLink>
          <!-- <RouterLink to="/history">History</RouterLink> -->
          <RouterLink to="/in-memoriam">In Memoriam</RouterLink>
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
        </nav>
      </div>
      <div class="footer-social">
        <h4 class="footer-heading">Community</h4>
        <nav>
          <a href="https://discord.gg/GfmnD24VHa" target="_blank" rel="noopener">Discord</a>
          <a
            href="https://www.warcraftlogs.com/guild/eu/alakir/aztecs"
            target="_blank"
            rel="noopener"
            >Warcraft Logs</a
          >
          <a href="https://raider.io/guilds/eu/alakir/Aztecs" target="_blank" rel="noopener"
            >Raider.IO</a
          >
        </nav>
      </div>
    </div>
    <p class="footer-copyright">&copy; {{ new Date().getFullYear() }} Aztecs - Al'Akir (EU)</p>
  </footer>
</template>

<script setup></script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/tokens' as *;

.footer {
  width: 100%;
  background: $surface-1;
  border-top: 1px solid $color-border;
  padding: $space-8 $space-8 $space-12;
  box-sizing: border-box;
}

.footer-content {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: $space-12;
  max-width: 60rem;
  margin: 0 auto $space-8;
  align-items: start;

  @include tablet {
    grid-template-columns: 1fr 1fr;
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: $space-6;
    text-align: center;
  }
}

.footer-logo {
  height: 5em;
  opacity: 0.7;
  filter: var(--t-logo-filter, none);

  @include mobile {
    margin: 0 auto;
    display: block;
  }

  @include tablet {
    display: none;
  }
}

.footer-heading {
  font-size: 0.8em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $color-text-muted;
  margin: 0 0 $space-3;
}

.footer-links nav,
.footer-social nav {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  a {
    color: $color-text-muted;
    text-decoration: none;
    font-size: 0.9em;
    transition: color $duration-fast $ease-default;

    &:hover {
      color: $accent-color;
    }
  }
}

.footer-copyright {
  text-align: center;
  margin: 0;
  font-size: 0.85em;
  color: $color-text-subtle;
}
</style>
