import isNotAuthenticatedGuard from '../guards/is-not-authenticated.guard';

export const authRoutes = {
  path: '/auth',
  name: 'auth',
  redirect: { name: 'inicio-sesion' },
  beforeEnter: isNotAuthenticatedGuard,
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
    {
      path: 'enviar-correo-recuperacion',
      name: 'enviar-correo-recuperacion',
      component: () => import('@/modules/auth/views/SendEmailResetPasswordPage.vue'),
    },
    {
      path: 'restablecer-contrasena',
      name: 'restablecer-contrasena',
      component: () => import('@/modules/auth/views/ResetPasswordPage.vue'),
    },
    {
      path: 'mfa-verification',
      name: 'mfa-verification',
      component: () => import('@/modules/auth/views/MFAView.vue'),
    },
  ],
};
