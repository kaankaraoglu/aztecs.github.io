<template>
  <div class="contact-view content-wrapper">
    <div class="contact-box">
      <h1 class="contact-heading">Contact & Guild Roster</h1>
      <p class="contact-info">
        Reach out to any of the online officers or veterans in-game or on Discord for an invite to
        the guild.
      </p>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" class="quality-legendary">Guild Master/Figurehead</th>
            <td class="monk">Phing</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="paladin">Valorite</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Achievement Officer</th>
            <td class="paladin">Aurielle</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="demon-hunter">Synthia</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="death-knight">Hammeh</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="evoker">Kiyanne</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="mage">Zebron</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="paladin">Petsy</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Sympathy Hire</th>
            <td class="warlock">Rhysanatic</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/_info-box.scss';

.contact-view {
  display: flex;
  justify-content: center;
  padding: 2rem 2rem 4rem;
  max-width: 64rem;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 1rem 1rem 3rem;
  }
}

.contact-box {
  border: 1px dashed $accent-color;
  border-radius: 20px;
  padding: 2.5rem 3.125rem;
  max-width: 780px;
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.3s ease;
  &:hover {
    background: rgba(#ff8a05, 0.05);
  }
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  margin: 0 auto;

  @media (max-width: 900px) {
    padding: 1.875rem;
  }
  @media (max-width: 600px) {
    padding: 1.5625rem 1.25rem;
  }
}

.contact-heading {
  margin: 0 0 1rem;
  font-size: 2.2em;
  font-weight: 800;
  color: $accent-color;
  text-align: center;
  @media (max-width: 600px) {
    font-size: 1.6em;
  }
}

.contact-info {
  font-size: 1.3em;
  line-height: 1.5;
  font-weight: 500;
  margin: 0 0 1.5rem;
  text-align: center;
  @media (max-width: 600px) {
    font-size: 1.05em;
  }
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.05em;
  @media (max-width: 480px) {
    font-size: 0.9em;
  }

  thead th {
    color: $accent-color;
    font-weight: 800;
    text-align: left;
    padding: 0.4rem 0.75rem;
  }

  tbody tr th,
  tbody tr td {
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    text-align: left; /* added to override global center alignment */
  }

  tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.03);
  }
  tbody tr {
    transition: background 0.2s ease;
    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  }
}
</style>
