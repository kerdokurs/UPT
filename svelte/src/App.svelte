<script>
  import { Router } from 'svelte-router-spa';
  import { routes } from './routes';
</script>

<style>
  :global(body) {
    background: #e5e5e5;
  }

  main {
    width: 100vw !important;
  }

  .container {
    background: #fff;
  }
</style>

<main>
  <div class="container u-full-width">
    <Router {routes} />
  </div>
</main>
