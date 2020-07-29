<script>
  import { Router } from 'svelte-router-spa';
  import { routes } from './routes';

  import Nav from './Nav.svelte';
</script>

<style>

</style>

<main>
  <Nav />
  <Router {routes} />
</main>
