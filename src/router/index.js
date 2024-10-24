import { authRoutes } from '@/modules/auth/router';
import { landingRoutes } from '@/modules/landing/routes';
import { createRouter, createWebHashHistory } from 'vue-router';
import { profileRoutes } from '@/modules/user/routes';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    landingRoutes,
    authRoutes,
    profileRoutes,
    {
      path: '/:pathMatch(.*)*', // Catch-all: Coincide con cualquier ruta no definida
      redirect: { name: 'inicio' },
    },
  ],
});

export default router;
