<script>
  import { db } from '../firebase';

  const kategooriad = db
    .collection('kategooriad')
    .where('public', '==', true)
    .get()
    .then(snap => snap.docs.map(doc => doc.data()));

  const teemad = db
    .collection('teemad')
    .where('public', '==', true)
    .get()
    .then(snap => snap.docs.map(doc => doc.data()));
</script>

<section class="sisu">
  <h2>Sisu</h2>
  {#await kategooriad}
    <p>Laadimine (1/2)</p>
  {:then kategooriad}
    {#await teemad}
      <p>Laadimine (2/2)</p>
    {:then teemad}
      {#if kategooriad.length > 0}
        <ul>
          {#each kategooriad as kategooria}
            <li>
              <a href={'/kategooria/' + kategooria.id}>{kategooria.title}</a>
              <ul>
                {#each teemad.filter(teema => teema.category === kategooria.id) as teema}
                  <li>
                    <a href={'/teema/' + kategooria.id + '/' + teema.id}>
                      {teema.title}
                    </a>
                  </li>
                {/each}
              </ul>
            </li>
          {/each}
        </ul>
      {:else}
        <p>Andmebaas ei sisalda teemasid.</p>
      {/if}
    {/await}
  {/await}
</section>
