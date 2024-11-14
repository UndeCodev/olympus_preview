<template>
  <div v-if="!isLoading" class="bg-white rounded shadow p-12 md:w-2/3 lg:w-2/3 xl:w-1/2 mx-auto">
    <h1 class="text-4xl font-semibold mb-6">Editar Perfil de Empresa</h1>

    <!-- Logo -->
    <div class="mb-6">
      <div class="flex items-center justify-center">
        <div
          v-if="logoPreview || companyForm.logoFile"
          class="w-48 h-48 flex items-center justify-center mb-2"
        >
          <img
            :src="logoPreview || companyForm.logoFile"
            alt="Logo Preview"
            class="max-w-full max-h-full object-contain"
          />
        </div>
        <div
          v-else
          class="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2"
        >
          <span class="text-gray-500 text-center">Sin Logo</span>
        </div>
      </div>
      <label for="logo" class="block text-gray-700 mb-1">Selecciona tu logo</label>
      <div class="grid grid-flow-col gap-4">
        <input
          id="logo"
          type="file"
          accept="image/jpeg,image/png"
          @change="handleLogoUpload"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button class="btn btn-primary" @click="btnCancelLogoUpload">Cancelar</button>
      </div>
      <p v-if="logoError" class="text-red-500 mt-1">{{ logoError }}</p>
    </div>

    <!-- Título de la página -->
    <div class="mb-6">
      <label for="pageTitle" class="block text-gray-700 mb-1">Título de la página</label>
      <input
        id="pageTitle"
        v-model="companyForm.pageTitle"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        :class="{ 'form-control--error': v$.pageTitle.$error }"
        maxlength="30"
      />
      <p class="text-lg text-gray-500 mt-1">{{ pageTitleCharCount }}/30 caracteres</p>
      <span v-if="v$.pageTitle.$error">
        <p v-for="error of v$.pageTitle.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </p>
      </span>
    </div>

    <!-- Slogan -->
    <div class="mb-6">
      <label for="slogan" class="block text-gray-700 mb-1">Slogan</label>
      <input
        id="slogan"
        v-model="companyForm.slogan"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        :class="{ 'form-control--error': v$.slogan.$error }"
      />
      <p class="text-lg text-gray-500 mt-1">{{ sloganCharCount }}/100 caracteres</p>
      <span v-if="v$.slogan.$error">
        <p v-for="error of v$.slogan.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </p>
      </span>
    </div>

    <!-- Datos de contacto -->
    <div class="mb-6">
      <h2 class="text-4xl font-medium mb-2">Datos de contacto</h2>

      <!-- Dirección -->
      <div class="mb-4">
        <label for="address" class="block text-gray-700 mb-1">Dirección:</label>
        <input
          id="address"
          v-model.trim="companyForm.address.address"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          :class="{ 'form-control--error': v$.address.city.$error }"
        />
        <span v-if="v$.address.address.$error">
          <p v-for="error of v$.address.address.$errors" :key="error.$uid" class="text-error">
            {{ error.$message }}
          </p>
        </span>
      </div>
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="city" class="block text-gray-700 mb-1">Ciudad</label>
          <input
            id="city"
            v-model="companyForm.address.city"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            :class="{ 'form-control--error': v$.address.city.$error }"
          />
          <span v-if="v$.address.city.$error">
            <p v-for="error of v$.address.city.$errors" :key="error.$uid" class="text-error">
              {{ error.$message }}
            </p>
          </span>
        </div>
        <div>
          <label for="state" class="block text-gray-700 mb-1">Estado/Provincia/Región</label>
          <input
            id="state"
            v-model="companyForm.address.state"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            :class="{ 'form-control--error': v$.address.state.$error }"
          />
          <span v-if="v$.address.state.$error">
            <p v-for="error of v$.address.state.$errors" :key="error.$uid" class="text-error">
              {{ error.$message }}
            </p>
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label for="postalCode" class="block text-gray-700 mb-1">Código Postal</label>
          <input
            id="postalCode"
            v-model="companyForm.address.postalCode"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            :class="{ 'form-control--error': v$.address.postalCode.$error }"
          />
          <span v-if="v$.address.postalCode.$error">
            <p v-for="error of v$.address.postalCode.$errors" :key="error.$uid" class="text-error">
              {{ error.$message }}
            </p>
          </span>
        </div>
        <div>
          <label for="country" class="block text-gray-700 mb-1">País</label>
          <select
            id="country"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled="true"
          >
            <option value="MX" selected="selected" disabled="true">México</option>
          </select>
        </div>
      </div>

      <!-- Correo electrónico -->
      <div class="mb-4">
        <label for="email" class="block text-gray-700 mb-1">Correo electrónico</label>
        <input
          id="email"
          v-model="companyForm.emailContact"
          type="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          :class="{ 'form-control--error': v$.emailContact.$error }"
        />
        <span v-if="v$.emailContact.$error">
          <p v-for="error of v$.emailContact.$errors" :key="error.$uid" class="text-error">
            {{ error.$message }}
          </p>
        </span>
      </div>

      <!-- Teléfono -->
      <div>
        <label for="phone" class="block text-gray-700 mb-1">Teléfono</label>
        <input
          id="phone"
          v-model="companyForm.phone"
          type="tel"
          maxlength="10"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          :class="{ 'form-control--error': v$.phone.$error }"
        />
        <p v-if="v$.phone.$error" class="text-red-500 mt-1">
          {{ v$.phone.numeric.$message }}
        </p>
      </div>
    </div>

    <!-- Redes Sociales -->
    <div class="mb-6 grid gap-4">
      <h2 class="font-medium mb-2">Redes Sociales</h2>
      <div
        v-for="(social, index) in companyForm.socialMedia"
        :key="index"
        class="flex items-start gap-3 mb-2 flex-wrap"
      >
        <div>
          <input
            v-model="social.social_name"
            type="url"
            placeholder="Red social"
            class="focus:outline-none mr-2 px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500"
            :class="{
              'form-control--error':
                v$.socialMedia.$each.$response.$errors[index].social_name.length,
            }"
          />
          <span v-if="v$.socialMedia.$each.$response.$errors[index].social_name.length">
            <p
              v-for="error of v$.socialMedia.$each.$response.$errors[index].social_name"
              :key="error"
              class="text-error"
            >
              {{ error.$message }}
            </p>
          </span>
        </div>
        <div class="flex-grow grid col-span-6">
          <input
            v-model="social.social_url"
            type="url"
            placeholder="Introduce la URL de tu red social"
            class="focus:outline-none mr-2 px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500"
            :class="{
              'form-control--error':
                v$.socialMedia.$each.$response.$errors[index].social_url.length,
            }"
            :disabled="social.social_name.length < 3"
          />
          <span v-if="v$.socialMedia.$each.$response.$errors[index].social_url.length">
            <p
              v-for="error of v$.socialMedia.$each.$response.$errors[index].social_url"
              :key="error"
              class="text-error"
            >
              {{ error.$message }}
            </p>
          </span>
        </div>
        <button
          @click="removeSocialMedia(index)"
          class="text-red-500 hover:text-red-700 place-self-center"
        >
          <TrashIcon class="size-8" />
        </button>
      </div>
      <button
        @click="addSocialMedia"
        class="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 place-self-end"
      >
        Añadir red social
      </button>
    </div>
    <!-- Botón de guardar -->
    <button
      @click="updateCompanyProfile"
      class="w-full btn btn-primary disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:text-white"
      :disabled="v$.$invalid || logoError.length"
    >
      <span v-if="!isSendingData">Guardar cambios</span>
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
  <div v-else class="h-screen place-content-center">
    <div class="sk-chase w-24 h-24 mx-auto">
      <div class="sk-chase-dot before:bg-slate-900"></div>
      <div class="sk-chase-dot before:bg-slate-900"></div>
      <div class="sk-chase-dot before:bg-slate-900"></div>
      <div class="sk-chase-dot before:bg-slate-900"></div>
      <div class="sk-chase-dot before:bg-slate-900"></div>
      <div class="sk-chase-dot before:bg-slate-900"></div>
    </div>
  </div>
