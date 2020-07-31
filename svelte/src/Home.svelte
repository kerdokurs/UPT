<script>
  import { db } from './firebase';

  export let currentRoute;
  export let params = {};

  const kategooriad = db
    .collection('kategooriad')
    .where('public', '==', true)
    .get()
    .then(snap => snap.docs.map(doc => doc.data()));
</script>

<style>
  .kategooriad {
    padding-left: 10px;
    padding-right: 10px;
  }
</style>

<section class="home">
  <div class="kategooriad">
    {#await kategooriad}
      <p>Laadimine...</p>
    {:then kategooriad}
      {#if kategooriad.length > 0}
        <h4>Kategooriad</h4>
        <ul>
          {#each kategooriad as kategooria}
            <li>
              <a href={'/kategooria/' + kategooria.id}>{kategooria.title}</a>
            </li>
          {/each}
        </ul>
      {:else}
        <p>Andmebaas ei sisalda teemasid.</p>
      {/if}
    {/await}
  </div>
</section>
