import Home from './Home.svelte';
import Sisu from './sisu/Sisu.svelte';
import Teema from './sisu/Teema.svelte';
import Kategooria from './sisu/Kategooria.svelte';

const routes = [
  {
    name: '/',
    component: Home
  },
  {
    name: '/sisu',
    component: Sisu
  },
  {
    name: '/kategooria/:id',
    component: Kategooria
  },
  {
    name: '/teema/:kid/:tid',
    component: Teema
  }
];

export { routes };