</template>

<script setup>
import olympusAPI from '@/api/olympusAPI';
import { TrashIcon } from '@heroicons/vue/24/outline';
import useVuelidate from '@vuelidate/core';
import { required, helpers, numeric, email } from '@vuelidate/validators';

import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toast-notification';

const isLoading = ref(false);
const isSendingData = ref(false);

// Helpers & regular expresions
const zipCode = helpers.regex(/^\d{5}$/);
const alphaWithSpaces = helpers.regex(/^[a-zA-ZáéíóúüÁÉÍÓÚñÑ\s]+$/);
const slogan = helpers.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:¿?¡!()\-"'/+*=$]+$/);
const address = helpers.regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,\-/()]+$/);

// Vuelidate rules
const formRules = {
  pageTitle: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    alphaWithSpaces: helpers.withMessage('Solo debe de contener letras', alphaWithSpaces),
  },
  slogan: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    alphaWithSpaces: helpers.withMessage(
      'Algunos caracteres ingresados no están permitidos. Solo se permiten letras, números y signos de puntuación comunes.',
      slogan,
    ),
  },
  address: {
    address: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      alphaWithSpaces: helpers.withMessage(
        'Caracteres no permitidos: @, #, $, *, &, %. Usa solo letras, números y puntuación básica.',
        address,
      ),
    },
    city: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      alphaWithSpaces: helpers.withMessage('Solo debe de contener letras', alphaWithSpaces),
    },
    state: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      alphaWithSpaces: helpers.withMessage('Solo debe de contener letras', alphaWithSpaces),
    },
    postalCode: {
      $autoDirty: true,
      required: helpers.withMessage('Este campo es obligatorio', required),
      numeric: helpers.withMessage('Solo se permiten números', numeric),
      zipCode: helpers.withMessage('Ingresa un código postal correcto.', zipCode),
    },
  },
  emailContact: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    email: helpers.withMessage('Debe ser un email válido', email),
  },
  phone: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
    numeric: helpers.withMessage('Solo se permiten números', numeric),
  },
  socialMedia: {
    // Validación para cada elemento del array (validaciones anidadas)
    $each: helpers.forEach({
      $autoDirty: true,
      social_name: {
        required: helpers.withMessage('Este campo es obligatorio', required),
        alphaWithSpaces: helpers.withMessage(
          'Este campo solo puede contener letras',
          alphaWithSpaces,
        ),
      },
      social_url: {
        required: helpers.withMessage('Este campo es obligatorio', required),
      },
    }),
  },
};

