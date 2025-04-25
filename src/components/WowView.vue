<template>
  <div class="wow-view">
    <KillCardView
      raidName="Liberation of Undermine (AOTC)"
      imageUrl="/images/kills/liberation_of_undermine_2025-04-20_1939.png"
      date="2025-04-20 19:39"
      :tries="5"
      :tanks="[
        { name: 'Phing', class: 'monk' },
        { name: 'Agro', class: 'warrior' },
      ]"
      :healers="[
        { name: 'Blackmaira', class: 'paladin' },
        { name: 'Éowyn', class: 'druid' },
        { name: 'Violator', class: 'paladin' },
        { name: 'Kiyanne', class: 'evoker' },
        { name: 'Sâmáar', class: 'priest' },
        { name: 'Edemption', class: 'priest' },
      ]"
      :dds="[
        { name: 'Synjin', class: 'shaman' },
        { name: 'Mssk', class: 'paladin' },
        { name: 'Aerioth', class: 'priest' },
        { name: 'Raspak', class: 'hunter' },
        { name: 'Frosteyes', class: 'death-knight' },
        { name: 'Olidh', class: 'demon-hunter' },
        { name: 'Wabble', class: 'hunter' },
        { name: 'Valordin', class: 'paladin' },
        { name: 'Aurielle', class: 'paladin' },
        { name: 'Tulkas', class: 'rogue' },
      ]"
    />
  </div>
</template>

<script>
import KillCardView from "@/components/KillCardView.vue";
export default {
  name: "WowView",
  components: {
    KillCardView,
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
