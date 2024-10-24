import { useAuthStore } from '../store/useAuthStore';

const isEnabledMFAGuard = async (to, from, next) => {
  const authStore = useAuthStore();

  console.log('saliendo');

  authStore.logout();

  next();
};

export default isEnabledMFAGuard;
