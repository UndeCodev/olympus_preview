import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-auth.action';
import { useLocalStorage } from '@vueuse/core';
import router from '@/router';
import { registerAction } from '../actions/register.action';

export const useAuthStore = defineStore('auth', () => {
  // State (Properties)
  const user = ref('');
  const token = ref(useLocalStorage('token', ''));

  const AuthStatus = {
    Authenticated: 'Authenticated',
    UnAuthenticated: 'UnAuthenticated',
    Checking: 'Checking',
  };

  const authStatus = ref(AuthStatus.UnAuthenticated);

  const logout = () => {
    authStatus.value = AuthStatus.UnAuthenticated;
    user.value = '';
    token.value = '';
    localStorage.removeItem('token');
  };

  // Actions
  const checkAuthStatus = async () => {
    try {
      const statusResponse = await checkAuthAction();

      if (!statusResponse.ok) {
        logout();
        return false;
      }

      authStatus.value = AuthStatus.Authenticated;
      user.value = statusResponse.user;
      token.value = statusResponse.token;

      return true;
    } catch (error) {
      router.replace({ name: 'inicio' });
      logout();
      return false;
    }
  };

  const login = async (email, password, tokenCaptcha) => {
    try {
      authStatus.value = AuthStatus.Checking;

      const {
        ok,
        message,
        timeRemaining,
        token: tokenLogin,
        user: userLogin,
      } = await loginAction(email, password, tokenCaptcha);

      if (!ok) {
        logout();
        return {
          ok: false,
          message: message,
          timeRemaining,
        };
      }

      user.value = userLogin;
      token.value = tokenLogin;
      authStatus.value = AuthStatus.Authenticated;

      router.replace({ name: 'inicio' });

      return {
        ok: true,
      };
    } catch (error) {
      logout();

      return {
        ok: false,
        message: error,
      };
    }
  };

  const register = async (user) => {
    const { name, lastname, emailR, phone, password } = user;

    try {
      authStatus.value = AuthStatus.Checking;
      const registerResp = await registerAction({ name, lastname, email: emailR, phone, password });

      if (!registerResp.ok) {
        logout();
        return {
          ok: false,
          message: registerResp.message,
        };
      }

      authStatus.value = AuthStatus.UnAuthenticated;

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return {
    // State (properties)
    user,
    authStatus,
    AuthStatus,

    // Getters (read-only)
    isChecking: computed(() => authStatus.value === AuthStatus.Checking),
    isAuthenticated: computed(() => authStatus.value === AuthStatus.Authenticated),

    hasMFA: computed(() => user.value.hasMFA),

    isAdmin: computed(() => user.value.rol === 'admin'),

    userId: computed(() => user.value?.id),
    username: computed(() => `${user.value?.nombre} ${user.value?.apellidos}` ?? 'Usuario'),
    email: computed(() => user.value?.email),

    // Actions
    login,
    register,
    checkAuthStatus,
    logout,
  };
});
