/* eslint-disable no-undef */
import { reactive, ref, computed } from 'vue';

import useVuelidate from '@vuelidate/core';
import { required, helpers, email, sameAs, numeric } from '@vuelidate/validators';

import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

import olympusAPI from '@/api/olympusAPI';
import router from '@/router';
// import { CAPTCHA_SITE_KEY } from '@/utils/config';

export const useRegister = () => {
  const onLogin = async () => {
    try {
      isLoading.value = true;

      const { data } = await olympusAPI.post('/login', {
        email: loginData.email,
        password: loginData.password,
        tokenCaptcha,
      });

      isLoading.value = false;

      localStorage.setItem('token', data.token);
      const lastPath = localStorage.getItem('last-path') ?? '/';

      router.replace(lastPath);

      $toast.open({
        message: `Bienvenido de nuevo! 👋🏽👋🏽👋🏽`,
        type: 'success',
        duration: 4000,
        pauseOnHover: true,
      });
    } catch (error) {
      isLoading.value = false;
      grecaptcha.reset();

      const errorMessage = error.response.data.message;

      // Solucionar bug: contador rápido después de 2 clic
      if (error.response.status === 403 && !isLocked.value) {
        timeRemaining.value = error.response.data.timeRemaining;
        startCountdown();
        isLocked.value = true;
      }

      $toast.open({
        message: `${errorMessage}`,
        type: 'error',
        duration: 4000,
        pauseOnHover: true,
        queue: true,
      });
    }
  };

  return {
    // Properties
    loginData,
    formRegister,
    strengthPercent,
    checks,
    isPasswordVisible,
    isLoading,
    isCaptchaVerified,
    passwordStatus,
    isLocked,
    v$,
    v$Login,

    // readonly
    formattedTime,

    // Methods
    togglePasswordVisibility,
    checkPasswordStrength,
    checkPassword,
    onRegister,
    onLogin,
  };
};
