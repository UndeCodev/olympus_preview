import isAdminGuard from '@/modules/auth/guards/is-admin-guard';
import UserLayoutPage from '../layouts/UserLayoutPage.vue';
import isAuthenticatedGuard from '@/modules/auth/guards/is-authenticated.guard';

export const profileRoutes = {
  path: '/perfil',
  name: 'profile-layout',
  redirect: { name: 'reset-password' },
  component: UserLayoutPage,
  beforeEnter: [isAuthenticatedGuard],
  children: [
    {
      path: 'information',
      name: 'information',
      component: () => import('@/modules/user/views/ProfilePage.vue'),
    },
    {
      path: 'cambiar-contrasena',
      name: 'reset-password',
      component: () => import('@/modules/user/views/ChangePasswordPage.vue'),
    },
    {
      path: 'admin',
      name: 'admin',
      redirect: { name: 'perfil-empresa' },
      beforeEnter: isAdminGuard,
      component: () => import('@/modules/admin/layouts/AnotherAdminLayout.vue'),
      children: [
        {
          path: 'perfil-empresa',
          name: 'perfil-empresa',
          component: () => import('@/modules/admin/views/CompanyProfileEditor.vue'),
        },
      ],
    },
    {
      path: 'documentos-legales',
      name: 'documentos-legales',
      redirect: { name: 'politica-privacidad' },
      beforeEnter: isAdminGuard,
      component: () => import('@/modules/admin/layouts/AdminLayoutPage.vue'),
      children: [
        {
          path: 'politica-privacidad',
          name: 'politica-privacidad',
          component: () => import('@/modules/admin/views/PrivacyPolicy.vue'),
        },
        {
          path: 'terminos-condiciones',
          name: 'terminos-condiciones',
          component: () => import('@/modules/admin/views/TermsAndConditions.vue'),
        },
        {
          path: 'deslinde-legal',
          name: 'deslinde-legal',
          component: () => import('@/modules/admin/views/LegalDisclaimer.vue'),
        },
        {
          path: 'perfil-de-la-empresa',
          name: 'perfil-de-la-empresa',
          component: () => import('@/modules/admin/views/CompanyProfileEditor.vue'),
        },
      ],
    },
    {
      path: 'configuracion-emails',
      name: 'configuracion-emails',
      beforeEnter: isAdminGuard,
      component: () => import('@/modules/admin/views/ConfigEmailsView.vue'),
    },
    {
      path: 'mfa-setup',
      name: 'mfa-setup',
      component: () => import('@/modules/auth/views/MFASetupView.vue'),
    },
  ],
};
