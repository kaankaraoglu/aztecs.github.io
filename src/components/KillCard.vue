<template>
  <div class="kill-card-view">
    <div ref="cardRef" class="card" :style="tiltStyle">
      <div class="image-container">
        <div class="image-top-overlay">
          <span id="raid-name" class="raid-name">{{ raidName }}</span>
        </div>

        <a
          class="image-anchor"
          :href="imageUrl"
          :aria-label="`Open full image for ${raidName}`"
          @click.prevent="lightboxOpen = true"
        >
          <img class="raid-image" :src="imageUrl" :alt="`${raidName} screenshot`" loading="lazy" />
          <div class="enlarge-indicator" aria-hidden="true">🔍</div>
        </a>

        <div class="image-overlay">
          <div class="summary-line">
            <template v-if="date">
              <span class="date">{{ date }}</span>
            </template>
            <template v-if="date && attempts">
              <span class="separator">•</span>
            </template>
            <template v-if="attempts">
              <span class="attempts">Attempts: {{ attempts }}</span>
            </template>
          </div>

          <div class="show-image-button">
            <a :href="imageUrl" target="_blank" rel="noopener noreferrer"> Show Image </a>
          </div>

          <RosterList class="roster" :tanks="tanks" :healers="healers" :dps="dds" />
        </div>
      </div>
    </div>
    <ImageLightbox
      :open="lightboxOpen"
      :src="imageUrl"
      :alt="raidName + ' screenshot'"
      @close="lightboxOpen = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageLightbox from '@/components/ImageLightbox.vue'
import RosterList from '@/components/RosterList.vue'
import { useTiltEffect } from '@/composables/useTiltEffect'

const cardRef = ref(null)
const { tiltStyle } = useTiltEffect(cardRef)

defineProps({
  raidName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: false,
  },
  attempts: {
    type: [Number, String],
    required: false,
  },
  tanks: {
    type: Array,
    required: false,
  },
  healers: {
    type: Array,
    required: false,
  },
  dds: {
    type: Array,
    required: false,
  },
})

const lightboxOpen = ref(false)
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.kill-card-view {
  display: flex;
  justify-content: center;
  padding: 1rem;
  max-width: 100%;
  box-sizing: border-box;

  @include mobile {
    padding: 0;
  }

  .card {
    width: 100%;
    max-width: 100%;
    background-color: #000;
    border-radius: $radius-md;
    overflow: hidden;
    color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition:
      transform $duration-normal $ease-out,
      box-shadow $duration-normal $ease-default;
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .image-container {
      position: relative; /* ensure stacking context */
      width: 100%;
      background-color: #111;

      @media (min-width: 641px) {
        aspect-ratio: 16 / 9;
      }

      .raid-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: $radius-md $radius-md 0 0;
      }

      .image-top-overlay {
        position: absolute; /* ensure always above */
        top: 0;
        left: 0;
        z-index: 3;
        width: 100%;
        padding: 0.5rem 0.75rem;
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        border-radius: $radius-md $radius-md 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        @media (min-width: 641px) {
          text-align: center;
        }

        @media (max-width: 640px) {
          text-align: left;
        }
      }

      .image-anchor {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        cursor: zoom-in;
        text-decoration: none;
        color: inherit;
        z-index: 1;
      }

      .enlarge-indicator {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        backdrop-filter: blur(4px);
        opacity: 0.55;
        transition:
          opacity $duration-normal $ease-default,
          transform $duration-normal $ease-default;
        pointer-events: none;
        z-index: 4; /* raise above overlay (2) */
      }

      .image-anchor:hover .enlarge-indicator {
        opacity: 0.95;
        transform: scale(1.05);
      }

      .image-anchor:active .enlarge-indicator {
        transform: scale(0.92);
        opacity: 1;
      }

      .image-overlay {
        width: 100%;
        padding: $space-3 $space-3;
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.4);
        color: white;
        font-size: 0.85rem;
        text-align: left;
        z-index: 2; /* ensure roster text sits above .image-anchor (z-index:1) */

        @media (min-width: 641px) {
          position: absolute;
          bottom: 0;
          border-radius: 0 0 $radius-md $radius-md;
          max-height: 100%;
          overflow-y: auto;

          scrollbar-width: none;
          -ms-overflow-style: none;

          &::-webkit-scrollbar {
            display: none;
          }
        }

        .summary-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.375rem;

          .date {
            font-weight: 600;
            white-space: nowrap;
          }

          .separator {
            color: #aaa;
          }

          .attempts {
            font-style: italic;
            color: #ccc;
            white-space: nowrap;
          }
        }

        .show-image-button {
          display: none;
        }

        .roster {
          margin-top: 0.375rem;
          font-size: 0.85rem;
        }
      }
    }
  }
}

@media (max-width: 640px) {
  .kill-card-view .image-container {
    aspect-ratio: 16 / 9;
  }

  .kill-card-view .raid-image {
    display: block;
  }

  .kill-card-view .image-anchor {
    display: block;
    cursor: zoom-in;
  }

  .kill-card-view .image-overlay {
    position: static;
    backdrop-filter: none;
    background: none;
  }

  .kill-card-view .show-image-button {
    display: none;
  }

  .kill-card-view .enlarge-indicator {
    display: none;
  }
}
</style>
