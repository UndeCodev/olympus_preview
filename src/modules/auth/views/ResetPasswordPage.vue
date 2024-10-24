<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import useVuelidate from '@vuelidate/core';
import { helpers, required, sameAs } from '@vuelidate/validators';
import { useToast } from 'vue-toast-notification';
import olympusAPI from '@/api/olympusAPI';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';
import router from '@/router';

// Regular Expresions
const passwordRegex = helpers.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$/,
);

// Properties
const token = ref('');
const isSendingForm = ref(false);

const newPasswordForm = reactive({
  newPassword: '',
  confirmPassword: '',
});

const passwordChecks = ref({
  lowercaseUppercase: false,
  number: false,
  specialChar: false,
  minLength: false,
});

const passwordStatus = ref('');
const strengthPercent = ref(0);

// Input references
const isInputNewPasswordVisible = ref(false);
const isInputConfirmPasswordVisible = ref(false);

// Rules for Vuelidate
const passwordRules = {
  newPassword: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    password: helpers.withMessage(
      'Por favor agrega todos los carácteres necesarios.',
      passwordRegex,
    ),
  },
  confirmPassword: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    sameAs: helpers.withMessage(
      'Las contraseñas no coinciden',
      sameAs(computed(() => newPasswordForm.newPassword)),
    ),
  },
};

// Instances
const v$ = useVuelidate(passwordRules, newPasswordForm);
const $toast = useToast();

const route = useRoute();

const link = document.querySelector("link[rel~='icon']");
const logo = ref('');

// Methods of lifecycle

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

    const isUnsafePassword = response.data === 'Comprometida';

    passwordStatus.value = !isUnsafePassword
      ? ''
      : 'Contraseña comprometida, por favor utiliza otra.';
  } catch (error) {
    console.error('Error verificando la contraseña:', error);
    passwordStatus.value = 'Error verificando la contraseña';
  }
};

const onResetPassword = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    isSendingForm.value = true;
    const { status, data } = await olympusAPI.put(
      '/auth/reset-password',
      {
        newPassword: newPasswordForm.newPassword,
      },
      {
        params: {
          token: token.value,
        },
      },
    );

    if (status !== 200) return;

    $toast.open({
      message: data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    isSendingForm.value = false;
    router.replace({ name: 'inicio-sesion' });
  } catch (error) {
    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });

    isSendingForm.value = false;
  }
};

const fetchDataWebsite = async () => {
  try {
    const { data } = await olympusAPI.get('/settings/company-profile');
    const { thumbnail_logo_url, page_title } = data;

    link.href = thumbnail_logo_url;
    document.title = page_title ?? 'Olympus GYM';

    logo.value = thumbnail_logo_url;
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  await fetchDataWebsite();

  if (route.query?.token) {
    token.value = route.query.token.toString();
  }

  if (!token.value || token.value.length < 20) return router.replace('inicio-sesion');
});
</script>

<template>
  <div class="h-screen grid place-items-center">
    <form
      @submit.prevent="onResetPassword"
      class="grid gap-6 bg-white shadow p-8 rounded-sm md:w-1/2 lg:w-1/4 mx-8"
    >
      <div class="form-information mb-3">
        <img
          v-if="logo"
          :src="logo"
          alt="Logo Olympus GYM"
          class="size-40 bg-slate-900 rounded-full mb-6"
        />
        <h1 class="text-3xl font-semibold mb-3 text-slate-900">Crea una contraseña nueva</h1>
        <p class="text-slate-600">
          Ingresa una nueva contraseña para tu cuenta. Asegúrate de que sea segura y fácil de
          recordar.
        </p>
      </div>
      <div class="form-group">
        <label for="password">Contraseña nueva:</label>
        <div class="password-container">
          <input
            :type="isInputNewPasswordVisible ? 'text' : 'password'"
            :class="{ 'form-control--error': v$.newPassword.$error }"
            class="form-control"
            placeholder="Introduce tu nueva contraseña"
            v-model.trim="newPasswordForm.newPassword"
            @input="checkPasswordStrength"
            @blur="checkPassword"
            autocomplete="new-password"
          />
          <button
            type="button"
            @click="isInputNewPasswordVisible = !isInputNewPasswordVisible"
            class="toggle-btn bg-blue-100"
          >
            <EyeIcon class="icon-password size-8" v-if="!isInputNewPasswordVisible" />
            <EyeSlashIcon class="icon-password size-8" v-else />
          </button>
        </div>
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
        <label for="password">Confirma tu contraseña:</label>
        <div class="password-container">
          <input
            :type="isInputConfirmPasswordVisible ? 'text' : 'password'"
            :class="{ 'form-control--error': v$.confirmPassword.$error }"
            class="form-control"
            placeholder="Confirma tu contraseña"
            v-model.trim="newPasswordForm.confirmPassword"
            autocomplete="new-password"
          />
          <button
            type="button"
            @click="isInputConfirmPasswordVisible = !isInputConfirmPasswordVisible"
            class="toggle-btn bg-blue-100"
          >
            <EyeIcon class="icon-password size-8" v-if="!isInputConfirmPasswordVisible" />
            <EyeSlashIcon class="icon-password size-8" v-else />
          </button>
        </div>
        <span v-if="v$.confirmPassword.$error">
          <p v-for="error of v$.confirmPassword.$errors" :key="error.$uid" class="text-error">
            {{ error.$message }}
          </p>
        </span>
      </div>
      <button type="submit" class="btn btn-primary mt-3">
        <span v-if="!isSendingForm"> Cambiar contraseña </span>
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
  </div>
</template>
