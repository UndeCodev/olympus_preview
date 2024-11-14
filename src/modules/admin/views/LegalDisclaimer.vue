<template>
  <div v-if="!isLoadingData" class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Listado de Deslindes Legales</h1>
      <button
        @click="showDisclaimerModal = true"
        class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        + Agregar Deslinde Legal
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

    <!-- Modal para agregar Descargo Legal -->
    <div
      v-if="showDisclaimerModal"
      @click.self="closeDisclaimerModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-md:w-2/3 w-1/3">
        <h2 class="text-2xl font-bold mb-4">Agregar Deslinde Legal</h2>

        <!-- Formulario de descargo legal -->
        <form @submit.prevent="handleCreateDisclaimer">
          <div class="mb-4">
            <label for="disclaimerTitle" class="block text-gray-700 font-medium">Título</label>
            <input
              v-model="disclaimerTitle"
              id="disclaimerTitle"
              type="text"
              :class="{ 'form-control--error': v$.disclaimerTitle.$error }"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span v-if="v$.disclaimerTitle.$error">
              <p v-for="error of v$.disclaimerTitle.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="disclaimerContent" class="block text-gray-700 font-medium">Contenido</label>
            <textarea
              v-model="disclaimerContent"
              id="disclaimerContent"
              class="w-full p-2 h-40 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 overflow-y-scroll resize-none"
              :class="{ 'form-control--error': v$.disclaimerContent.$error }"
            ></textarea>
            <span v-if="v$.disclaimerContent.$error">
              <p v-for="error of v$.disclaimerContent.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="disclaimerEffectiveDate" class="block text-gray-700 font-medium"
              >Fecha de Vigencia</label
            >
            <input
              v-model="disclaimerEffectiveDate"
              :min="today"
              id="disclaimerEffectiveDate"
              type="date"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              :class="{ 'form-control--error': v$.disclaimerEffectiveDate.$error }"
            />
            <span v-if="v$.disclaimerEffectiveDate.$error">
              <p
                v-for="error of v$.disclaimerEffectiveDate.$errors"
                :key="error.$uid"
                class="text-error"
              >
                {{ error.$message }}
              </p>
            </span>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-between items-center">
            <button
              type="button"
              @click="closeDisclaimerModal"
              class="text-red-600 hover:text-red-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Crear Deslinde Legal
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de vista completa para Deslinde Legal -->
    <div
      v-if="showDisclaimerModalView"
      @click.self="closeDisclaimerModalView"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full md:w-9/12 lg:w-1/3 max-h-[80vh] lg:h-max-2/3"
      >
        <div class="p-6 space-y-6 h-full">
          <h2 class="text-3xl font-bold text-gray-800 border-b pb-2">
            {{ selectedDisclaimer.title }}
          </h2>

          <div class="space-y-4 grid place-content-between h-full grid-cols-1">
            <div class="w-full">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Contenido:</h3>
              <p class="text-gray-600 bg-gray-50 p-4 rounded-md">
                {{ selectedDisclaimer.content }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
              <div class="bg-blue-50 p-3 rounded-md">
                <p class="text-sm font-medium text-blue-800">Fecha de Vigencia</p>
                <p class="text-lg text-blue-900">
                  {{ formatDate(selectedDisclaimer.effectiveDate) }}
                </p>
              </div>
              <div class="bg-green-50 p-3 rounded-md">
                <p class="text-sm font-medium text-green-800">Fecha de Creación</p>
                <p class="text-lg text-green-900">{{ formatDate(selectedDisclaimer.createdAt) }}</p>
              </div>
              <div class="bg-purple-50 p-3 rounded-md">
                <p class="text-sm font-medium text-purple-800">Última Actualización</p>
                <p class="text-lg text-purple-900">
                  {{ formatDate(selectedDisclaimer.updatedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 flex justify-end p-4">
          <button
            @click="closeDisclaimerModalView"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para editar Deslinde Legal -->
    <div
      v-if="showEditModal"
      @click.self="closeEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-md:w-2/3 w-1/3">
        <h2 class="text-2xl font-bold mb-4">Editar Deslinde Legal</h2>

        <!-- Formulario de Deslinde legal -->
        <form @submit.prevent="updateDisclaimer">
          <div class="mb-4">
            <label for="disclaimerTitle" class="block text-gray-700 font-medium">Título</label>
            <input
              v-model="disclaimerTitle"
              id="disclaimerTitle"
              type="text"
              :class="{ 'form-control--error': v$.disclaimerTitle.$error }"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span v-if="v$.disclaimerTitle.$error">
              <p v-for="error of v$.disclaimerTitle.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="disclaimerContent" class="block text-gray-700 font-medium">Contenido</label>
            <textarea
              v-model="disclaimerContent"
              id="disclaimerContent"
              class="w-full p-2 h-40 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 overflow-y-scroll resize-none"
              :class="{ 'form-control--error': v$.disclaimerContent.$error }"
            ></textarea>
            <span v-if="v$.disclaimerContent.$error">
              <p v-for="error of v$.disclaimerContent.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="disclaimerEffectiveDate" class="block text-gray-700 font-medium"
              >Fecha de Vigencia</label
            >
            <input
              v-model="disclaimerEffectiveDate"
              :min="today"
              id="disclaimerEffectiveDate"
              type="date"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              :class="{ 'form-control--error': v$.disclaimerEffectiveDate.$error }"
            />
            <span v-if="v$.disclaimerEffectiveDate.$error">
              <p
                v-for="error of v$.disclaimerEffectiveDate.$errors"
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
              Actualizar Deslinde Legal
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
          <input type="radio" value="all" v-model="filterStatus" @change="applyDisclaimerFilter" />
          Todos
        </label>
        <label>
          <input
            type="radio"
            value="NO_VIGENTE"
            v-model="filterStatus"
            @change="applyDisclaimerFilter"
          />
          No vigente
        </label>
        <label>
          <input
            type="radio"
            value="ELIMINADA"
            v-model="filterStatus"
            @change="applyDisclaimerFilter"
          />
          Eliminada
        </label>
      </div>
    </div>

    <!-- Tabla de descargos legales -->
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
      <tbody v-if="filteredDisclaimers.length > 0 && !isLoading">
        <tr
          v-for="disclaimer in filteredDisclaimers"
          :key="disclaimer.id"
          class="hover:bg-gray-50"
          :class="disclaimer.estado === 'VIGENTE' ? 'bg-gray-200' : ''"
        >
          <td class="py-2 px-4 border-b border-gray-200">
            {{ new Date(disclaimer.createdAt).toLocaleDateString() }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">
            {{ disclaimer.version }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">
            {{ disclaimer.titulo }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">
            {{ disclaimer.contenido }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200">
            <!-- Mostrar el estado -->
            <span
              :class="{
                'bg-green text-green-600': disclaimer.estado === 'VIGENTE',
                'text-yellow-600': disclaimer.estado === 'NO_VIGENTE',
                'text-red-600': disclaimer.estado === 'ELIMINADA',
              }"
              class="capitalize"
            >
              {{ disclaimer.estado }}
            </span>
          </td>
          <td class="py-2 px-4 border-b border-gray-200">
            {{ new Date(disclaimer.fecha_vigencia).toLocaleDateString() }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 max-w-xs">
            <button
              @click="openDisclaimerModalView(disclaimer)"
              class="text-slate-600 hover:text-slate-800 mr-2"
            >
              <EyeIcon class="size-8" />
            </button>
            <button
              @click.prevent="editDisclaimer(disclaimer)"
              class="text-blue-600 hover:text-blue-800 mr-2"
              :class="{ 'opacity-50 cursor-not-allowed': disclaimer.estado === 'ELIMINADA' }"
              :disabled="disclaimer.estado === 'ELIMINADA'"
            >
              <PencilSquareIcon class="size-8" />
            </button>
            <button
              @click.prevent="deleteDisclaimer(disclaimer.id)"
              class="text-red-600 hover:text-red-800"
              :class="{ 'opacity-50 cursor-not-allowed': disclaimer.estado === 'ELIMINADA' }"
              :disabled="disclaimer.estado === 'ELIMINADA'"
            >
              <TrashIcon class="size-8" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <h1 class="text-4xl mt-12 text-center" v-show="disclaimers.length === 0">
      Aún no hay registros de deslindes legales, agrega uno para empezar a listar.
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
const showDisclaimerModal = ref(false);
const showDisclaimerModalView = ref(false);
const selectedDisclaimer = ref(null); // Descargo seleccionado para vista/edición
const isLoading = ref(false);
const disclaimerTitle = ref('');
const disclaimerContent = ref('');
const disclaimerEffectiveDate = ref('');
const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
const disclaimers = ref([]); // Lista de descargos
const isCurrentVersion = ref(false); // Valor del radio button
const isLoadingData = ref(false);

// Validaciones
const formRules = {
  disclaimerTitle: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
  disclaimerContent: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
  disclaimerEffectiveDate: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
};

const $toast = useToast();
const v$ = useVuelidate(formRules, {
  disclaimerTitle,
  disclaimerContent,
  disclaimerEffectiveDate,
});

const filterStatus = ref('all');

const deleteDisclaimer = async (disclaimerId) => {
  try {
    // Confirmar antes de proceder
    const confirmed = confirm('¿Estás seguro de que deseas eliminar este descargo?');
    if (!confirmed) return;

    isLoading.value = true;
    // Enviar la solicitud al backend para marcar como eliminado
    const response = await olympusAPI.delete(`/dr/legal-disclaimer/${disclaimerId}`);

    // Mostrar mensaje de éxito o manejar la respuesta
    console.log('Descargo marcado como eliminado exitosamente:', response.data);

    // Actualizar la lista local para reflejar los cambios
    const index = disclaimers.value.findIndex((disclaimer) => disclaimer.id === disclaimerId);
    if (index !== -1) {
      disclaimers.value[index].estado = 'ELIMINADA'; // Actualizar el estado localmente
    }
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.error('Error al eliminar el descargo legal:', error.message);
  }
};

const updateDisclaimer = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    isLoading.value = true;

    // Crear el objeto con los datos actualizados
    const updatedDisclaimerData = {
      title: disclaimerTitle.value,
      content: disclaimerContent.value,
      effectiveDate: disclaimerEffectiveDate.value,
      isCurrent: isCurrentVersion.value,
    };

    // Hacer la solicitud para actualizar el descargo en el backend
    const response = await olympusAPI.put(
      `/dr/legal-disclaimer/${selectedDisclaimer.value.id}`,
      updatedDisclaimerData,
    );

    console.log('Descargo actualizado con éxito:', response.data);

    // Actualizar la lista de descargos localmente
    await fetchDisclaimers();
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
    const errorMessage = error.response?.data?.message || 'Error al actualizar el descargo legal.';

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

const editDisclaimer = (disclaimer) => {
  selectedDisclaimer.value = disclaimer;
  disclaimerTitle.value = disclaimer.titulo;
  disclaimerContent.value = disclaimer.contenido;

  // Convertir la fecha a formato YYYY-MM-DD
  const effectiveDateObject = new Date(disclaimer.fecha_vigencia);
  const year = effectiveDateObject.getFullYear();
  const month = String(effectiveDateObject.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11, por eso se suma 1
  const day = String(effectiveDateObject.getDate()).padStart(2, '0');
  disclaimerEffectiveDate.value = `${year}-${month}-${day}`;

  isCurrentVersion.value = disclaimer.estado === 'VIGENTE';
  showEditModal.value = true; // Mostrar modal de edición
};

// Función para cerrar el modal
const closeDisclaimerModal = () => {
  showDisclaimerModal.value = false;
  disclaimerTitle.value = '';
  disclaimerContent.value = '';
  disclaimerEffectiveDate.value = '';
  v$.value.$reset();
};

const closeDisclaimerModalView = () => {
  showDisclaimerModalView.value = false;
  selectedDisclaimer.value = null;
};

const closeEditModal = () => {
  disclaimerTitle.value = '';
  disclaimerContent.value = '';
  disclaimerEffectiveDate.value = '';
  isCurrentVersion.value = 'false'; // Reinicia los valores de los radio buttons
  showEditModal.value = false;
  v$.value.$reset(); // Reiniciar las validaciones
};

// Función para abrir la vista completa de los descargos
const openDisclaimerModalView = (disclaimer) => {
  selectedDisclaimer.value = disclaimer;
  showDisclaimerModalView.value = true;
};

// Función para crear descargos
const handleCreateDisclaimer = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    isLoading.value = true;

    const { data } = await olympusAPI.post('/dr/legal-disclaimer', {
      title: disclaimerTitle.value,
      content: disclaimerContent.value,
      effectiveDate: disclaimerEffectiveDate.value,
    });

    await fetchDisclaimers();
    isLoading.value = false;

    $toast.open({
      message: data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    closeDisclaimerModal();
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
const applyDisclaimerFilter = () => {};

// Computed para filtrar descargos
const filteredDisclaimers = computed(() => {
  if (filterStatus.value === 'all') {
    return disclaimers.value;
  }
  return disclaimers.value.filter((disclaimer) => disclaimer.estado === filterStatus.value);
});

// Función para obtener los descargos desde la API
const fetchDisclaimers = async () => {
  try {
    isLoadingData.value = true;
    disclaimers.value = [];

    const response = await olympusAPI.get('/dr/legal-disclaimer');

    disclaimers.value = response.data;
    isLoadingData.value = false;
  } catch (error) {
    isLoadingData.value = false;
    console.error('Error al obtener los descargos legales:', error);
  }
};

// Función para formatear fechas
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('es-MX', options);
};

// Llamada inicial para obtener los descargos
onMounted(async () => {
  await fetchDisclaimers();
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
