import { useAuthStore } from '@/modules/auth/store/useAuthStore';

const isAdminGuard = async (to, from, next) => {
  const authStore = useAuthStore();

  await authStore.checkAuthStatus();

  authStore.isAdmin ? next() : next({ name: 'inicio-sesion' });
};

export default isAdminGuard;
