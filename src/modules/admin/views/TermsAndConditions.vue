<template>
  <div v-if="!isLoadingData" class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Listado de Términos y Condiciones</h1>
      <button
        @click="showTermsModal = true"
        class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        + Agregar Términos y Condiciones
      </button>
    </div>

    <!-- Modal de carga, visible solo si loading es true -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="sk-chase w-24 h-24">
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
      </div>
    </div>

    <!-- Modal para agregar Términos y Condiciones -->
    <div
      v-if="showTermsModal"
      @click.self="closeTermsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-md:w-2/3 w-1/3">
        <h2 class="text-2xl font-bold mb-4">Agregar Términos y Condiciones</h2>

        <!-- Formulario de términos y condiciones -->
        <form @submit.prevent="handleCreateTerms">
          <div class="mb-4">
            <label for="termsTitle" class="block text-gray-700 font-medium">Título</label>
            <input
              v-model="termsTitle"
              id="termsTitle"
              type="text"
              :class="{ 'form-control--error': v$.termsTitle.$error }"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span v-if="v$.termsTitle.$error">
              <p v-for="error of v$.termsTitle.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="termsContent" class="block text-gray-700 font-medium">Contenido</label>
            <textarea
              v-model="termsContent"
              id="termsContent"
              class="w-full p-2 h-40 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 overflow-y-scroll resize-none"
              :class="{ 'form-control--error': v$.termsContent.$error }"
            ></textarea>
            <span v-if="v$.termsContent.$error">
              <p v-for="error of v$.termsContent.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="termsEffectiveDate" class="block text-gray-700 font-medium"
              >Fecha de Vigencia</label
            >
            <input
              v-model="termsEffectiveDate"
              :min="today"
              id="termsEffectiveDate"
              type="date"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              :class="{ 'form-control--error': v$.termsEffectiveDate.$error }"
            />
            <span v-if="v$.termsEffectiveDate.$error">
              <p
                v-for="error of v$.termsEffectiveDate.$errors"
                :key="error.$uid"
                class="text-error"
              >
                {{ error.$message }}
              </p>
            </span>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-between items-center">
            <button type="button" @click="closeTermsModal" class="text-red-600 hover:text-red-800">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Crear Términos y Condiciones
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de vista completa para Términos y Condiciones -->
    <div
      v-if="showTermsModalView"
      @click.self="closeTermsModalView"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full md:w-9/12 lg:w-1/3 max-h-[80vh] lg:h-max-2/3"
      >
        <div class="p-6 space-y-6 h-full">
          <h2 class="text-3xl font-bold text-gray-800 border-b pb-2">{{ selectedTerms.title }}</h2>

          <div class="space-y-4 grid place-content-between h-full grid-cols-1">
            <div class="w-full">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Contenido:</h3>
              <p class="text-gray-600 bg-gray-50 p-4 rounded-md">{{ selectedTerms.content }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
              <div class="bg-blue-50 p-3 rounded-md">
                <p class="text-sm font-medium text-blue-800">Fecha de Vigencia</p>
                <p class="text-lg text-blue-900">{{ formatDate(selectedTerms.effectiveDate) }}</p>
              </div>
              <div class="bg-green-50 p-3 rounded-md">
                <p class="text-sm font-medium text-green-800">Fecha de Creación</p>
                <p class="text-lg text-green-900">{{ formatDate(selectedTerms.createdAt) }}</p>
              </div>
              <div class="bg-purple-50 p-3 rounded-md">
                <p class="text-sm font-medium text-purple-800">Última Actualización</p>
                <p class="text-lg text-purple-900">{{ formatDate(selectedTerms.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 flex justify-end p-4">
          <button
            @click="closeTermsModalView"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para editar Términos y Condiciones -->
    <div
      v-if="showEditModal"
      @click.self="closeEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-md:w-2/3 w-1/3">
        <h2 class="text-2xl font-bold mb-4">Editar Términos y Condiciones 123</h2>

        <!-- Formulario de términos y condiciones -->
        <form @submit.prevent="updateTerms">
          <div class="mb-4">
            <label for="termsTitle" class="block text-gray-700 font-medium">Título</label>
            <input
              v-model="termsTitle"
              id="termsTitle"
              type="text"
              :class="{ 'form-control--error': v$.termsTitle.$error }"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span v-if="v$.termsTitle.$error">
              <p v-for="error of v$.termsTitle.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="termsContent" class="block text-gray-700 font-medium">Contenido</label>
            <textarea
              v-model="termsContent"
              id="termsContent"
              class="w-full p-2 h-40 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 overflow-y-scroll resize-none"
              :class="{ 'form-control--error': v$.termsContent.$error }"
            ></textarea>
            <span v-if="v$.termsContent.$error">
              <p v-for="error of v$.termsContent.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="termsEffectiveDate" class="block text-gray-700 font-medium"
              >Fecha de Vigencia</label
            >
            <input
              v-model="termsEffectiveDate"
              :min="today"
              id="termsEffectiveDate"
              type="date"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              :class="{ 'form-control--error': v$.termsEffectiveDate.$error }"
            />
            <span v-if="v$.termsEffectiveDate.$error">
              <p
                v-for="error of v$.termsEffectiveDate.$errors"
                :key="error.$uid"
                class="text-error"
              >
                {{ error.$message }}
              </p>
            </span>
          </div>
          <!-- Radio buttons para seleccionar si es la versión actual -->
          <div class="mb-4">
            <label class="block text-gray-700 font-medium">¿Esta versión es vigente?</label>
            <div class="flex items-center">
              <input
                v-model="isCurrentVersion"
                type="radio"
                value="true"
                id="current-yes"
                class="mr-2"
              />
              <label for="current-yes" class="mr-4">Sí</label>
              <input
                v-model="isCurrentVersion"
                type="radio"
                value="false"
                id="current-no"
                class="mr-2"
              />
              <label for="current-no">No</label>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-between items-center">
            <button type="button" @click="closeEditModal" class="text-red-600 hover:text-red-800">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Actualizar Términos y Condiciones
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filtro por estado -->
    <div class="flex justify-start items-center mb-4">
      <label class="mr-4 text-gray-700 font-medium">Filtrar por estado:</label>
      <div class="flex items-center space-x-4">
        <label>
          <input type="radio" value="all" v-model="filterStatus" @change="applyTermsFilter" />
          Todos
        </label>
        <label>
          <input
            type="radio"
            value="no vigente"
            v-model="filterStatus"
            @change="applyTermsFilter"
          />
          No vigente
        </label>
        <label>
          <input type="radio" value="eliminada" v-model="filterStatus" @change="applyTermsFilter" />
          Eliminada
        </label>
      </div>
    </div>

    <!-- Tabla de términos y condiciones -->
    <table class="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="py-2 px-4 border-b border-gray-200">Fecha de Creación</th>
          <th class="py-2 px-4 border-b border-gray-200">Versión</th>
          <th class="py-2 px-4 border-b border-gray-200">Título</th>
          <th class="py-2 px-4 border-b border-gray-200">Contenido</th>
          <th class="py-2 px-4 border-b border-gray-200">Estado</th>
          <th class="py-2 px-4 border-b border-gray-200">Fecha de vigencia</th>
          <th class="py-2 px-4 border-b border-gray-200">Acciones</th>
        </tr>
      </thead>
      <tbody v-if="filteredTerms.length > 0 && !isLoading">
        <tr
          v-for="term in filteredTerms"
          :key="term.id"
          class="hover:bg-gray-50"
          :class="term.status === 'vigente' ? 'bg-gray-200' : ''"
        >
          <td class="py-2 px-4 border-b border-gray-200">
            {{ new Date(term.createdAt).toLocaleDateString() }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">{{ term.version }}</td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">{{ term.title }}</td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">{{ term.content }}</td>
          <td class="py-2 px-4 border-b border-gray-200">
            <!-- Mostrar el estado -->
            <span
              :class="{
                'bg-green text-green-600': term.status === 'vigente',
                'text-yellow-600': term.status === 'no vigente',
                'text-red-600': term.status === 'eliminada',
              }"
              class="capitalize"
            >
              {{ term.status }}
            </span>
          </td>
          <td class="py-2 px-4 border-b border-gray-200">
            {{ new Date(term.effectiveDate).toLocaleDateString() }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 max-w-xs">
            <button
              @click="openTermsModalView(term)"
              class="text-slate-600 hover:text-slate-800 mr-2"
            >
              <EyeIcon class="size-8" />
            </button>
            <button
              @click.prevent="editTerms(term)"
              class="text-blue-600 hover:text-blue-800 mr-2"
              :class="{ 'opacity-50 cursor-not-allowed': term.status === 'eliminada' }"
              :disabled="term.status === 'eliminada'"
            >
              <PencilSquareIcon class="size-8" />
            </button>
            <button
              @click.prevent="deleteTerms(term.id)"
              class="text-red-600 hover:text-red-800"
              :class="{ 'opacity-50 cursor-not-allowed': term.status === 'eliminada' }"
              :disabled="term.status === 'eliminada'"
            >
              <TrashIcon class="size-8" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <h1 class="text-4xl mt-12 text-center" v-show="!isLoadingData && terms.length === 0">
      Aún no hay registros de términos y condiciones, agrega uno para empezar a listar.
    </h1>
  </div>
  <div v-else class="h-screen mt-32">
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
import { ref, computed, onMounted } from 'vue';
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { useToast } from 'vue-toast-notification';
import useVuelidate from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { required } from '@vuelidate/validators';
import olympusAPI from '@/api/olympusAPI';

const showEditModal = ref(false);
const showTermsModal = ref(false);
const showTermsModalView = ref(false);
const selectedTerms = ref(null); // Términos seleccionados para vista/edición
const isLoading = ref(false);
const termsTitle = ref('');
const termsContent = ref('');
const termsEffectiveDate = ref('');
const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
const terms = ref([]); // Lista de términos
const isCurrentVersion = ref(false); // Valor del radio button
const isLoadingData = ref(false);

// Validaciones
const formRules = {
  termsTitle: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
  termsContent: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
  termsEffectiveDate: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
};

const $toast = useToast();
const v$ = useVuelidate(formRules, {
  termsTitle,
  termsContent,
  termsEffectiveDate,
});

const filterStatus = ref('all');

const deleteTerms = async (policyId) => {
  try {
    // Confirmar antes de proceder
    const confirmed = confirm('¿Estás seguro de que deseas eliminar esta política?');
    if (!confirmed) return;

    isLoading.value = true;
    // Enviar la solicitud al backend para marcar como eliminada
    const response = await olympusAPI.delete(`/dr/terms-and-conditions/${policyId}`, {
      status: 'eliminada',
    });

    // Mostrar mensaje de éxito o manejar la respuesta
    console.log('Política marcada como eliminada exitosamente:', response.data);

    // Actualizar la lista local para reflejar los cambios
    const index = terms.value.findIndex((policy) => policy.id === policyId);
    if (index !== -1) {
      terms.value[index].status = 'eliminada'; // Actualizar el estado localmente
    }
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.error('Error al eliminar la política de privacidad:', error.message);
  }
};

const updateTerms = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    isLoading.value = true;

    // Crear el objeto con los datos actualizados
    const updatedTermsData = {
      title: termsTitle.value,
      content: termsContent.value,
      effectiveDate: termsEffectiveDate.value,
      isCurrent: isCurrentVersion.value === 'true',
    };

    // Hacer la solicitud para actualizar los términos en el backend
    const response = await olympusAPI.put(
      `/dr/terms-and-conditions/${selectedTerms.value.id}`,
      updatedTermsData,
    );

    console.log('Términos actualizados con éxito:', response.data);

    // Actualizar la lista de términos localmente
    await fetchTerms();
    isLoading.value = false;

    $toast.open({
      message: response.data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    closeEditModal(); // Cerrar el modal de edición
  } catch (error) {
    isLoading.value = false;
    const errorMessage =
      error.response?.data?.message || 'Error al actualizar los términos y condiciones.';

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

const editTerms = (term) => {
  selectedTerms.value = term;
  termsTitle.value = term.title;
  termsContent.value = term.content;

  // Convertir la fecha a formato YYYY-MM-DD
  const effectiveDateObject = new Date(term.effectiveDate);
  const year = effectiveDateObject.getFullYear();
  const month = String(effectiveDateObject.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11, por eso se suma 1
  const day = String(effectiveDateObject.getDate()).padStart(2, '0');
  termsEffectiveDate.value = `${year}-${month}-${day}`;

  showEditModal.value = true; // Mostrar modal de edición
};

// Función para cerrar el modal
const closeTermsModal = () => {
  showTermsModal.value = false;
  termsTitle.value = '';
  termsContent.value = '';
  termsEffectiveDate.value = '';
  v$.value.$reset();
};

const closeTermsModalView = () => {
  showTermsModalView.value = false;
  selectedTerms.value = null;
};

const closeEditModal = () => {
  termsTitle.value = '';
  termsContent.value = '';
  termsEffectiveDate.value = '';
  isCurrentVersion.value = 'false'; // Reinicia los valores de los radio buttons
  showEditModal.value = false;
  v$.value.$reset(); // Reiniciar las validaciones
};

// Función para abrir la vista completa de los términos
const openTermsModalView = (term) => {
  selectedTerms.value = term;
  showTermsModalView.value = true;
};

// Función para crear términos
const handleCreateTerms = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    isLoading.value = true;

    const { data } = await olympusAPI.post('/dr/terms-and-conditions', {
      title: termsTitle.value,
      content: termsContent.value,
      effectiveDate: termsEffectiveDate.value,
    });

    console.log(data);

    await fetchTerms();
    isLoading.value = false;

    $toast.open({
      message: data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    closeTermsModal();
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

// Filtrar por estado
const applyTermsFilter = () => {};

// Computed para filtrar términos
const filteredTerms = computed(() => {
  if (filterStatus.value === 'all') {
    return terms.value;
  }
  return terms.value.filter((term) => term.status === filterStatus.value);
});

// Función para obtener los términos desde la API
const fetchTerms = async () => {
  try {
    isLoadingData.value = true;
    terms.value = [];

    const response = await olympusAPI.get('/dr/terms-and-conditions');

    terms.value = response.data;
    isLoadingData.value = false;
  } catch (error) {
    isLoadingData.value = false;
    console.error('Error al obtener los términos y condiciones:', error);
  }
};

// Función para formatear fechas
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('es-MX', options);
};

// Llamada inicial para obtener los términos
onMounted(async () => {
  await fetchTerms();
});
</script>

<style scoped>
.container {
  max-width: 1024px;
}

.policy-table {
  width: 100%;
  border-collapse: collapse;
}

.policy-table th,
.policy-table td {
  text-align: left;
}

.policy-table td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

textarea {
  max-height: 150px;
}
</style>
