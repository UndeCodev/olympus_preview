<script setup>
import { ref, useTemplateRef } from 'vue';
import useVuelidate from '@vuelidate/core';
import { helpers, required, email } from '@vuelidate/validators';
import { useToast } from 'vue-toast-notification';
import olympusAPI from '@/api/olympusAPI';

// Properties
const emailForm = ref('');

const isFormVisible = ref(true);
const isSendingEmail = ref(false);

// HTML References
const inputEmail = useTemplateRef('inputEmail');

// Rules for Vuelidate
const emailRules = {
  emailForm: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    email: helpers.withMessage('Correo electrónico inválido', email),
  },
};

// Instances
const v$ = useVuelidate(emailRules, { emailForm });
const $toast = useToast();

// Methods
const onSendRecoveryPassword = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    isSendingEmail.value = true;

    const { status, data } = await olympusAPI.post('/auth/send-password-reset-instructions', {
      email: emailForm.value,
    });

    if (status !== 200) return;

    $toast.open({
      message: data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    isFormVisible.value = false;
    isSendingEmail.value = false;
  } catch (error) {
    isSendingEmail.value = false;
    const errorMessage = error.response.data.message;
    inputEmail.value.focus();

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};
</script>

<template>
  <div class="h-screen grid place-items-center">
    <form
      class="grid gap-8 mx-8 bg-white shadow p-8 rounded-sm md:w-1/2 lg:w-1/4"
      @submit.prevent="onSendRecoveryPassword"
      v-if="isFormVisible"
    >
      <div class="grid gap-4">
        <h1 class="text-4xl text-slate-800 font-semibold">Recuperar contraseña</h1>
        <p class="text-slate-700">
          Ingresa tu correo electrónico para que te enviemos las instrucciones de cómo restablecer
          tu contraseña. Recibirás un enlace para crear una nueva contraseña que será válido por 15
          minutos.
        </p>
      </div>
      <div class="form-group">
        <label for="email">Correo electrónico:</label>
        <input
          type="email"
          class="form-control"
          :class="{ 'form-control--error': v$.emailForm.$error }"
          placeholder="janedoe@outlook.com"
          v-model="emailForm"
          ref="inputEmail"
          id="email"
        />
        <span v-if="v$.emailForm.$error">
          <p v-for="error of v$.emailForm.$errors" :key="error.$uid" class="text-error">
            {{ error.$message }}
          </p>
        </span>
      </div>
      <button type="submit" class="btn btn-primary">
        <span v-if="!isSendingEmail"> Enviar instrucciones </span>
        <div v-else class="sk-chase w-8 h-8 mx-auto">
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
          <div class="sk-chase-dot"></div>
        </div>
      </button>
    </form>
    <div v-else class="bg-white shadow p-8 max-w-4xl text-center mx-8">
      <img
        src="../../../assets/images/illustrations/undraw_mailbox_re_dvds.svg"
        alt="Mailbox"
        class="size-60 mx-auto mb-4"
      />
      <h1 class="text-3xl text-slate-900 font-semibold mb-3">Revisa tu bandeja de entrada</h1>
      <p class="text-slate-700 mb-12">
        En unos momentos recibirás un correo con las instrucciones para restablecer tu contraseña.
        Si no lo ves en tu bandeja de entrada, revisa también la carpeta de spam o correo no
        deseado.
      </p>
      <p class="text-slate-700">
        ¿No recibiste ningún correo electrónico?, revisa tu bandeja de spam o
        <span class="text-link cursor-pointer" @click="isFormVisible = true"
          >intenta con otro correo electrónico</span
        >
      </p>
    </div>
  </div>
</template>
