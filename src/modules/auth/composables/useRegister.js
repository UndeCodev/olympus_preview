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
  // Helpers
  const passwordRegex = helpers.regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$/,
  );

  const alphaWithSpaces = helpers.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/);
  const isPasswordWeak = (password) => !weakPasswords.includes(password);

  // Properties
  const isLoading = ref(false);
  const isPasswordVisible = ref(false);
  const passwordStatus = ref('');
  const strengthPercent = ref(0);
  const isCaptchaVerified = ref(true);

  const isLocked = ref(false);
  const timeRemaining = ref(0);

  // const captchaToken = ref('');

  const weakPasswords = [
    '123456',
    '123456789',
    'qwerty',
    'password',
    '12345',
    '12345678',
    '111111',
    '123123',
    'abc123',
    'password1',
    '1234',
    '000000',
    'iloveyou',
    '123',
    'monkey',
    'dragon',
    'letmein',
    'princess',
    'qwertyuiop',
    'admin',
    'welcome',
    'login',
    'passw0rd',
    '1q2w3e4r',
    'starwars',
    'football',
    '123qwe',
    '1qaz2wsx',
    'sunshine',
    '666666',
    '654321',
    'superman',
    'asdfghjkl',
    'qazwsx',
    'michael',
    'hunter',
    'trustno1',
    'freedom',
    'whatever',
    'letmein123',
    'batman123@uthhA',
    'jordan23',
  ];

  const checks = ref({
    lowercaseUppercase: false,
    number: false,
    specialChar: false,
    minLength: false,
  });

  const loginData = reactive({
    email: '',
    password: '',
  });

  const formRegister = reactive({
    name: 'Diego Vite',
    phone: '7713400653',
    emailR: 'jekofel661@rowplant.com',
    password: 'Masterv123@1',
    confirmPassword: 'Masterv123@1',
  });

  const registerRules = {
    name: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      alphaWithSpaces: helpers.withMessage('Solo debe de contener letras', alphaWithSpaces),
    },
    phone: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      numeric: helpers.withMessage('Solo se permiten números', numeric),
    },
    emailR: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      email: helpers.withMessage('Debe ser un email válido', email),
    },
    password: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      passwordRegex: helpers.withMessage('No cumple con los requisitos mínimos', passwordRegex),
      isPasswordWeak: helpers.withMessage('Contraseña altamente débil.', isPasswordWeak),
    },
    confirmPassword: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      sameAs: helpers.withMessage(
        'Las contraseñas no coinciden',
        sameAs(computed(() => formRegister.password)),
      ),
    },
  };

  const loginRules = {
    email: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      email: helpers.withMessage('Correo electrónico inválido', email),
    },
    password: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
    },
  };

  const $toast = useToast();
  const v$ = useVuelidate(registerRules, formRegister);
  const v$Login = useVuelidate(loginRules, loginData);

  // Methods

  // Función para validar la fortaleza de la contraseña
  const checkPasswordStrength = () => {
    const pass = formRegister.password;

    checks.value.lowercaseUppercase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
    checks.value.number = /\d/.test(pass);
    checks.value.specialChar = /[!@#$%^&*]/.test(pass);
    checks.value.minLength = pass.length >= 12;

    // Calcula el porcentaje de fortaleza
    const passedChecks = Object.values(checks.value).filter(Boolean).length;
    strengthPercent.value = (passedChecks / 4) * 100;
  };

  const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
  };

  const checkPassword = async () => {
    if (!formRegister.password || formRegister.password.length < 12 || v$.value.password.$error)
      return;

    try {
      const response = await olympusAPI.post('/check-pswd', {
        password: formRegister.password,
      });

      const isUnsafePassword = response.data === 'Comprometida';

      passwordStatus.value = !isUnsafePassword
        ? ''
        : 'Contraseña comprometida, por favor utiliza otra.';
    } catch (error) {
      console.error('Error verificando la contraseña:', error);
      passwordStatus.value = 'Error verificando la contraseña';
    }
  };

  // Computed para formatear el tiempo en "mm:ss"
  const formattedTime = computed(() => {
    const totalSeconds = Math.floor(timeRemaining.value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  });

  // Función para iniciar el contador
  const startCountdown = () => {
    const interval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
      } else {
        clearInterval(interval);
        isLocked.value = false; // Desbloquear después de que el tiempo expire
      }
    }, 1000);
  };

  const onLogin = async () => {
    v$Login.value.$touch();

    const isInvalidForm = v$Login.value.$invalid;
    if (isInvalidForm) return;

    const tokenCaptcha = await grecaptcha.getResponse();
    if (!tokenCaptcha) return (isCaptchaVerified.value = false);

    try {
      isLoading.value = true;
      isCaptchaVerified.value = true;

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

  const onRegister = async () => {
    v$.value.$touch();

    const isInvalidForm = v$.value.$invalid;
    if (isInvalidForm) return;

    try {
      isLoading.value = true;

      const res = await olympusAPI.post('/register', {
        nombre: formRegister.name,
        email: formRegister.emailR,
        telefono: formRegister.phone,
        password: formRegister.password,
      });

      if (res.status != 201) {
        throw new Error();
      }

      isLoading.value = false;

      $toast.open({
        message: `Usuario creado correctamente! 🎉🎉🎉`,
        type: 'success',
        duration: 4000,
        pauseOnHover: true,
        queue: true,
      });

      setTimeout(() => {
        $toast.open({
          message: `Ahora puedes iniciar sesión`,
          type: 'info',
          duration: 4000,
          pauseOnHover: true,
        });
        router.replace({ name: 'inicio-sesion' });
      }, 2000);
    } catch (error) {
      isLoading.value = false;
      const errorMessage = error.response.data.message;

      $toast.open({
        message: `${errorMessage}`,
        type: 'error',
        duration: 6000,
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
