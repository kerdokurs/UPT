<script>
  import { db } from '../firebase';
  import { onMount } from 'svelte';
  import { navigateTo } from 'svelte-router-spa';

  export let currentRoute;
  export let params = {};

  const { id } = currentRoute.namedParams;
  /* if (!id) navigateTo('/'); */
  console.log(currentRoute);

  const data = db
    .collection('index')
    .doc('index')
    .get()
    .then(doc => doc.data().sisu[id]);
</script>

<section class="kategooria">
  {#await data then data}
    {#if data}
      <h2>{data.title}</h2>
      <ul>
        {#each Object.keys(data.teemad) as teemaId}
          <li>
            <a href={`/teema/${id}/${teemaId}`}>{data.teemad[teemaId].title}</a>
          </li>
        {/each}
      </ul>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    {:else}
      <p>Kategooriat `{id}` pole.</p>
    {/if}
  {/await}
</section>
