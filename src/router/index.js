import isAuthenticatedGuard from '@/modules/auth/guards/is-authenticated.guard';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      redirect: { name: 'inicio' },
      component: () => import('@/modules/landing/layouts/LandingPageLayout.vue'),
      children: [
        {
          path: '',
          name: 'inicio',
          component: () => import('@/modules/landing/views/HomeView.vue'),
        },
        {
          path: 'productos',
          name: 'productos',
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
    },
    {
      path: '/auth',
      name: 'auth',
      redirect: { name: 'inicio-sesion' },
      component: () => import('@/modules/auth/layouts/AuthPageLayout.vue'),
      children: [
        {
          path: 'inicio-sesion',
          name: 'inicio-sesion',
          component: () => import('@/modules/auth/views/LoginView.vue'),
        },
        {
          path: 'registro',
          name: 'registro',
          component: () => import('@/modules/auth/views/RegisterView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      name: 'admin',
      beforeEnter: isAuthenticatedGuard,
      redirect: { name: 'gestion-productos' },
      component: () => import('@/modules/protected/layouts/AdminPageLayout.vue'),
      children: [
        {
          path: 'gestion-productos',
          name: 'gestion-productos',
          component: () => import('@/modules/protected/views/AdminView.vue'),
        },
        {
          path: 'gestion-usuarios',
          name: 'gestion-usuarios',
          component: () => import('@/modules/protected/views/GesUsersView.vue'),
        },
      ],
    },
  ],
});

export default router;
