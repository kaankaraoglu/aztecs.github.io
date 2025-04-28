<template>
  <div class="wow-view">
    <KillCardView
      raidName="Liberation of Undermine (AOTC)"
      :imageUrl="require('@/assets/images/kills/liberation_of_undermine_2025_04_20.png')"
      date="2025-04-20 19:39"
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

    <KillCardView
      raidName="Glory of the Liberation of Undermine Raider"
      :imageUrl="require('@/assets/images/kills/glory_of_the_liberation_of_undermine_raider_2025_04_27.jpg')"
      date="2025-04-27 20:21"
      :tries="1"
      :tanks="[
        { name: 'Phruity', class: 'druid' },
        { name: 'Valorite', class: 'death-knight' },
      ]"
      :healers="[
        { name: 'Blackmaira', class: 'paladin' },
        { name: 'Éowyn', class: 'druid' },
        { name: 'Redemption', class: 'priest' },
        { name: 'Kiyanne', class: 'evoker' },
        { name: 'Sâmáar', class: 'priest' },
        { name: 'Edemption', class: 'priest' },
      ]"
      :dds="[
        { name: 'Dimi', class: 'monk' },
        { name: 'Synjin', class: 'shaman' },
        { name: 'Chaos', class: 'warlock' },
        { name: 'Aeripew', class: 'hunter' },
        { name: 'Raspak', class: 'hunter' },
        { name: 'Frosteyes', class: 'death-knight' },
        { name: 'Olidh', class: 'demon-hunter' },
        { name: 'Wabble', class: 'hunter' },
        { name: 'Incendia', class: 'mage' },
        { name: 'Tulkas', class: 'rogue' },
        { name: 'Peltzer', class: 'warlock' },
        { name: 'Daruni', class: 'druid' },
      ]"
    />

    <KillCardView
      raidName="Yogg-Saron"
      :imageUrl="require('@/assets/images/kills/yoggsaron_2009_06_01.jpg')"
      date="2009-06-01"
    />

    <KillCardView
      raidName="Ulduar"
      :imageUrl="require('@/assets/images/kills/ulduar_2009_04_19.jpg')"
      date="2009-04-19"
    />

    <KillCardView
      raidName="Obisidian Sanctum"
      :imageUrl="require('@/assets/images/kills/obsidian_sanctum_2009_02_23.jpg')"
      date="2009-02-23"
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
