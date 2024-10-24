<script setup>
import { ref, computed, onMounted } from 'vue';
import olympusAPI from '@/api/olympusAPI';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/16/solid';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from 'vue-toast-notification';
import { ShieldCheckIcon } from '@heroicons/vue/24/outline';

// Store
const authStore = useAuthStore();

// Properties
const isLoadingData = ref(false);

const qrCode = ref('');
const secret = ref('');

const digits = ref(['', '', '', '', '', '']); // Array para los 6 dígitos

// Instances
const $toast = useToast();

// Computed para concatenar todos los valores en una sola variable
const verificationCode = computed(() => digits.value.join(''));

const isSetupConfirmed = ref(false);

// Methods
const setupMFA = async () => {
  try {
    isLoadingData.value = true;

    const response = await olympusAPI.post('/auth/mfa/setup', { email: authStore.email });

    qrCode.value = response.data.qrCode;
    secret.value = response.data.secret;

    isLoadingData.value = false;
  } catch (error) {
    isLoadingData.value = false;
    console.error('Error configurando MFA:', error);
  }
};

const verifyMFA = async () => {
  if (!verificationCode.value.length) return;

  try {
    await olympusAPI.post('/auth/mfa/verify', {
      token: verificationCode.value,
      secret: secret.value,
    });

    await onEnableMFA();
    authStore.user.hasMFA = true;
  } catch (error) {
    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

const onEnableMFA = async () => {
  try {
    await olympusAPI.put('/auth/mfa/enable', { userId: authStore.userId, mfaState: true });

    $toast.open({
      message: 'Enhorabuena, configuraste correctamente la seguridad de dos pasos! 🎉🎉🎉',
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
  } catch (error) {
    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

const onDisableMFA = async () => {
  const confirmed = confirm('¿Estás seguro de querer deshabilitar la autenticación de dos pasos?');

  if (!confirmed) return;

  try {
    await olympusAPI.put('/auth/mfa/enable', { userId: authStore.userId, mfaState: false });

    $toast.open({
      message: 'Se ha desactivado correctamente la autenticación de dos pasos de tu cuenta.',
      type: 'info',
      duration: 4000,
      pauseOnHover: true,
    });

    authStore.user.hasMFA = false;
  } catch (error) {
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

onMounted(async () => {
  await setupMFA();
});
</script>

<template>
  <div v-if="authStore.hasMFA" class="h-screen grid place-items-center">
    <div class="bg-white grid gap-12 rounded-xl p-8 lg:w-1/4">
      <div
        class="bg-blue-50 rounded-full w-36 h-36 flex place-items-center place-content-center mx-auto"
      >
        <ShieldCheckIcon class="size-28 text-blue-400" />
      </div>
      <p class="text-gray-900 mb-4 text-center text-4xl font-serif">
        Tienes activada la autenticación de dos factores para mayor seguridad en tu cuenta.
      </p>
      <button @click="onDisableMFA" class="btn btn-primary">Deshabilitar MFA</button>
    </div>
  </div>

  <template v-else>
    <div class="h-screen grid place-content-center">
      <div class="mfa" v-if="!isSetupConfirmed">
        <div class="mfa__information">
          <h1 class="mfa__title text-5xl text-center mb-4 font-bold">
            Protege tu cuenta con la verificación en dos pasos {{ authStore.hasEnableMFA }}
          </h1>
          <h2 class="mfa__subtitle text-center">
            1. Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.). <br />
            2. Selecciona la opción para escanear un código QR.
          </h2>
        </div>
        <img
          v-if="qrCode"
          :src="qrCode"
          alt="Escanea este código con Google Authenticator"
          class="mfa__qr shadow-sm rounded-sm"
        />
        <div v-else class="sk-chase w-24 h-24 mx-auto">
          <div class="sk-chase-dot before:bg-slate-900"></div>
          <div class="sk-chase-dot before:bg-slate-900"></div>
          <div class="sk-chase-dot before:bg-slate-900"></div>
          <div class="sk-chase-dot before:bg-slate-900"></div>
          <div class="sk-chase-dot before:bg-slate-900"></div>
          <div class="sk-chase-dot before:bg-slate-900"></div>
        </div>

        <button
          class="btn btn-primary w-2/3 flex place-content-center place-items-center gap-2"
          @click="isSetupConfirmed = true"
        >
          Continuar <ArrowRightIcon class="size-7" />
        </button>
      </div>

      <form v-else class="bg-white rounded-md shadow-sm p-8 grid place-items-center gap-12">
        <div class="grid gap-3">
          <h1 class="mfa__title text-5xl text-center font-bold">
            Confirma el Código de Autenticación
          </h1>
          <h2 class="mfa__subtitle text-center">
            Introduce el código de 6 dígitos generado en la app de autenticación.
          </h2>
        </div>
        <div class="flex space-x-5">
          <input
            v-for="(digit, index) in digits"
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
        <div class="flex gap-6">
          <button
            class="btn btn-outline flex place-content-center place-items-center gap-2"
            @click.prevent="isSetupConfirmed = false"
          >
            <ArrowLeftIcon class="size-7" />Paso anterior
          </button>
          <button
            class="btn btn-primary flex place-content-center place-items-center disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:text-white"
            :disabled="verificationCode.length < 6"
            @click.prevent="verifyMFA"
          >
            Completar verificación de 2 pasos
          </button>
        </div>
      </form>
    </div>
  </template>
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
