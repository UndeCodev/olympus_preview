<script setup>
import { ref, reactive, computed, useTemplateRef } from 'vue';

import useVuelidate from '@vuelidate/core';
import { helpers, required, sameAs } from '@vuelidate/validators';

import { EyeSlashIcon, EyeIcon } from '@heroicons/vue/24/outline';
import olympusAPI from '@/api/olympusAPI';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useToast } from 'vue-toast-notification';

// Regular expresions
const passwordRegex = helpers.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$/,
);

// Properties
const getInitialFormData = () => ({
  oldPassword: '',
  newPassword: '',
  confirmNewPassord: '',
});

const newPasswordForm = reactive(getInitialFormData());

const isInputVisible = reactive({
  oldPassword: false,
  newPassword: false,
  confirmNewPassord: false,
});

const passwordChecks = ref({
  lowercaseUppercase: false,
  number: false,
  specialChar: false,
  minLength: false,
});

const passwordStatus = ref('');
const strengthPercent = ref(0);

// Rules for vuelidate
// TODO: Verify why $autoDirty isn't working
const newPasswordRules = {
  oldPassword: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
  newPassword: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    password: helpers.withMessage(
      'Por favor agrega todos los carácteres necesarios.',
      passwordRegex,
    ),
  },
  confirmNewPassord: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    password: helpers.withMessage('El campo no cumple con los requisitos.', passwordRegex),
    sameAs: helpers.withMessage(
      'Las contraseñas no coinciden',
      sameAs(computed(() => newPasswordForm.newPassword)),
    ),
  },
};

const inputOldPassword = useTemplateRef('inputOldPassword');

// Instances
const v$ = useVuelidate(newPasswordRules, newPasswordForm);
const $toast = useToast();

// Store
const authStore = useAuthStore();

// Methods
const checkPasswordStrength = () => {
  const pass = newPasswordForm.newPassword;

  passwordChecks.value.lowercaseUppercase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
  passwordChecks.value.number = /\d/.test(pass);
  passwordChecks.value.specialChar = /[!@#$%^&*]/.test(pass);
  passwordChecks.value.minLength = pass.length >= 12;

  // Calcula el porcentaje de fortaleza
  const passedChecks = Object.values(passwordChecks.value).filter(Boolean).length;
  strengthPercent.value = (passedChecks / 4) * 100;
};

const checkPassword = async () => {
  if (!newPasswordForm.newPassword || v$.value.newPassword.$error) return;

  try {
    const response = await olympusAPI.post('/auth/check-pswd', {
      password: newPasswordForm.newPassword,
    });
    console.log(response);

    const isUnsafePassword = response.data === 'Comprometida';

    passwordStatus.value = !isUnsafePassword
      ? ''
      : 'Contraseña comprometida, por favor utiliza otra.';
  } catch (error) {
    console.error('Error verificando la contraseña:', error);
    passwordStatus.value = 'Error verificando la contraseña';
  }
};

const onNewPassword = async (event) => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  if (newPasswordForm.oldPassword === newPasswordForm.newPassword) {
    $toast.open({
      message: 'No puedes colocar tu contraseña antigua como nueva, intenta con otra.',
      type: 'warning',
      duration: 4000,
      pauseOnHover: true,
    });

    inputOldPassword.value.focus();
    inputOldPassword.value.classList.add('form-control--error');

    return;
  }

  inputOldPassword.value.classList.remove('form-control--error');

  try {
    const { status, data } = await olympusAPI.put('/auth/change-password', {
      email: authStore.email,
      oldPassword: newPasswordForm.oldPassword,
      newPassword: newPasswordForm.newPassword,
    });

    if (status !== 200) return;

    $toast.open({
      message: data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    event.target.reset();
    Object.assign(newPasswordForm, getInitialFormData());
  } catch (error) {
    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });

    if (error.status === 401) {
      inputOldPassword.value.focus();
      inputOldPassword.value.classList.add('form-control--error');
    }
  }
};
</script>

