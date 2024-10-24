import { useAuthStore } from '../store/useAuthStore';

const isNotAuthenticatedGuard = async (to, from, next) => {
  const authStore = useAuthStore();

  await authStore.checkAuthStatus();

  authStore.authStatus === authStore.AuthStatus.Authenticated ? next({ name: 'inicio' }) : next();
};

export default isNotAuthenticatedGuard;
