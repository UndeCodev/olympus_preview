<template>
  <div class="bg-white shadow-lg rounded-xl p-8 mb-8 max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold text-center text-indigo-600 mb-6">Delsinde legal</h1>
    <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ privacy.title }}</h2>
    <div class="text-gray-700 text-lg leading-relaxed mb-6 space-y-4">
      <p v-html="privacy.content"></p>
    </div>
    <p class="text-gray-500 italic text-right">Fecha de vigencia: {{ formattedDate }}</p>
  </div>
</template>

<script setup>
import { onMounted, reactive, computed } from 'vue';
import olympusAPI from '@/api/olympusAPI';

// Reactive object to store privacy policy data
const privacy = reactive({
  title: '',
  content: '',
  effectiveDate: '',
});

// Function to fetch the privacy policy data
const fetchData = async () => {
  try {
    const { data } = await olympusAPI.get('/dr/legal-disclaimer-public');
    const { titulo, contenido, fecha_vigencia } = data;
    privacy.title = titulo;
    privacy.content = contenido;
    privacy.effectiveDate = fecha_vigencia;
  } catch (error) {
    console.log(error);
  }
};

// Computed property to format the date in es-MX
const formattedDate = computed(() => {
  if (privacy.effectiveDate) {
    const date = new Date(privacy.effectiveDate);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
  return '';
});

// Fetch data when the component is mounted
onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
/* Optional: Add custom styles here */
</style>
