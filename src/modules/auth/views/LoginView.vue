<script setup>
import { onMounted } from 'vue';
import { useRegister } from '../composables/useRegister';
import { CAPTCHA_SITE_KEY } from '@/utils/config';

// Lifecycle
onMounted(() => {
  window.grecaptcha.render('recaptcha', {
    sitekey: CAPTCHA_SITE_KEY,
    'expired-callback': () => {
      console.log('Expirado');
    },
  });
});

// Composables
const {
  // Properties
  v$Login,
  loginData,
  isCaptchaVerified,
  isPasswordVisible,
  isLoading,
  isLocked,
  formattedTime,

  // Methods
  togglePasswordVisibility,
  onLogin,
} = useRegister();

// Methods

// Variable reactiva que almacena el tiempo restante en segundos (3 minutos y 30 segundos = 210 segundos)
</script>

<template>
  <form @submit.prevent="onLogin" class="form bg-white rounded-sm shadow-sm p-6">
    <h1 class="text-center text-4xl">Iniciar sesión</h1>
    <div class="form-group grid gap-3">
      <label for="email">Correo electrónico:</label>
      <input
        type="text"
        placeholder="janedoe@outlook.com"
        class="form-control"
        :class="{ 'form-control--error': v$Login.email.$error }"
        id="email"
        v-model.trim="loginData.email"
      />
      <span v-if="v$Login.email.$error">
        <p v-for="error of v$Login.email.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </p>
      </span>
    </div>
    <div class="form-group grid gap-3">
      <label for="password">Contraseña:</label>
      <div class="password-container">
        <input
          :type="isPasswordVisible ? 'text' : 'password'"
          placeholder="**********"
          class="form-control"
          :class="{ 'form-control--error': v$Login.password.$error }"
          id="password"
          v-model="loginData.password"
        />
        <button type="button" @click="togglePasswordVisibility" class="toggle-btn">
          {{ isPasswordVisible ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>
      <span v-if="v$Login.password.$error">
        <p v-for="error of v$Login.password.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </p>
      </span>
    </div>
    <div v-if="isLocked">
      <p class="text-center text-error">
        Cuenta bloqueada temporalmente. <br />
        Tiempo restante: {{ formattedTime }}
      </p>
    </div>
    <!-- reCAPTCHA widget -->
    <div class="recaptcha">
      <div class="recaptcha" id="recaptcha"></div>
      <p v-if="!isCaptchaVerified" class="text-error">Por favor, verifica que no eres un robot.</p>
    </div>
    <button class="btn btn-primary">
      <span v-if="!isLoading">Iniciar sesión</span>
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
</template>
