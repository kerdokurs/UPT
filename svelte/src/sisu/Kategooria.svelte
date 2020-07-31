<script>
  import { db } from '../firebase';
  import { onMount } from 'svelte';
  import { navigateTo } from 'svelte-router-spa';

  export let currentRoute;
  export let params = {};

  const { id } = currentRoute.namedParams;
  if (!id) navigateTo('/');

  const teemad = db
    .collection('teemad')
    .where('category', '==', id)
    .get()
    .then(snap => snap.docs.map(doc => doc.data()));
</script>

<section class="kategooria">
  {#await teemad then teemad}
    {#if teemad.length > 0}
      <ul>
        {#each teemad as teema}
          <li>
            <a href={`/teema/${teema.id}`}>{teema.title}</a>
          </li>
        {/each}
      </ul>
    {:else}
      <p>Selle kategooria all pole ühtki teemat.</p>
    {/if}
  {/await}
</section>
