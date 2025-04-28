<template>
  <div class="kill-card-view">
    <div class="card">
      <div class="image-container">
        <div class="image-top-overlay">
          <span id="raid-name" class="raid-name">{{ raidName }}</span>
        </div>

        <img class="raid-image" :src="imageUrl" alt="Raid Kill" />

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
            <a :href="imageUrl" target="_blank" rel="noopener noreferrer">
              Show Image
            </a>
          </div>

          <div class="roster">
            <template v-if="tanks && tanks.length > 0">
              <span>Tanks: </span>
              <div class="names">
                <span
                  v-for="(tank, index) in tanks"
                  :key="'tank-' + index"
                  :class="tank.class"
                >
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
                <span
                  v-for="(dd, index) in dds"
                  :key="'dd-' + index"
                  :class="dd.class"
                >
                  {{ dd.name }}<span v-if="index < dds.length - 1">,</span>
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "KillCardView",
  props: {
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
      required: false, // [{ name: "Phing", class: "monk" }]
    },
    healers: {
      type: Array,
      required: false,
    },
    dds: {
      type: Array,
      required: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_variables.scss";

.kill-card-view {
  display: flex;
  justify-content: center;
  padding: 1rem;

  .card {
    width: 100%;
    max-width: 90vw;
    background-color: #000;
    border-radius: 5px;
    overflow: hidden;
    color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: 0.3s;
    margin-bottom: 4em;

    @media (min-width: 768px) {
      max-width: 66vw;
    }

    @media (min-width: 1200px) {
      max-width: 45vw;
    }

    .image-container {
      position: relative;
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
        width: 100%;
        padding: 8px 12px;
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
          position: absolute;
          top: 0;
          text-align: center;
        }

        @media (max-width: 640px) {
          text-align: left;
        }
      }

      .image-overlay {
        width: 100%;
        padding: 10px 14px;
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.4);
        color: white;
        font-size: 0.85rem;
        text-align: left;

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
          gap: 8px;
          margin-bottom: 6px;

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
            margin-bottom: 12px;
            text-align: left;
            padding-left: 2px;

            a {
              display: inline-block;
              padding: 6px 12px;
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
          margin-top: 6px;

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
