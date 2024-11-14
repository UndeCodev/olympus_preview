<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto md:w-10/12">
      <div
        class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-xl transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"
      ></div>
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">
          <h1 class="text-2xl font-semibold mb-6 text-center">
            Configuración de Correo Electrónico
          </h1>
          <form @submit.prevent="submitForm">
            <div class="mb-4">
              <label for="emailType" class="block text-xl font-medium text-gray-700"
                >Tipo de Correo</label
              >
              <select
                id="emailType"
                v-model="selectedType"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                @change="fetchDataEmailByType"
              >
                <option value="">Seleccione un tipo</option>
                <option value="REENVIO_VERIFICACION_EMAIL">Reenviar verificación email</option>
                <option value="RESTABLECER_CONTRASENA">Restablecer contraseña</option>
                <option value="REGISTRO_USUARIO">Registro de usuario</option>
              </select>
            </div>

            <div v-if="selectedType" class="space-y-4">
              <div>
                <label for="subject" class="block text-xl font-medium text-gray-700">Asunto</label>
                <input
                  type="text"
                  id="subject"
                  v-model.trim="formData.subject"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                  :class="{ 'form-control--error': v$.formData.subject.$error }"
                />
                <span v-if="v$.formData.subject.$error">
                  <p
                    v-for="error of v$.formData.subject.$errors"
                    :key="error.$uid"
                    class="text-error text-xl mt-1"
                  >
                    {{ error.$message }}
                  </p>
                </span>
              </div>

              <div>
                <label for="greeting" class="block text-xl font-medium text-gray-700">Saludo</label>
                <input
                  type="text"
                  id="greeting"
                  v-model="formData.greeting"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                  :class="{ 'form-control--error': v$.formData.greeting.$error }"
                />
                <span v-if="v$.formData.greeting.$error">
                  <p
                    v-for="error of v$.formData.greeting.$errors"
                    :key="error.$uid"
                    class="text-error text-xl mt-1"
                  >
                    {{ error.$message }}
                  </p>
                </span>
              </div>

              <div>
                <label for="message" class="block text-xl font-medium text-gray-700">Mensaje</label>
                <textarea
                  id="message"
                  v-model="formData.message"
                  rows="3"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                  :class="{ 'form-control--error': v$.formData.message.$error }"
                ></textarea>
                <span v-if="v$.formData.message.$error">
                  <p
                    v-for="error of v$.formData.message.$errors"
                    :key="error.$uid"
                    class="text-error text-xl mt-1"
                  >
                    {{ error.$message }}
                  </p>
                </span>
              </div>

              <div>
                <label for="buttonText" class="block text-xl font-medium text-gray-700"
                  >Texto del Botón</label
                >
                <input
                  type="text"
                  id="buttonText"
                  v-model="formData.buttonText"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                  :class="{ 'form-control--error': v$.formData.buttonText.$error }"
                />
                <span v-if="v$.formData.buttonText.$error">
                  <p
                    v-for="error of v$.formData.buttonText.$errors"
                    :key="error.$uid"
                    class="text-error text-xl mt-1"
                  >
                    {{ error.$message }}
                  </p>
                </span>
              </div>

              <div>
                <label for="expirationTime" class="block text-xl font-medium text-gray-700"
                  >Tiempo de Expiración (minutos)</label
                >
                <input
                  type="number"
                  id="expirationTime"
                  v-model="formData.expirationTime"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                  :class="{ 'form-control--error': v$.formData.expirationTime.$error }"
                />
                <span v-if="v$.formData.expirationTime.$error">
                  <p
                    v-for="error of v$.formData.expirationTime.$errors"
                    :key="error.$uid"
                    class="text-error text-xl mt-1"
                  >
                    {{ error.$message }}
                  </p>
                </span>
              </div>
            </div>

            <div class="mt-6">
              <button
                type="submit"
                :disabled="!selectedType || v$.formData.$invalid"
                class="btn btn-primary w-full text-xl cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <span v-if="!isSendingData">Guardar configuración</span>
                <div v-else class="sk-chase w-7 h-7 mx-auto">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

