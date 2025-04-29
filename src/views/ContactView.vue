<template>
  <div class="contact-view">
    <div class="left">
      <p class="contact-info">
        Reach out to any of the online officers or veterans in-game or on discord for an invite to
        the guild.
      </p>
    </div>
    <div class="right">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" class="quality-legendary">Guild Master</th>
            <td class="monk">Phing</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="paladin">Valorite</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="paladin">Aurielle</td>
          </tr>
          <tr>
            <th scope="row" class="quality-epic">Officer</th>
            <td class="shaman">Synjin</td>
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

<script>
export default {
  name: 'ContactView',
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
.contact-view {
  display: flex;
  text-align: left;
  flex-wrap: nowrap;
  flex-direction: column;
  align-items: center;
  gap: 30px;

  @media (max-width: 1200px) {
    display: flex;
    flex-direction: column;
    max-width: 50vw;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    max-width: 90vw;
    gap: 20px;
  }

  .left {
    .contact-info {
      font-size: 1.5em;
      font-weight: 500;
      padding: 0 6em;
      margin: 0;
      max-width: 30em;

      @media (max-width: 1200px) {
        padding: 0 2em;
      }
    }
  }

  .right {
    .table {
      margin: auto;
      text-align: left;

      thead {
        th {
          color: $accent-color;
          font-weight: 800;
          padding-left: 20px;
        }
      }

      tbody {
        tr {
          th,
          td {
            font-weight: 800;
            padding-left: 20px;
          }
        }
      }
    }
  }
}
</style>
