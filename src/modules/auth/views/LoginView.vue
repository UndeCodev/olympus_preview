<script setup>
import { useRegister } from '../composables/useRegister';

const {
  // Properties
  v$Login,
  loginData,
  isPasswordVisible,
  isLoading,

  // Methods
  togglePasswordVisibility,
  onLogin,
} = useRegister();

// Methods
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
