<script setup>
import { ref, computed } from 'vue';
import olympusAPI from '@/api/olympusAPI';
import { useToast } from 'vue-toast-notification';
import router from '@/router';
import { KeyIcon } from '@heroicons/vue/24/outline';
// import { useAuthStore } from '../store/useAuthStore';

const secret = ref('KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD');

const isLoading = ref(false);

const digits = ref(['', '', '', '', '', '']); // Array para los 6 dígitos

// Instances
const $toast = useToast();

// const authStore = useAuthStore();

// Computed para concatenar todos los valores en una sola variable
const verificationCode = computed(() => digits.value.join(''));

const verifyMFA = async () => {
  if (verificationCode.value.length < digits.value.length) return;

  try {
    isLoading.value = true;

    await olympusAPI.post('/auth/mfa/verify', {
      token: verificationCode.value,
      secret: secret.value,
    });

    isLoading.value = false;

    $toast.open({
      message: 'Bienvenido de nuevo 👋🏽👋🏽👋🏽',
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    router.replace({ name: 'inicio' });
  } catch (error) {
    isLoading.value = false;
    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

// Manejar el evento de input
const onInput = (index, event) => {
  if (event.target.value.length === 1 && index < digits.value.length - 1) {
    // Mover al siguiente input si se ingresa un valor
    document.querySelectorAll('input')[index + 1].focus();
  }
};

// Manejar la eliminación con backspace
const onBackspace = (index) => {
  if (digits.value[index] === '' && index > 0) {
    // Mover al input anterior si está vacío y se presiona backspace
    document.querySelectorAll('input')[index - 1].focus();
  }
};

// Manejar el evento de pegar (paste)
const onPaste = (event) => {
  const pasteData = event.clipboardData.getData('text'); // Obtener el texto pegado
  const pasteDigits = pasteData.split('').slice(0, 6); // Dividirlo en dígitos (máx 6)

  // Rellenar los campos con los dígitos pegados
  pasteDigits.forEach((digit, index) => {
    digits.value[index] = digit || ''; // Llenar solo hasta 6 dígitos
  });

  // Mover el foco al último campo automáticamente
  document.querySelectorAll('input')[pasteDigits.length - 1].focus();

  event.preventDefault(); // Evitar el comportamiento por defecto de pegar
};
</script>

<template>
  <main class="h-screen grid place-content-center place-items-center">
    <form class="col-span-1 bg-white grid gap-14 p-8 rounded-md shadow-lg">
      <div class="grid gap-3">
        <div class="bg-slate-100 mx-auto mb-4 p-8 rounded-full">
          <KeyIcon class="size-20" />
        </div>
        <h1 class="mfa__title text-5xl text-center font-bold">
          Confirma el Código de Autenticación
        </h1>
        <h2 class="mfa__subtitle text-center">
          Introduce el código de 6 dígitos generado en la app de autenticación.
        </h2>
      </div>
      <div class="flex space-x-5 mx-auto">
        <input
          v-for="(_, index) in digits"
          :key="index"
          type="text"
          class="border rounded text-center w-10"
          maxlength="1"
          v-model="digits[index]"
          @input="onInput(index, $event)"
          @paste="onPaste($event)"
          @keydown.backspace="onBackspace(index)"
        />
      </div>
      <button
        class="btn btn-primary flex place-content-center place-items-center"
        @click.prevent="verifyMFA"
      >
        <span v-if="!isLoading"> Verificar código de autenticación </span>
        <div v-else class="sk-chase w-9 h-9 mx-auto">
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
        </div>
      </button>
    </form>
  </main>
</template>

<style scoped>
.mfa {
  display: grid;
  place-items: center;
  gap: 5.2rem;
}

.icon {
  width: 1rem;
  height: 1rem;
}

/* Espacio entre los inputs */
input {
  font-size: 3.5rem;
  width: 6rem;
  height: 8rem;
}
</style>