// Logo
const logoError = ref('');
const logoPreview = ref('');

const actualLogo = ref('');

const companyForm = reactive({
  id: '',
  logoFile: '',
  pageTitle: '',
  slogan: '',
  address: {
    address: '',
    city: '',
    postalCode: '',
    state: '',
  },
  emailContact: '',
  phone: '',
  socialMedia: [
    {
      social_name: '',
      social_url: '',
    },
  ],
});

// Instances
const v$ = useVuelidate(formRules, companyForm);
const $toast = useToast();

const handleLogoUpload = (event) => {
  const file = event.target.files[0];

  if (file && file.size > 2 * 1024 * 1024) {
    logoError.value = 'El tamaño del archivo no debe exceder 2MB';
    companyForm.logoFile = '';
  } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
    logoError.value = 'El archivo debe ser JPEG o PNG';
    companyForm.logoFile = '';
  } else {
    logoError.value = '';
    const reader = new FileReader();
    reader.onload = (e) => {
      companyForm.logoFile = file;
      logoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const btnCancelLogoUpload = () => {
  logoPreview.value = actualLogo.value;
  companyForm.logoFile = '';
  logoError.value = '';
};

watch(
  () => companyForm.pageTitle,
  (newTitle) => {
    document.title = newTitle.length > 3 ? newTitle : 'Olympus GYM';
  },
);

const pageTitleCharCount = computed(() => companyForm.pageTitle.length);
const sloganCharCount = computed(() => companyForm.slogan.length);

const addSocialMedia = () => {
  companyForm.socialMedia.push({ social_name: '', social_url: '' });
};

const removeSocialMedia = (index) => {
  if (companyForm.socialMedia.length > 1) {
    companyForm.socialMedia.splice(index, 1);
  }
};

const updateCompanyProfile = async () => {
  v$.value.$touch();

  if (v$.value.$invalid || logoError.value) return;

  const formData = new FormData();

  formData.append('id', companyForm.id);
  formData.append('pageTitle', companyForm.pageTitle);
  formData.append('slogan', companyForm.slogan);
  formData.append('email', companyForm.emailContact);
  formData.append('phoneNumber', companyForm.phone);

  if (companyForm.logoFile) {
    formData.append('logoFile', companyForm.logoFile);
  }

  // Añadir los campos de dirección
  formData.append('address', JSON.stringify(companyForm.address));

  // Añadir los campos de redes sociales
  formData.append('socialMedia', JSON.stringify(companyForm.socialMedia));

  try {
    isSendingData.value = true;
    const { data } = await olympusAPI.post('/settings/company-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (data.logo_updated) {
      const link = document.querySelector("link[rel~='icon']");
      link.href = data.logo_updated.thumbnail_url;
    }

    $toast.open({
      message: data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
    isSendingData.value = false;
  } catch (error) {
    isSendingData.value = false;
    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

// Función para obtener los datos del perfil de la empresa
const fetchCompanyProfile = async () => {
  try {
    isLoading.value = true;
    const { data } = await olympusAPI.get('/settings/company-profile');

    // Rellenar los campos del formulario con los datos obtenidos
    logoPreview.value = data.logo_url;
    actualLogo.value = data.logo_url;

    companyForm.id = data.id;
    companyForm.pageTitle = data.titulo_sitio;
    companyForm.slogan = data.eslogan;
    companyForm.phone = parseInt(data.numero_contacto);
    companyForm.emailContact = data.email;
    companyForm.address.address = data.direccion.address;
    companyForm.address.city = data.direccion.city;
    companyForm.address.state = data.direccion.state;
    companyForm.address.postalCode = data.direccion.postalCode;

    // Rellenar las redes sociales
    companyForm.socialMedia = data.redes_sociales || [
      {
        social_name: '',
        social_url: '',
      },
    ];

    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.error('Error al obtener los datos del perfil de la empresa:', error);
  }
};

// Llamada a la función cuando se monta el componente
onMounted(() => {
  fetchCompanyProfile();
});
</script>
