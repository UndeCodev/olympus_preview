<template>
  <div v-if="!isLoadingData" class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Listado de Políticas de Privacidad</h1>
      <button
        @click="showModal = true"
        class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        + Agregar Política
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

    <!-- Modal -->
    <div
      v-if="showModal"
      @click.self="closeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-md:w-2/3 w-1/3">
        <h2 class="text-2xl font-bold mb-4">Agregar Política de Privacidad</h2>

        <!-- Formulario de la política -->
        <form @submit.prevent="handleCreatePolicy">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 font-medium">Título</label>
            <input
              v-model="title"
              id="title"
              type="text"
              :class="{ 'form-control--error': v$.title.$error }"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span v-if="v$.title.$error">
              <p v-for="error of v$.title.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="content" class="block text-gray-700 font-medium">Contenido</label>
            <textarea
              v-model="content"
              id="content"
              class="w-full p-2 h-40 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 overflow-y-scroll resize-none"
              :class="{ 'form-control--error': v$.content.$error }"
            ></textarea>
            <span v-if="v$.content.$error">
              <p v-for="error of v$.content.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="effectiveDate" class="block text-gray-700 font-medium"
              >Fecha de Vigencia</label
            >
            <input
              v-model="effectiveDate"
              :min="today"
              id="effectiveDate"
              type="date"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              :class="{ 'form-control--error': v$.effectiveDate.$error }"
            />
            <span v-if="v$.effectiveDate.$error">
              <p v-for="error of v$.effectiveDate.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-between items-center">
            <button type="button" @click="closeModal" class="text-red-600 hover:text-red-800">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Crear política de privacidad
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de edición -->
    <div
      v-if="showEditModal"
      @click.self="closeEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-lg shadow-lg max-sm:w-full mx-16 max-md:w-2/4 w-1/3 h-9/10 p-6 overflow-y-auto"
      >
        <h2 class="text-2xl font-bold mb-4">Editar Política de Privacidad</h2>

        <!-- Formulario de edición de la política -->
        <form @submit.prevent="updatePolicy">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 font-medium">Título</label>
            <input
              v-model="title"
              id="title"
              type="text"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              :class="{ 'form-control--error': v$.title.$error }"
            />
            <span v-if="v$.title.$error">
              <p v-for="error of v$.title.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="content" class="block text-gray-700 font-medium">Contenido</label>
            <textarea
              v-model="content"
              id="content"
              class="w-full p-2 h-40 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 overflow-y-scroll resize-none"
              :class="{ 'form-control--error': v$.content.$error }"
            ></textarea>
            <span v-if="v$.content.$error">
              <p v-for="error of v$.content.$errors" :key="error.$uid" class="text-error">
                {{ error.$message }}
              </p>
            </span>
          </div>

          <div class="mb-4">
            <label for="effectiveDate" class="block text-gray-700 font-medium"
              >Fecha de Vigencia</label
            >
            <input
              v-model="effectiveDate"
              :min="today"
              id="effectiveDate"
              type="date"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              :class="{ 'form-control--error': v$.effectiveDate.$error }"
            />
            <span v-if="v$.effectiveDate.$error">
              <p v-for="error of v$.effectiveDate.$errors" :key="error.$uid" class="text-error">
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
              Actualizar Política
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de vista completa -->
    <div
      v-if="showModalView"
      @click.self="closeModalView"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full md:w-9/12 lg:w-1/2 max-h-[80vh] lg:h-max-2/3"
      >
        <div class="p-6 space-y-6 h-full">
          <h2 class="text-3xl font-bold text-gray-800 border-b pb-2">{{ selectedPolicy.title }}</h2>

          <div class="space-y-4 grid place-content-between h-full grid-cols-1">
            <div class="w-full">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Contenido:</h3>
              <p class="text-gray-600 bg-gray-50 p-4 rounded-md">{{ selectedPolicy.content }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
              <div class="bg-blue-50 p-3 rounded-md">
                <p class="text-sm font-medium text-blue-800">Fecha de Vigencia</p>
                <p class="text-lg text-blue-900">{{ formatDate(selectedPolicy.effectiveDate) }}</p>
              </div>
              <div class="bg-green-50 p-3 rounded-md">
                <p class="text-sm font-medium text-green-800">Fecha de Creación</p>
                <p class="text-lg text-green-900">{{ formatDate(selectedPolicy.createdAt) }}</p>
              </div>
              <div class="bg-purple-50 p-3 rounded-md">
                <p class="text-sm font-medium text-purple-800">Última Actualización</p>
                <p class="text-lg text-purple-900">{{ formatDate(selectedPolicy.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 flex justify-end p-4">
          <button
            @click="closeModalView"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
    <!-- Filtro por estado -->
    <div class="flex justify-start items-center mb-4">
      <label class="mr-4 text-gray-700 font-medium">Filtrar por estado:</label>
      <div class="flex items-center space-x-4">
        <label>
          <input type="radio" value="all" v-model="filterStatus" @change="applyFilter" />
          Todos
        </label>
        <label>
          <input type="radio" value="no vigente" v-model="filterStatus" @change="applyFilter" />
          No vigente
        </label>
        <label>
          <input type="radio" value="eliminada" v-model="filterStatus" @change="applyFilter" />
          Eliminada
        </label>
      </div>
    </div>
    <!-- Tabla de políticas de privacidad -->
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
      <tbody v-if="filteredPolicies.length > 0 && !isLoading">
        <tr
          v-for="policy in filteredPolicies"
          :key="policy.id"
          class="hover:bg-gray-50"
          :class="policy.status === 'vigente' ? 'bg-gray-200' : ''"
        >
          <td class="py-2 px-4 border-b border-gray-200">
            {{ new Date(policy.createdAt).toLocaleDateString() }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">{{ policy.version }}</td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">{{ policy.title }}</td>
          <td class="py-2 px-4 border-b border-gray-200 truncate max-w-xs">{{ policy.content }}</td>
          <td class="py-2 px-4 border-b border-gray-200">
            <!-- Mostrar el estado -->
            <span
              :class="{
                'bg-green text-green-600': policy.status === 'vigente',
                'text-yellow-600': policy.status === 'no vigente',
                'text-red-600': policy.status === 'eliminada',
              }"
              class="capitalize"
            >
              {{ policy.status }}
            </span>
          </td>
          <td class="py-2 px-4 border-b border-gray-200">
            {{ new Date(policy.effectiveDate).toLocaleDateString() }}
          </td>
          <td class="py-2 px-4 border-b border-gray-200 max-w-xs">
            <button @click="openModalView(policy)" class="text-slate-600 hover:text-slate-800 mr-2">
              <EyeIcon class="size-8" />
            </button>
            <button
              @click.prevent="editPolicy(policy)"
              class="text-blue-600 hover:text-blue-800 mr-2"
              :class="{ 'opacity-50 cursor-not-allowed': policy.status === 'eliminada' }"
              :disabled="policy.status === 'eliminada'"
            >
              <PencilSquareIcon class="size-8" />
            </button>
            <button
              @click.prevent="deletePrivacyPolicy(policy.id)"
              class="text-red-600 hover:text-red-800"
              :class="{ 'opacity-50 cursor-not-allowed': policy.status === 'eliminada' }"
              :disabled="policy.status === 'eliminada'"
            >
              <TrashIcon class="size-8" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <h1 class="text-4xl mt-12 text-center" v-show="policies.length === 0">
      Aún no hay registros de políticas de privacidad, agrega uno para empezar a listar.
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
import { computed } from 'vue';
import olympusAPI from '@/api/olympusAPI';
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import useVuelidate from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { required } from '@vuelidate/validators';

const showModal = ref(false);

const showEditModal = ref(false);
const selectedPolicy = ref(null); // Política seleccionada para edición
const isCurrentVersion = ref(false); // Valor del radio button

const title = ref('');
const content = ref('');
const effectiveDate = ref('');
const today = new Date().toISOString().split('T')[0]; // Esto te da el formato YYYY-MM-DD
const isLoading = ref(false);
const isLoadingData = ref(false);

const showModalView = ref(false);

// Datos de ejemplo para las políticas de privacidad
const policies = ref([]);

const formRules = {
  title: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
  content: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
  effectiveDate: {
    $autoDirty: true,
    required: helpers.withMessage('Este campo es obligatorio', required),
  },
};

const $toast = useToast();
const v$ = useVuelidate(formRules, {
  title,
  content,
  effectiveDate,
});

const filterStatus = ref('all');

const applyFilter = () => {};

const filteredPolicies = computed(() => {
  if (filterStatus.value === 'all') {
    return policies.value;
  }
  return policies.value.filter((policy) => policy.status === filterStatus.value);
});

// Función para cerrar el modal
const closeModal = () => {
  showModal.value = false;
  title.value = '';
  content.value = '';
  effectiveDate.value = '';
  v$.value.$reset();
};

const closeEditModal = () => {
  title.value = '';
  content.value = '';
  effectiveDate.value = '';
  showEditModal.value = false;
  v$.value.$reset();
};

// Función para abrir el modal con la política seleccionada
const openModalView = (policy) => {
  selectedPolicy.value = policy;
  showModalView.value = true;
};

// Función para cerrar el modal
const closeModalView = () => {
  showModalView.value = false;
  selectedPolicy.value = null;
};

const deletePrivacyPolicy = async (policyId) => {
  try {
    // Confirmar antes de proceder
    const confirmed = confirm('¿Estás seguro de que deseas eliminar esta política?');
    if (!confirmed) return;

    isLoading.value = true;
    // Enviar la solicitud al backend para marcar como eliminada
    const response = await olympusAPI.delete(`/dr/privacy-policy/${policyId}`, {
      status: 'eliminada',
    });

    // Mostrar mensaje de éxito o manejar la respuesta
    console.log('Política marcada como eliminada exitosamente:', response.data);

    // Actualizar la lista local para reflejar los cambios
    const index = policies.value.findIndex((policy) => policy.id === policyId);
    if (index !== -1) {
      policies.value[index].status = 'eliminada'; // Actualizar el estado localmente
    }
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.error('Error al eliminar la política de privacidad:', error.message);
  }
};

const createPrivacyPolicy = async (policyData) => {
  try {
    const { title, content, effectiveDate } = policyData;

    // Validar que todos los campos necesarios estén presentes
    if (!title || !content || !effectiveDate) {
      throw new Error('Todos los campos son obligatorios.');
    }

    // Hacer la solicitud al backend para crear la nueva política de privacidad
    const { data } = await olympusAPI.post('/dr/privacy-policy', {
      title,
      content,
      effectiveDate,
    });

    return data;
  } catch (error) {
    console.error('Error al crear la política de privacidad:', error.message);
    throw error; // Lanzar el error para que sea manejado en el componente llamante
  }
};

const handleCreatePolicy = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    closeModal();
    isLoading.value = true;

    const newPolicyData = {
      title: title.value,
      content: content.value,
      effectiveDate: effectiveDate.value,
    };

    const { message } = await createPrivacyPolicy(newPolicyData);

    await fetchPrivacyPolicies();

    isLoading.value = false;
    $toast.open({
      message: message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
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

const editPrivacyPolicy = async (policyId, updatedData) => {
  try {
    // Validar que todos los campos necesarios estén presentes
    const { title, content, effectiveDate, isCurrent } = updatedData;
    if (!title || !content || !effectiveDate || !policyId) {
      throw new Error('Todos los campos son obligatorios.');
    }

    // Hacer la solicitud al backend para actualizar la política
    const { data } = await olympusAPI.put(`/dr/privacy-policy/${policyId}`, {
      title,
      content,
      effectiveDate,
      isCurrent,
    });

    // Mostrar mensaje de éxito o manejar la respuesta
    return data;
  } catch (error) {
    console.log(error);
    const errorMessage = error.response.data.message;

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

const updatePolicy = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
    isLoading.value = true;
    // Crear el objeto con los datos actualizados
    const updatedPolicyData = {
      title: title.value,
      content: content.value,
      effectiveDate: effectiveDate.value,
      isCurrent: isCurrentVersion.value === 'true',
    };

    // Hacer la solicitud para actualizar la política en el backend
    const updatedPolicy = await editPrivacyPolicy(selectedPolicy.value.id, updatedPolicyData);

    // Actualizar la política localmente en la lista de políticas
    const index = policies.value.findIndex((policy) => policy.id === selectedPolicy.value.id);
    if (index !== -1) {
      policies.value[index] = updatedPolicy.data; // Usar los datos actualizados del backend
    }
    // Cerrar el modal después de actualizar
    await fetchPrivacyPolicies();
    closeEditModal();
    $toast.open({
      message: updatedPolicy.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
    isLoading.value = false;
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

const editPolicy = (policy) => {
  selectedPolicy.value = policy;
  title.value = policy.title;
  content.value = policy.content;

  // Convertir la fecha a formato YYYY-MM-DD
  const effectiveDateObject = new Date(policy.effectiveDate);
  const year = effectiveDateObject.getFullYear();
  const month = String(effectiveDateObject.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11, por eso se suma 1
  const day = String(effectiveDateObject.getDate()).padStart(2, '0');
  effectiveDate.value = `${year}-${month}-${day}`;

  isCurrentVersion.value = policy.status === 'vigente';
  showEditModal.value = true; // Mostrar modal de edición
};

const fetchPrivacyPolicies = async () => {
  try {
    isLoadingData.value = true;
    policies.value = [];

    const response = await olympusAPI.get('/dr/privacy-policies');

    policies.value = response.data;
    isLoadingData.value = false;
  } catch (error) {
    isLoadingData.value = false;
    console.error('Error al obtener las políticas de privacidad:', error);
  }
};

// Función para formatear las fechas
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('es-MX', options);
};

onMounted(async () => {
  await fetchPrivacyPolicies();
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
