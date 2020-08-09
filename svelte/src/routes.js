import Home from './Home.svelte';
import Teema from './sisu/Teema.svelte';
import Kategooria from './sisu/Kategooria.svelte';

const routes = [
  {
    name: '/',
    component: Home,
  },
  {
    name: 'k',
    nestedRoutes: [
      {
        name: ':kategooriaId',
        nestedRoutes: [
          { name: 'index', component: Kategooria },
          { name: 't/:teemaId', component: Teema },
        ],
      },
    ],
  },
  {
    name: '*',
    component: Home, //TODO: 404
  },
];

export { routes };
