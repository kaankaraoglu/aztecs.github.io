<template>
  <Card class="signup-form">
    <CardContent class="p-6">
      <h2 class="section-title">Your Signup</h2>

      <!-- Not signed in -->
      <div v-if="!currentUser && isOpen" class="auth-prompt">
        <p class="auth-text">Sign in with Discord to submit your signup for next tier.</p>
        <Button as="a" :href="discordAuthUrl" class="discord-btn">
          <svg class="discord-icon" width="18" height="14" viewBox="0 0 71 55" fill="currentColor">
            <path
              d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 5a.2.2 0 00-.1 0A59.7 59.7 0 00.3 45.4a.2.2 0 000 .2A58.7 58.7 0 0018 55a.2.2 0 00.2-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.6.2.2 0 010-.4c.4-.3.7-.6 1.1-.8a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0c.3.3.7.6 1 .9a.2.2 0 010 .3 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.4 47.2 47.2 0 003.6 5.8.2.2 0 00.2.1A58.5 58.5 0 0070.3 45.6a.2.2 0 000-.2A59.2 59.2 0 0060.2 5a.2.2 0 00-.1 0zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"
            />
          </svg>
          Sign in with Discord
        </Button>
      </div>

      <!-- Signed in, has existing submission -->
      <div v-else-if="currentUser && existingSubmission && !editing" class="existing-submission">
        <div class="user-identity">
          <span class="discord-avatar">{{
            currentUser.discordUsername.charAt(0).toUpperCase()
          }}</span>
          <span class="discord-name">{{ currentUser.discordUsername }}</span>
          <button class="sign-out-link" @click="$emit('signOut')">Sign out</button>
        </div>
        <div class="submission-display">
          <span :class="toClassColorCss(existingSubmission.className)" class="char-name">{{
            existingSubmission.characterName
          }}</span>
          <span class="spec-info">{{ specDisplayName }} · {{ roleDisplayName }}</span>
          <!-- Editing or removing needs an open tier; the worker rejects both
               once signups close, and clicking Edit used to drop the user into
               the "closed" branch with their signup hidden and no way back. -->
          <div v-if="isOpen" class="submission-actions">
            <Button variant="outline" size="sm" @click="startEditing">Edit</Button>
            <Button variant="destructive" size="sm" @click="$emit('delete')">Remove</Button>
          </div>
        </div>
      </div>

      <!-- Signed in, form (new or editing) -->
      <div v-else-if="currentUser && isOpen" class="form-area">
        <div class="user-identity">
          <span class="discord-avatar">{{
            currentUser.discordUsername.charAt(0).toUpperCase()
          }}</span>
          <span class="discord-name">{{ currentUser.discordUsername }}</span>
          <button class="sign-out-link" @click="$emit('signOut')">Sign out</button>
        </div>
        <form class="signup-fields" @submit.prevent="handleSubmit">
          <label for="signup-character-name" class="sr-only">Character name</label>
          <Input
            id="signup-character-name"
            v-model="characterName"
            placeholder="Character name"
            required
            class="field"
          />
          <label for="signup-class" class="sr-only">Class</label>
          <select id="signup-class" v-model="selectedClass" class="field native-select" required>
            <option value="" disabled>Select class</option>
            <option v-for="(cls, key) in WOW_CLASSES" :key="key" :value="key">
              {{ cls.name }}
            </option>
          </select>
          <label for="signup-spec" class="sr-only">Spec</label>
          <select
            id="signup-spec"
            v-model="selectedSpec"
            class="field native-select"
            required
            :disabled="!selectedClass"
          >
            <option value="" disabled>Select spec</option>
            <option v-for="(spec, key) in availableSpecs" :key="key" :value="key">
              {{ spec.name }}
            </option>
          </select>
          <Button type="submit" :disabled="!canSubmit">
            {{ editing ? 'Update' : 'Submit' }} Signup
          </Button>
          <Button v-if="editing" type="button" variant="outline" @click="cancelEditing">
            Cancel
          </Button>
        </form>
      </div>

      <!-- Signups closed -->
      <div v-else-if="!isOpen" class="closed-notice">
        <Badge variant="danger">Signups are currently closed</Badge>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { WOW_CLASSES } from '@/data/wow-classes.js'
