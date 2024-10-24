<script setup>
import { useAuthStore } from '../store/useAuthStore';
import { ref, reactive, computed } from 'vue';

import useVuelidate from '@vuelidate/core';
import { helpers, required, numeric, email, sameAs } from '@vuelidate/validators';

import { weakPasswords } from '../helpers/weakPasswords';
import { useToast } from 'vue-toast-notification';
import olympusAPI from '@/api/olympusAPI';
import {
  UserIcon,
  IdentificationIcon,
  InboxArrowDownIcon,
  CheckIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline';

import router from '@/router';

// Store
const authStore = useAuthStore();

// Helpers
const passwordRegex = helpers.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$/,
);

const alphaWithSpaces = helpers.regex(/^[a-zA-ZáéíóúüÁÉÍÓÚñÑ\s]+$/);

const isPasswordWeak = (password) => !weakPasswords.includes(password);

const isTooYoung = computed(() => {
  if (!registerForm.birthdate) return false;
  const userDate = new Date(registerForm.birthdate);
  const sixteenYearsAgo = new Date(maxDate.value);

  return userDate > sixteenYearsAgo;
});

// Vuelidate rules
const registerRules = {
  name: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    alphaWithSpaces: helpers.withMessage('Solo se permiten letras', alphaWithSpaces),
  },
  lastname: {
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
  birthdate: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    isTooYoung: helpers.withMessage(
      'Necesitas ser mayor de edad para poder registrarte',
      () => !isTooYoung.value,
    ),
  },
  password: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    passwordRegex: helpers.withMessage('No cumple con los requisitos mínimos', passwordRegex),
    isPasswordWeak: helpers.withMessage('Contraseña altamente débil.', isPasswordWeak),
  },
  repeatPassword: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    sameAs: helpers.withMessage(
      'Las contraseñas no coinciden',
      sameAs(computed(() => registerForm.password)),
    ),
  },
};

// Properties
const registerForm = reactive({
  emailR: '',
  name: '',
  lastname: '',
  phone: '',
  birthdate: '',
  password: '',
  repeatPassword: '',
});

// const formattedPhoneNumber = ref(''); // Variable para mostrar el número de teléfono con formato

const isPasswordVisible = ref(false);
const isPasswordConfirmVisible = ref(false);

const passwordChecks = ref({
  lowercaseUppercase: false,
  number: false,
  specialChar: false,
  minLength: false,
});

const passwordStatus = ref('');
const strengthPercent = ref(0);

const currentDate = new Date();
const currentStep = ref(1);

// Instances
const v$ = useVuelidate(registerRules, registerForm);
const $toast = useToast();

// Methods

