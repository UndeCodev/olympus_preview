<script setup>
import router from '@/router';

const logout = () => {
  const token = localStorage.getItem('token');

  if (token) {
    localStorage.removeItem('token');
    router.replace({ name: 'inicio' });
  }
};
</script>

<template>
  <nav class="p-8 flex gap-10 bg-slate-200 place-items-center">
    <RouterLink :to="{ name: 'gestion-productos' }">Gestión de productos</RouterLink>
    <RouterLink :to="{ name: 'gestion-usuarios' }">Gestión de usuarios</RouterLink>
    <RouterLink :to="{ name: 'gestion-productos' }">Gestión de membresías</RouterLink>

    <button
      class="bg-red-700 hover:bg-red-600 transition text-white rounded-md px-4 py-3 ml-auto"
      @click="logout"
    >
      Cerrar sesión
    </button>
  </nav>
  <main class="h-screen place-content-center text-center">
    <RouterView />
  </main>
</template>