import { toClassColorCss } from '@/lib/utils'

const props = defineProps({
  currentUser: { type: Object, default: null },
  existingSubmission: { type: Object, default: null },
  isOpen: { type: Boolean, required: true },
  discordAuthUrl: { type: String, required: true },
})

const emit = defineEmits(['submit', 'delete', 'signOut'])

const characterName = ref('')
const selectedClass = ref('')
const selectedSpec = ref('')
const editing = ref(false)

const availableSpecs = computed(() => {
  if (!selectedClass.value) return {}
  return WOW_CLASSES[selectedClass.value]?.specs ?? {}
})

const canSubmit = computed(
  () => characterName.value.trim() && selectedClass.value && selectedSpec.value,
)

const specDisplayName = computed(() => {
  if (!props.existingSubmission) return ''
  const cls = WOW_CLASSES[props.existingSubmission.className]
  return cls?.specs[props.existingSubmission.specName]?.name ?? props.existingSubmission.specName
})

const roleDisplayName = computed(() => {
  if (!props.existingSubmission) return ''
  const cls = WOW_CLASSES[props.existingSubmission.className]
  const role = cls?.specs[props.existingSubmission.specName]?.role ?? ''
  return role.charAt(0).toUpperCase() + role.slice(1)
})

// Only reset the spec when the *user* changes class. `prev` is '' on the very
// first assignment, which is what startEditing() does — an unconditional reset
// wiped the spec it had just pre-filled and left Update disabled.
watch(selectedClass, (cls, prev) => {
  if (prev) selectedSpec.value = ''
})

// A tier closing mid-edit would otherwise strand the user on the closed badge
// with `editing` stuck true until they reloaded.
watch(
  () => props.isOpen,
  (open) => {
    if (!open) editing.value = false
  },
)

function startEditing() {
  editing.value = true
  characterName.value = props.existingSubmission?.characterName ?? ''
  selectedClass.value = props.existingSubmission?.className ?? ''
  selectedSpec.value = props.existingSubmission?.specName ?? ''
}

function cancelEditing() {
  editing.value = false
}

function handleSubmit() {
  emit('submit', {
    characterName: characterName.value.trim(),
    className: selectedClass.value,
    specName: selectedSpec.value,
  })
  editing.value = false
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-text-subtle;
  margin: 0 0 $space-4 0;
}

.auth-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-3;
}

.auth-text {
  font-size: 0.875rem;
  color: $color-text-subtle;
  margin: 0;
}

.discord-btn {
  background: #5865f2;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  width: fit-content;
  text-decoration: none;

  &:hover {
    background: #4752c4;
  }
}

.discord-icon {
  width: 18px;
  height: 18px;
}

.user-identity {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin-bottom: $space-4;
}

.discord-avatar {
  width: 28px;
  height: 28px;
  background: #5865f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.discord-name {
  font-size: 0.875rem;
  color: $color-text-primary;
  font-weight: 500;
}

.sign-out-link {
  margin-left: auto;
  font-size: 0.75rem;
  color: $color-text-subtle;
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.existing-submission .submission-display {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-3 $space-4;
  background: var(--t-surface-raised);
  border-radius: $radius-md;
  flex-wrap: wrap;
}

.char-name {
  font-weight: 600;
}

.spec-info {
  font-size: 0.875rem;
  color: $color-text-subtle;
}

.submission-actions {
  display: flex;
  gap: $space-2;
  margin-left: auto;
}

.signup-fields {
  display: flex;
  gap: $space-3;
  flex-wrap: wrap;

  .field {
    flex: 1;
    min-width: 150px;
  }

  @include mobile {
    flex-direction: column;

    .field {
      min-width: unset;
    }
  }
}

.native-select {
  height: 36px;
  padding: 0 $space-3;
  background: transparent;
  border: 1px solid var(--t-border);
  border-radius: $radius-md;
  color: $color-text-primary;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px var(--t-ring);
  }

  option {
    background: var(--t-surface);
    color: $color-text-primary;
  }
}

.closed-notice {
  text-align: center;
  padding: $space-4 0;
}
</style>
