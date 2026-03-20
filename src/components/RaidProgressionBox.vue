<template>
  <div class="raid-progression-box">
    <h2 class="info-box-heading">{{ raid.name }}</h2>
    <table v-if="raid.bosses.length">
      <thead>
        <tr>
          <th class="accent-color">Boss</th>
          <th class="quality-rare difficulty">N</th>
          <th class="quality-epic difficulty">HC</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="boss in raid.bosses" :key="boss.name">
          <td class="boss-name">{{ boss.name }}</td>
          <td class="killed-or-not">{{ killMark(boss.normal) }}</td>
          <td class="killed-or-not">{{ killMark(boss.heroic) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="no-progress">No progression yet</p>
  </div>
</template>

<script>
import { killMark } from '@/data/progression.js'
export default {
  name: 'RaidProgressionBox',
  props: {
    raid: {
      type: Object,
      required: true,
    },
  },
  methods: { killMark },
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.raid-progression-box {
  .info-box-heading {
    color: $accent-color;
    margin-top: 0;
    text-align: left;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  table tr .boss-name {
    font-size: 0.95em;
    @media (max-width: 700px) {
      font-size: 0.7em;
    }
  }

  table tr .difficulty {
    font-size: 1.15em;
    text-align: center;
  }

  table tr .killed-or-not {
    font-size: 0.7em;
    text-align: center;
  }

  table th:first-child {
    text-align: left;
  }
}
</style>