const checkPasswordStrength = () => {
  const pass = registerForm.password;

  passwordChecks.value.lowercaseUppercase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
  passwordChecks.value.number = /\d/.test(pass);
  passwordChecks.value.specialChar = /[!@#$%^&*]/.test(pass);
  passwordChecks.value.minLength = pass.length >= 12;

  // Calcula el porcentaje de fortaleza
  const passedChecks = Object.values(passwordChecks.value).filter(Boolean).length;
  strengthPercent.value = (passedChecks / 4) * 100;
};

const checkPassword = async () => {
  if (!registerForm.password || registerForm.password.length < 12 || v$.value.password.$error)
    return;

  try {
    const response = await olympusAPI.post('/auth/check-pswd', {
      password: registerForm.password,
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

// Bug with the v-model

// const formatPhoneNumber = () => {
//   // Aplica el formato: XXX-XXX-XXXX
//   if (registerForm.phone.length > 0) {
//     formattedPhoneNumber.value = registerForm.phone
//       .replace(/(\d{3})(\d{3})(\d{0,4})/, '$1-$2-$3')
//       .replace(/-$/, ''); // Evita un guión al final si está incompleto
//   }
// };

const maxDate = computed(() => {
  const year = currentDate.getFullYear() - 16;
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const nextStep = () => {
  const { isInvalidForm, currentInvalidStep } = checkFields();

  if (isInvalidForm && currentInvalidStep === currentStep.value) return;

  if (currentStep.value < 4) {
    currentStep.value++;
  }
};

const prevStep = () => {
  v$.value.$reset();

  if (currentStep.value > 1 && currentStep.value < 4) {
    currentStep.value--;
  }
};

const checkFields = () => {
  if (currentStep.value === 1) {
    v$.value.name.$touch();
    v$.value.lastname.$touch();
    v$.value.phone.$touch();
    v$.value.birthdate.$touch();

    const isInvalidForm = Boolean(v$.value.$errors.length);

    return isInvalidForm ? { isInvalidForm, currentInvalidStep: 1 } : false;
  }

  if (currentStep.value === 2) {
    v$.value.emailR.$touch();
    v$.value.password.$touch();
    v$.value.repeatPassword.$touch();

    const isInvalidForm = Boolean(v$.value.$errors.length);
    return isInvalidForm ? { isInvalidForm, currentInvalidStep: 2 } : false;
  }

  return false;
};

const onRegister = async () => {
  const { ok, message } = await authStore.register(registerForm);

  if (!ok) {
    $toast.open({
      message: message,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });

    return;
  }

  $toast.open({
    message: 'Cuenta creada correctamente 🎉🎉🎉',
    type: 'success',
    duration: 4000,
    pauseOnHover: true,
  });

  $toast.open({
    message: 'Ahora un último paso antes de iniciar sesión...',
    type: 'info',
    duration: 5000,
    pauseOnHover: true,
  });
  currentStep.value = 4;
};

const resendVerificationEmail = async () => {
  try {
    const res = await olympusAPI.post('/auth/resend-verification-email', {
      email: registerForm.emailR,
    });

    console.log(res);
    if (res.status !== 200) return;

    $toast.open({
      message: res.data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
  } catch (error) {
    if (error.status === 400) {
      $toast.open({
        message: error.response.data?.message,
        type: 'info',
        duration: 4000,
        pauseOnHover: true,
      });

      router.replace({ name: 'inicio-sesion' });
      return;
    }

    $toast.open({
      message: error.response.data?.message,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};
</script>

<template>
  <section class="w-screen h-screen register-container p-5">
    <aside class="bg-slate-100 rounded grid place-content-between p-10">
      <div class="form-steps__information form-steps">
        <h1 class="text-4xl font-bold mb-14">Olympus GYM</h1>
        <div
          class="step step-container transition-all duration-700"
          :class="{ 'opacity-50': currentStep != 1 }"
        >
          <div class="step__icon rounded-lg">
            <UserIcon class="size-7" />
          </div>
          <div class="step__information">
            <h4 class="text-2xl font-bold text-slate-900">Información personal</h4>
            <p class="text-slate-800">
              Proporcione su nombre, apellidos, número de teléfono y fecha de nacimiento.
            </p>
          </div>
        </div>
        <div
          class="step step-container transition-all duration-700"
          :class="{ 'opacity-50': currentStep != 2 }"
        >
          <div class="step__icon rounded-lg">
            <IdentificationIcon class="size-7" />
          </div>
          <div class="step__information">
            <h4 class="text-2xl font-bold text-slate-900">Credenciales de la Cuenta</h4>
            <p class="text-slate-600">
              Introduzca su correo electrónico, elija una contraseña y confírmela.
            </p>
          </div>
        </div>
        <div
          class="step step-container transition-all duration-700"
          :class="{ 'opacity-50': currentStep != 3 }"
        >
          <div class="step__icon rounded-lg">
            <CheckIcon class="size-7" />
          </div>
          <div class="step__information">
            <h4 class="text-2xl font-bold text-slate-900">Confirmación</h4>
            <p class="text-slate-600">
              Revise los detalles proporcionados antes de completar el registro.
            </p>
          </div>
        </div>
        <div
          class="step step-container transition-all duration-700"
          :class="{ 'opacity-50': currentStep != 4 }"
        >
          <div class="step__icon rounded-lg">
            <InboxArrowDownIcon class="size-7" />
          </div>
          <div class="step__information">
            <h4 class="text-2xl font-bold text-slate-900">Verificación de email</h4>
            <p class="text-slate-600">
              Antes de iniciar sesión, necesitarás validar tu correo electrónico.
            </p>
          </div>
        </div>
      </div>
      <div class="grid grid-flow-col gap-8">
        <RouterLink
          :to="{ name: 'inicio' }"
          class="btn btn-outline flex place-content-center place-items-center gap-4"
        >
          <ArrowLeftIcon class="size-8" /> Volver al inicio
        </RouterLink>
        <RouterLink
          :to="{ name: 'inicio-sesion' }"
          class="btn btn-primary flex place-content-center place-items-center"
          >Iniciar sesión</RouterLink
        >
      </div>
    </aside>
    <main class="bg-blue-300 grid place-content-center">
      <form @submit.prevent="onRegister" class="bg-white rounded-md shadow form-container p-10">
        <div v-if="currentStep === 1" class="step-1 grid gap-8">
          <div class="grid gap-4 mb-8">
            <h1 class="text-4xl font-semibold text-slate-900">Información personal</h1>
            <p class="text-3xl text-slate-800">
              Complete los campos para que podamos conocerte mejor.
            </p>
          </div>
          <div class="form-group--fullname">
            <div class="form-group grid">
              <label for="name">Nombre</label>
              <input
                type="text"
                placeholder="Jane"
                class="form-control"
                :class="{ 'form-control--error': v$.name.$error }"
                id="name"
                v-model.trim="registerForm.name"
              />
              <span v-if="v$.name.$error">
                <p v-for="error of v$.name.$errors" :key="error.$uid" class="text-error">
                  {{ error.$message }}
                </p>
              </span>
            </div>
            <div class="form-group grid">
              <label for="lastname">Apellidos</label>
              <input
                type="text"
                placeholder="Doe"
                class="form-control"
                :class="{ 'form-control--error': v$.lastname.$error }"
                id="lastname"
                v-model.trim="registerForm.lastname"
              />
              <span v-if="v$.lastname.$error">
                <p v-for="error of v$.lastname.$errors" :key="error.$uid" class="text-error">
                  {{ error.$message }}
                </p>
              </span>
            </div>
          </div>
          <div class="form-group grid">
            <label for="phone">Teléfono</label>
            <input
              type="text"
              placeholder="8221234442"
              class="form-control"
              :class="{ 'form-control--error': v$.phone.$error }"
              id="phone"
              v-model.trim="registerForm.phone"
            />
            <span v-if="v$.phone.$error">
              <p v-for="error of v$.phone.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>
          <div class="form-group grid">
            <label for="birthdate">Fecha de nacimiento:</label>
            <input
              type="date"
              class="form-control"
              :class="{ 'form-control--error': v$.birthdate.$error }"
              id="birthdate"
              :max="maxDate"
              v-model="registerForm.birthdate"
            />
            <span v-if="v$.birthdate.$error">
              <p v-for="error of v$.birthdate.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>
        </div>

        <!-- Sección 2: Credenciales de la Cuenta -->
        <div v-if="currentStep === 2" class="step-2 grid gap-8">
          <div class="grid gap-4 mb-8">
            <h1 class="text-4xl font-semibold text-slate-900">Credenciales de la Cuenta</h1>
            <p class="text-3xl text-slate-800">
              Asegúrate de utilizar un correo válido y una contraseña segura.
            </p>
          </div>
          <!-- Campos de credenciales -->
          <div class="form-group grid gap-3">
            <label for="email">Correo electrónico:</label>
            <input
              type="text"
              placeholder="janedoe@outlook.com"
              class="form-control"
              :class="{ 'form-control--error': v$.emailR.$error }"
              id="email"
              v-model.trim="registerForm.emailR"
            />

            <span v-if="v$.emailR.$error">
              <p v-for="error of v$.emailR.$errors" :key="error.$uid" class="text-error">
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
                :class="{ 'form-control--error': v$.password.$error || passwordStatus }"
                v-model="registerForm.password"
                @input="checkPasswordStrength"
                @blur="checkPassword"
                id="password"
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
            <span v-if="passwordStatus.length">
              <p class="text-error">{{ passwordStatus }}</p>
            </span>
            <span v-if="v$.password.$error">
              <p v-for="error of v$.password.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
            <div class="strength-meter">
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
          <div class="form-group grid gap-3">
            <label for="repeat-password">Confirmar contraseña:</label>
            <div class="password-container">
              <input
                :type="isPasswordConfirmVisible ? 'text' : 'password'"
                placeholder="**********"
                class="form-control"
                :class="{ 'form-control--error': v$.repeatPassword.$error }"
                id="repeat-password"
                v-model="registerForm.repeatPassword"
              />
              <button
                type="button"
                @click="isPasswordConfirmVisible = !isPasswordConfirmVisible"
                class="toggle-btn bg-blue-100"
              >
                <EyeIcon class="icon-password size-8" v-if="!isPasswordConfirmVisible" />
                <EyeSlashIcon class="icon-password size-8" v-else />
              </button>
            </div>
            <span v-if="v$.repeatPassword.$error">
              <p class="text-error">
                {{ v$.repeatPassword.$errors[0].$message }}
              </p>
            </span>
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-3 grid gap-8">
          <h2 class="text-4xl font-semibold">Confirmación</h2>
          <p class="text-3xl">Revise los detalles proporcionados antes de completar el registro.</p>
          <ul>
            <li>Nombre: {{ registerForm.name }}</li>
            <li>Apellidos: {{ registerForm.lastname }}</li>
            <li>Teléfono: {{ registerForm.phone }}</li>
            <li>Fecha de nacimiento: {{ registerForm.birthdate }}</li>
            <li>Correo electrónico: {{ registerForm.emailR }}</li>
          </ul>
        </div>

        <div v-if="currentStep === 4" class="step-4 grid gap-8">
          <h2 class="text-4xl font-semibold">Verificación de Email</h2>
          <p class="text-3xl">
            Antes de iniciar sesión, necesitarás validar tu correo electrónico.
          </p>
          <img
            src="../../../assets/images/illustrations/undraw_mailbox_re_dvds.svg"
            alt="Mailbox"
            class="size-56 mx-auto"
          />
          <p class="text-center">
            Hemos enviado un correo a
            <span class="text-blue-500 font-semibold">{{ registerForm.emailR }}</span> para
            confirmar la validez de tu correo electrónico.
          </p>
          <p class="text-center">Si no recibiste ningún correo, da clic en reenviar código.</p>
          <button type="button" class="btn btn-primary" @click="resendVerificationEmail">
            <span v-if="!authStore.isChecking">Reenviar correo de confirmación</span>
            <div v-else class="sk-chase w-8 h-8 mx-auto">
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
            </div>
          </button>
        </div>

        <div
          v-if="currentStep < 4"
          class="form-button"
          :class="{ 'form-button--two-columns': currentStep > 1 }"
        >
          <button
            type="button"
            @click="prevStep"
            v-show="currentStep > 1"
            class="btn btn-outline grid grid-flow-col place-content-center place-items-end gap-4"
          >
            <ArrowLeftIcon class="size-8" /> Anterior
          </button>
          <button
            type="button"
            @click="nextStep"
            class="btn btn-primary grid grid-flow-col place-content-center place-items-end gap-4"
            v-show="currentStep < 3"
          >
            Siguiente
          </button>
          <button
            type="submit"
            class="btn btn-primary grid grid-flow-col place-content-center place-items-end gap-4"
            v-show="currentStep === 3"
          >
            <span v-if="!authStore.isChecking">Crear cuenta</span>
            <div v-else class="sk-chase w-8 h-8 mx-auto">
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
              <div class="sk-chase-dot"></div>
            </div>
          </button>
        </div>
      </form>
    </main>
  </section>
</template>

<style scoped>
.register-container {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr 3fr;
  column-gap: 2rem;
}

.form-steps {
  display: grid;
  place-content: start;
  gap: 4.2rem;
}

.step-container {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: auto 2fr;
  gap: 1.6rem;
}

.step__icon {
  width: 4rem;
  height: 4rem;
  display: grid;
  place-content: center;
  background: white;
  border: 1px solid #eaeaea;
  z-index: 1;
}

.step__information {
  display: grid;
  gap: 4px;
}

.form-container {
  display: grid;
  gap: 2.4rem;
  min-width: 45rem;
  max-width: 50rem;
}

.form-group {
  display: grid;
  gap: 4px;
}

.form-button {
  display: grid;
  grid-auto-flow: column;
  gap: 1.6rem;
}

.form-button--two-columns {
  grid-template-columns: 1fr 2fr;
}

.form-group--fullname {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr 2fr;
  place-items: start;
  gap: 1.6rem;
}

.step {
  position: relative;
  z-index: 2;
}

.step:not(:last-child)::before {
  content: '';
  position: absolute;
  width: 2px;
  height: 8.5rem;
  top: 3rem;
  left: 1.8rem;
  background-color: #eaeaea;
}
</style>
