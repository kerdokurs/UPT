<script>
  import { db } from '../firebase';
  import { navigateTo } from 'svelte-router-spa';

  export let currentRoute;
  let params = {};

  let { kid, tid } = currentRoute.namedParams;

  /* if (!tid && kid) navigateTo(`/kategooria/${kid}`);
  else if (!kid && !tid) navigateTo('/'); */

  console.log(currentRoute);

  let teema = db
    .collection('sisu')
    .doc(kid)
    .collection('teemad')
    .doc(tid)
    .get()
    .then(doc => doc.data());
</script>

<section class="teema">
  <pre>
    <code>
      {#await teema then teema}{JSON.stringify(teema, null, 2)}{/await}
    </code>
  </pre>
</section>