import useVuelidate from '@vuelidate/core';
import {
  helpers,
  required,
  minLength,
  maxLength,
  integer,
  minValue,
  maxValue,
} from '@vuelidate/validators';

import { useToast } from 'vue-toast-notification';

import olympusAPI from '@/api/olympusAPI';

// Properties
const selectedType = ref('');
const isSendingData = ref(false);

const formData = reactive({
  subject: '',
  greeting: '',
  message: '',
  buttonText: '',
  expirationTime: '',
});

// Vuelidate rules
const formRules = {
  formData: {
    subject: {
      $autoDirty: true,
      required: helpers.withMessage('El asunto es obligatorio', required),
      minLength: helpers.withMessage('El asunto debe tener al menos 3 caracteres', minLength(3)),
      maxLength: helpers.withMessage(
        'El asunto no debe exceder los 100 caracteres',
        maxLength(100),
      ),
    },
    greeting: {
      $autoDirty: true,
      required: helpers.withMessage('El saludo es obligatorio', required),
      minLength: helpers.withMessage('El saludo debe tener al menos 3 caracteres', minLength(3)),
      maxLength: helpers.withMessage('El saludo no debe exceder los 50 caracteres', maxLength(50)),
    },
    message: {
      $autoDirty: true,
      required: helpers.withMessage('El mensaje es obligatorio', required),
      minLength: helpers.withMessage('El mensaje debe tener al menos 10 caracteres', minLength(10)),
      maxLength: helpers.withMessage(
        'El mensaje no debe exceder los 500 caracteres',
        maxLength(500),
      ),
    },
    buttonText: {
      $autoDirty: true,
      required: helpers.withMessage('El texto del botón es obligatorio', required),
      minLength: helpers.withMessage(
        'El texto del botón debe tener al menos 2 caracteres',
        minLength(2),
      ),
      maxLength: helpers.withMessage(
        'El texto del botón no debe exceder los 35 caracteres',
        maxLength(35),
      ),
    },
    expirationTime: {
      $autoDirty: true,
      required: helpers.withMessage('El tiempo de expiración es obligatorio', required),
      integer: helpers.withMessage('El tiempo de expiración debe ser un número entero', integer),
      minValue: helpers.withMessage(
        'El tiempo de expiración debe ser al menos 1 minuto',
        minValue(1),
      ),
      maxValue: helpers.withMessage(
        'El tiempo de expiración no debe exceder los 1440 minutos (24 horas)',
        maxValue(1440),
      ),
    },
  },
};

// Instances
const $toast = useToast();
const v$ = useVuelidate(formRules, { formData });

// Vue Methods
watch(selectedType, (newType) => {
  if (newType) {
    // Object.assign(formData, emailTypes[newType]);
  } else {
    console.log('Se limpia');
    Object.keys(formData).forEach((key) => (formData[key] = ''));
  }
});

// Methods
const fetchDataEmailByType = async (event) => {
  const typeEmailSelected = event.target.value;

  if (!typeEmailSelected.length) return;

  try {
    isSendingData.value = true;
    const response = await olympusAPI.post('/admin/emails-settings', {
      typeEmail: typeEmailSelected,
    });

    const { emailConfig } = response.data;

    formData.subject = emailConfig.asunto;
    formData.greeting = emailConfig.saludo;
    formData.message = emailConfig.mensaje;
    formData.buttonText = emailConfig.texto_boton;
    formData.expirationTime = emailConfig.tiempo_expiracion;

    isSendingData.value = false;
  } catch (error) {
    isSendingData.value = false;

    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

const submitForm = async () => {
  v$.value.formData.$touch();

  if (v$.value.formData.$invalid) return;

  try {
    isSendingData.value = true;

    await olympusAPI.put('/admin/emails-settings', {
      typeEmail: selectedType.value,
      subject: formData.subject,
      greeting: formData.greeting,
      message: formData.message,
      buttonText: formData.buttonText,
      expirationTime: formData.expirationTime,
    });

    isSendingData.value = false;

    $toast.open({
      message: 'Configuración guardada correctamente',
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
  } catch (error) {
    isSendingData.value = false;

    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};
</script>
