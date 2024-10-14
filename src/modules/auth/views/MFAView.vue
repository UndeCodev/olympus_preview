<script setup>
import { ref } from 'vue';
import olympusAPI from '@/api/olympusAPI';
import { ArrowRightIcon } from '@heroicons/vue/16/solid';

const qrCode = ref('');
const secret = ref('');
const token = ref('');

const isSetupConfirmed = ref(false);

const setupMFA = async () => {
  try {
    const response = await olympusAPI.get('/mfa/setup');
    qrCode.value = response.data.qrCode;
    secret.value = response.data.secret;
  } catch (error) {
    console.error('Error configurando MFA:', error);
  }
};

const verifyMFA = async () => {
  try {
    console.log(token.value);
    const response = await olympusAPI.post('/mfa/verify', {
      token: token.value,
      secret: secret.value,
    });

    if (response.data.message === 'MFA verificado correctamente') {
      alert('MFA configurado correctamente');
    }
  } catch (error) {
    alert('Código MFA inválido');
  }
};

setupMFA();
</script>

<template>
  <div class="mfa" v-if="!isSetupConfirmed">
    <div class="mfa__information">
      <h1 class="mfa__title text-5xl text-center mb-4 font-bold">
        Protege tu cuenta con la verificación en dos pasos
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

    <button
      class="btn btn-primary w-2/3 flex place-content-center place-items-center gap-4"
      @click="isSetupConfirmed = true"
    >
      Continuar <ArrowRightIcon class="size-7" />
    </button>
  </div>

  <form v-else class="bg-white rounded-md shadow-sm p-8">
    <h1 class="mfa__title text-5xl text-center mb-4 font-bold">
      Confirma el Código de Autenticación
    </h1>
    <h2 class="mfa__subtitle text-center">
      Introduce el código de 6 dígitos generado en la app de autenticación.
    </h2>

    <input v-model="token" placeholder="Código MFA" class="form-control w-" />
  </form>
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
</style>
