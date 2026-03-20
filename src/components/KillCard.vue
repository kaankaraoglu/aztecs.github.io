<template>
  <div class="kill-card-view">
    <div class="card">
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

          <div class="roster">
            <template v-if="tanks && tanks.length > 0">
              <span>Tanks: </span>
              <div class="names">
                <span v-for="(tank, index) in tanks" :key="'tank-' + index" :class="tank.class">
                  {{ tank.name }}<span v-if="index < tanks.length - 1">,</span>
                </span>
              </div>
              <br />
            </template>
            <template v-if="healers && healers.length > 0">
              <span>Healers: </span>
              <div class="names">
                <span
                  v-for="(healer, index) in healers"
                  :key="'healer-' + index"
                  :class="healer.class"
                >
                  {{ healer.name }}
                  <span v-if="index < healers.length - 1">,</span>
                </span>
              </div>
              <br />
            </template>
            <template v-if="dds && dds.length > 0">
              <span>DDs: </span>
              <div class="names">
                <span v-for="(dd, index) in dds" :key="'dd-' + index" :class="dd.class">
                  {{ dd.name }}<span v-if="index < dds.length - 1">,</span>
                </span>
              </div>
            </template>
          </div>
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
.kill-card-view {
  display: flex;
  justify-content: center;
  padding: 1rem;

  .card {
    width: 100%;
    max-width: 95vw;
    background-color: #000;
    border-radius: 5px;
    overflow: hidden;
    color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease;
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      transform: translateY(-2px);
    }

    @media (min-width: 768px) {
      max-width: 66vw;
    }

    @media (min-width: 1200px) {
      max-width: 55vw;
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
        border-radius: 5px 5px 0 0;

        @media (max-width: 640px) {
          display: none;
        }
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
        border-radius: 5px 5px 0 0;
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

        @media (max-width: 640px) {
          display: none; /* image hidden on small screens, keep existing mobile link button */
        }
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
          opacity 0.25s ease,
          transform 0.25s ease;
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
        padding: 0.625rem 0.875rem;
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.4);
        color: white;
        font-size: 0.85rem;
        text-align: left;
        z-index: 2; /* ensure roster text sits above .image-anchor (z-index:1) */

        @media (min-width: 641px) {
          position: absolute;
          bottom: 0;
          border-radius: 0 0 5px 5px;
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

          @media (max-width: 640px) {
            display: block;
            margin-bottom: 0.75rem;
            text-align: left;
            padding-left: 2px;

            a {
              display: inline-block;
              padding: 0.375rem 0.75rem;
              font-size: 0.85rem;
              background-color: #333;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
              transition: background-color 0.2s;

              &:hover {
                background-color: #555;
              }
            }
          }
        }

        .roster {
          margin-top: 0.375rem;

          span {
            font-weight: 600;
          }

          .names {
            display: inline;
            font-weight: normal;

            span {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
