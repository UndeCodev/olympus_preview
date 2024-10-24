import { useAuthStore } from '../store/useAuthStore';

const isAuthenticatedGuard = async (to, from, next) => {
  const authStore = useAuthStore();

  await authStore.checkAuthStatus();

  authStore.authStatus === authStore.AuthStatus.UnAuthenticated ? next({ name: 'inicio' }) : next();
};

export default isAuthenticatedGuard;
