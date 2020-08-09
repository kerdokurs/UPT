<script>
  import { db } from './firebase';
  import { onMount } from 'svelte';

  const indexRef = db.collection('index').doc('index');

  let sisu = [];

  onMount(async () => {
    const index = await indexRef.get().then(doc => doc.data());

    for (let kategooriaId in index.sisu) {
      const kategooria = index.sisu[kategooriaId];
      sisu = [...sisu, kategooria];
    }
  });
</script>

<style>
  .kategooriad {
    padding-left: 10px;
    padding-right: 10px;
  }
</style>

<section class="home">
  <div class="kategooriad">
    {#if sisu.length > 0}
      <h4>Kategooriad</h4>
      <ul>
        {#each sisu as kategooria}
          <li>
            <a href={'/kategooria/' + kategooria.id}>{kategooria.title}</a>
          </li>
        {/each}
      </ul>
    {:else}
      <p>Andmebaas ei sisalda teemasid.</p>
    {/if}
  </div>
</section>