<template>
  <div class="h-screen grid place-items-center content-center grid-cols-1">
    <form
      @submit.prevent="onNewPassword($event)"
      class="bg-white shadow rounded p-8 grid gap-12 md:w-1/2 lg:w-1/2 xl:w-1/3 mx-auto"
    >
      <div>
        <h1 class="text-5xl mb-4">Cambiar contraseña</h1>
        <p>
          Introduce tu contraseña actual y elige una nueva. Asegúrate de que sea segura, combinando
          letras, números y símbolos. Confirma la nueva contraseña y haz clic en "Cambiar
          contraseña" para aplicar los cambios.
        </p>
      </div>
      <div class="grid gap-8">
        <div class="form-group">
          <label for="old-password">Contraseña actual:</label>
          <input type="text" name="username" autocomplete="username" style="display: none" />
          <div class="password-container">
            <input
              :type="isInputVisible.oldPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'form-control--error': v$.oldPassword.$error }"
              placeholder="Ingresa tu contraseña actual"
              id="oldPassword"
              v-model.trim="newPasswordForm.oldPassword"
              ref="inputOldPassword"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="isInputVisible.oldPassword = !isInputVisible.oldPassword"
              class="toggle-btn bg-blue-100"
            >
              <EyeIcon class="icon-password size-8" v-if="!isInputVisible.oldPassword" />
              <EyeSlashIcon class="icon-password size-8" v-else />
            </button>
          </div>
          <span v-if="v$.oldPassword.$error">
            <p v-for="error of v$.oldPassword.$errors" :key="error.$uid" class="text-error">
              {{ error.$message }}
            </p>
          </span>
        </div>
        <div class="form-group">
          <label for="new-password">Contraseña nueva:</label>
          <div class="password-container">
            <input
              :type="isInputVisible.newPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'form-control--error': v$.newPassword.$error }"
              placeholder="Ingresa tu nueva contraseña"
              id="new-password"
              v-model.trim="newPasswordForm.newPassword"
              @input="checkPasswordStrength"
              @blur="checkPassword"
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="isInputVisible.newPassword = !isInputVisible.newPassword"
              class="toggle-btn bg-blue-100"
            >
              <EyeIcon class="icon-password size-8" v-if="!isInputVisible.newPassword" />
              <EyeSlashIcon class="icon-password size-8" v-else />
            </button>
          </div>
          <span v-if="passwordStatus.length">
            <p class="text-error">{{ passwordStatus }}</p>
          </span>
          <span v-if="v$.newPassword.$error">
            <p v-for="error of v$.newPassword.$errors" :key="error.$uid" class="text-error">
              {{ error.$message }}
            </p>
          </span>
          <Transition>
            <div v-show="newPasswordForm.newPassword">
              <div class="strength-meter mb-8">
                <div class="strength-meter-fill" :style="{ width: strengthPercent + '%' }"></div>
              </div>
              <ul>
                <li :class="{ passed: passwordChecks.lowercaseUppercase }">
                  {{ passwordChecks.lowercaseUppercase ? '✔' : '✖️' }} Incluye mayúsculas y
                  minúsculas
                </li>
                <li :class="{ passed: passwordChecks.number }">
                  {{ passwordChecks.number ? '✔' : '✖️' }} Incluye un número
                </li>
                <li :class="{ passed: passwordChecks.specialChar }">
                  {{ passwordChecks.specialChar ? '✔' : '✖️' }} Incluye un carácter especial
                  (!@#$%^&*)
                </li>
                <li :class="{ passed: passwordChecks.minLength }">
                  {{ passwordChecks.minLength ? '✔' : '✖️' }} Debe contener al menos 12 carácteres
                </li>
              </ul>
            </div>
          </Transition>
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirmar contraseña:</label>
          <div class="password-container">
            <input
              :type="isInputVisible.confirmNewPassord ? 'text' : 'password'"
              class="form-control"
              :class="{ 'form-control--error': v$.confirmNewPassord.$error }"
              placeholder="Reingresa tu nueva contraseña"
              id="confirm-password"
              v-model.trim="newPasswordForm.confirmNewPassord"
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="isInputVisible.confirmNewPassord = !isInputVisible.confirmNewPassord"
              class="toggle-btn bg-blue-100"
            >
              <EyeIcon class="icon-password size-8" v-if="!isInputVisible.confirmNewPassord" />
              <EyeSlashIcon class="icon-password size-8" v-else />
            </button>
          </div>
          <span v-if="v$.confirmNewPassord.$error">
            <p v-for="error of v$.confirmNewPassord.$errors" :key="error.$uid" class="text-error">
              {{ error.$message }}
            </p>
          </span>
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-primary"
        :class="{ 'btn-primary--disabled': v$.$invalid }"
        :disabled="v$.$invalid"
      >
        Cambiar contraseña
      </button>
    </form>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
