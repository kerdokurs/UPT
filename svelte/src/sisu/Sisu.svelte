<script>
  import { db } from '../firebase';

  const sisu = db
    .collection('sisu')
    .where('public', '==', true)
    .get()
    .then(snap => snap.docs.map(doc => doc.data()));
</script>

<section class="sisu">
  <h2>Sisu</h2>
  {#await sisu}
    <p>Laadimine</p>
  {:then sisu}
    {#if sisu.length > 0}
      <ul>
        {#each sisu as teema}
          <li>
            <a href={'/sisu/' + teema.id}>{teema.title}</a>
          </li>
        {/each}
      </ul>
    {:else}
      <p>Andmebaas ei sisalda teemasid.</p>
    {/if}
  {/await}
</section>
