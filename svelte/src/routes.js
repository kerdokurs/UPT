import Home from './Home.svelte';
import Sisu from './sisu/Sisu.svelte';
import Teema from './sisu/Teema.svelte';

const routes = [
  {
    name: '/',
    component: Home
  },
  {
    name: '/sisu',
    nestedRoutes: [
      { name: '/index', component: Sisu },
      { name: '/:id', component: Teema }
    ]
  }
];

export { routes };
