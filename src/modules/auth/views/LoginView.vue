<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import useVuelidate from '@vuelidate/core';
import { helpers, required, email } from '@vuelidate/validators';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from 'vue-toast-notification';

// import { onMounted } from 'vue';
import { CAPTCHA_SITE_KEY } from '@/utils/config';
import router from '@/router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

// Lifecycle
onMounted(() => {
  window.grecaptcha.render('recaptcha', {
    sitekey: CAPTCHA_SITE_KEY,
    'expired-callback': () => {
      console.log('Expirado');
    },
  });
});

// Properties
const loginForm = reactive({
  email: '',
  password: '',
});

const isCaptchaVerified = ref(true);
const isAccountLocked = ref(false);
const timeRemaining = ref(0);

const isPasswordVisible = ref(false);

// Rules for Vuelidate
const formRules = {
  email: {
    required: helpers.withMessage('Este campo es obligatorio', required),
    email: helpers.withMessage('Correo electrónico inválido', email),
  },
  password: {
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
};

// Instances
const v$ = useVuelidate(formRules, loginForm);
const $toast = useToast();

// Store
const authStore = useAuthStore();

// Methods
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
      isAccountLocked.value = false; // Desbloquear después de que el tiempo expire
    }
  }, 1000);
};

const onLogin = async () => {
  v$.value.$touch();

  // Validate form
  if (v$.value.$invalid) return;

  // eslint-disable-next-line no-undef
  const tokenCaptcha = await grecaptcha.getResponse();
  if (!tokenCaptcha) return (isCaptchaVerified.value = false);

  isCaptchaVerified.value = true;

  const {
    ok,
    message,
    timeRemaining: timeBlocked,
  } = await authStore.login(loginForm.email, loginForm.password, tokenCaptcha);

  if (!ok) {
    // eslint-disable-next-line no-undef
    grecaptcha.reset();

    if (timeBlocked > 0) {
      timeRemaining.value = timeBlocked;
      isAccountLocked.value = true;
      startCountdown();
    }

    $toast.open({
      message: message,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
    return;
  }

  router.replace({ name: authStore.hasMFA ? 'mfa-verification' : 'inicio' });

  if (!authStore.hasMFA) {
    $toast.open({
      message: 'Bienvenido de nuevo 👋🏽👋🏽👋🏽',
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};
</script>

<template>
  <main class="container mx-auto h-screen grid content-center place-content-center">
    <form @submit.prevent="onLogin" class="form bg-white rounded-md shadow-md p-6">
      <h1 class="text-center text-4xl">Iniciar sesión</h1>
      <div class="form-group grid gap-3">
        <label for="email">Correo electrónico:</label>
        <input
          type="text"
          placeholder="janedoe@outlook.com"
          class="form-control"
          :class="{ 'form-control--error': v$.email.$error }"
          id="email"
          v-model.trim="loginForm.email"
          @blur="v$.email.$touch"
        />
        <span v-if="v$.email.$error">
          <p v-for="error of v$.email.$errors" :key="error.$uid" class="text-error">
            {{ error.$message }}
          </p>
        </span>
      </div>
      <input type="text" name="username" autocomplete="username" style="display: none" />
      <div class="form-group grid gap-3">
        <label for="password" class="flex justify-between">
          <span>Contraseña: </span>
          <RouterLink class="text-link" :to="{ name: 'enviar-correo-recuperacion' }">
            ¿Olvidaste tu contraseña?
          </RouterLink>
        </label>
        <div class="password-container">
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            placeholder="**********"
            class="form-control"
            :class="{ 'form-control--error': v$.password.$error }"
            id="password"
            v-model="loginForm.password"
            @blur="v$.password.$touch"
            autocomplete="current-password"
          />
          <button
            type="button"
            @click="isPasswordVisible = !isPasswordVisible"
            class="toggle-btn bg-blue-100"
          >
            <EyeIcon class="icon-password size-8" v-if="!isPasswordVisible" />
            <EyeSlashIcon class="icon-password size-8" v-else />
          </button>
        </div>

        <span v-if="v$.password.$error">
          <p v-for="error of v$.password.$errors" :key="error.$uid" class="text-error">
            {{ error.$message }}
          </p>
        </span>
      </div>
      <div v-if="isAccountLocked">
        <p class="text-center text-error">
          Cuenta bloqueada temporalmente. <br />
          Tiempo restante: {{ formattedTime }}
        </p>
      </div>
      <!-- reCAPTCHA widget -->
      <div class="recaptcha">
        <div class="recaptcha" id="recaptcha"></div>
        <p v-if="!isCaptchaVerified" class="text-error">
          Por favor, verifica que no eres un robot.
        </p>
      </div>
      <button class="btn btn-primary">
        <span v-if="!authStore.isChecking">Iniciar sesión</span>
        <div v-else class="sk-chase w-8 h-8 mx-auto">
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
        </div>
      </button>
      <span class="grid text-center"
        >¿Aún no tienes una cuenta?
        <RouterLink class="text-link" :to="{ name: 'registro' }">Registrate aquí</RouterLink></span
      >
    </form>
  </main>
</template>
