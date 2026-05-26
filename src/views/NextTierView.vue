<template>
  <div ref="containerRef" class="next-tier-view content-wrapper">
    <TierHeader
      class="reveal"
      :tier-name="config.tierName ?? 'Next Tier Signups'"
      :is-open="config.isOpen"
      :signup-count="submissions.length"
    />

    <FlexMythicReadiness class="reveal" :signup-count="submissions.length" />

    <BuffCoverage class="reveal" :covered-buffs="coveredBuffs" :missing-buffs="missingBuffs" />

    <div v-if="error" class="error-banner reveal">
      {{ error }}
    </div>

    <div class="signup-role-row reveal">
      <SignupForm
        :current-user="currentUser"
        :existing-submission="existingSubmission"
        :is-open="config.isOpen"
        :discord-auth-url="getDiscordAuthUrl()"
        @submit="submitSignup"
        @delete="deleteSignup"
        @sign-out="signOut"
      />
      <RoleBalance :role-counts="roleCounts" />
    </div>

    <SignupTable class="reveal" :submissions="submissions" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal.js'
import { useNextTierSignups } from '@/composables/useNextTierSignups.js'
import { useBuffAnalysis } from '@/composables/useBuffAnalysis.js'
import TierHeader from '@/components/next-tier/TierHeader.vue'
import BuffCoverage from '@/components/next-tier/BuffCoverage.vue'
import RoleBalance from '@/components/next-tier/RoleBalance.vue'
import SignupForm from '@/components/next-tier/SignupForm.vue'
import SignupTable from '@/components/next-tier/SignupTable.vue'
import FlexMythicReadiness from '@/components/next-tier/FlexMythicReadiness.vue'

const containerRef = ref(null)
useScrollReveal(containerRef)

const {
  submissions,
  config,
  currentUser,
  existingSubmission,
  error,
  handleAuthCallback,
  fetchConfig,
  fetchSubmissions,
  submitSignup,
  deleteSignup,
  signOut,
  getDiscordAuthUrl,
} = useNextTierSignups()

const { coveredBuffs, missingBuffs, roleCounts } = useBuffAnalysis(submissions)

onMounted(async () => {
  handleAuthCallback()
  await Promise.all([fetchConfig(), fetchSubmissions()])
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.next-tier-view {
  display: flex;
  flex-direction: column;
  gap: $space-6;
  position: relative;
  z-index: 10;
}

.signup-role-row {
  display: flex;
  gap: $space-6;
  align-items: flex-start;

  > :first-child {
    flex: 7;
    min-width: 0;
  }

  > :last-child {
    flex: 13;
    min-width: 0;
  }

  > :only-child {
    flex: 1;
    width: 100%;
  }

  @include tablet {
    flex-direction: column;

    > * {
      width: 100%;
    }
  }
}

.error-banner {
  padding: $space-3 $space-4;
  background: rgba(255, 80, 80, 0.1);
  border: 1px solid rgba(255, 80, 80, 0.3);
  border-radius: $radius-md;
  color: #ff5050;
  font-size: 0.875rem;
  text-align: center;
}
</style>
