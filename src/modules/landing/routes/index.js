import LandingPageLayout from '../layouts/LandingPageLayout.vue';
import HomeView from '../views/HomeView.vue';

export const landingRoutes = {
  path: '',
  name: 'landing',
  redirect: { name: 'inicio' },
  component: LandingPageLayout,
  children: [
    {
      path: '',
      name: 'inicio',
      component: HomeView,
    },
    {
      path: 'products',
      name: 'products',
      component: () => import('@/modules/landing/views/ProductsView.vue'),
    },
    {
      path: 'acerca',
      name: 'acerca-de',
      component: () => import('@/modules/landing/views/AboutView.vue'),
    },
    {
      path: 'contacto',
      name: 'contacto',
      component: () => import('@/modules/landing/views/ContactView.vue'),
    },
  ],
};
