import { reactive, ref, computed } from 'vue';

import useVuelidate from '@vuelidate/core';
import { required, helpers, email, sameAs, numeric } from '@vuelidate/validators';

import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

import olympusAPI from '@/api/olympusAPI';
import router from '@/router';

export const useRegister = () => {
  // Helpers
  const passwordRegex = helpers.regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$/,
  );

  const alphaWithSpaces = helpers.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/);

  // Properties
  const isLoading = ref(false);
  const isPasswordVisible = ref(false);

  const passwordStatus = ref('');

  // Variables para el medidor y las validaciones
  const strengthPercent = ref(0);

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
    name: '',
    phone: '',
    emailR: '',
    password: '',
    confirmPassword: '',
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
    if (!formRegister.password) return;

    try {
      const response = await olympusAPI.post('/check-pswd', {
        password: formRegister.password,
      });

      const isUnsafePassword = response.data === 'Comprometida';

      if (!isUnsafePassword) return (passwordStatus.value = '');

      v$.value.password.$errors[0].$message += 'Hola munod';

      // passwordStatus.value = !isUnsafePassword
      // ? ''
      // : 'Contraseña comprometida, por favor utiliza otra.';
    } catch (error) {
      console.error('Error verificando la contraseña:', error);
      passwordStatus.value = 'Error verificando la contraseña';
    }
  };

  const onLogin = async () => {
    v$Login.value.$touch();

    const isInvalidForm = v$Login.value.$invalid;
    if (isInvalidForm) return;

    isLoading.value = true;

    try {
      const { data } = await olympusAPI.post('/login', {
        email: loginData.email,
        password: loginData.password,
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
    v$,
    v$Login,

    // Methods
    togglePasswordVisibility,
    checkPasswordStrength,
    checkPassword,
    onRegister,
    onLogin,
  };
};
