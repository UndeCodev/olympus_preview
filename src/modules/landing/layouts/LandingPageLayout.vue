<script setup>
import { useAuthStore } from '@/modules/auth/store/useAuthStore';

const authStore = useAuthStore();
</script>

<template>
  <nav
    class="container mx-auto shadow-sm rounded-sm p-6 gap-10 bg-blue-100 flex place-items-center"
  >
    <RouterLink :to="{ name: 'inicio' }">Inicio</RouterLink>
    <RouterLink :to="{ name: 'products' }">Productos</RouterLink>
    <RouterLink :to="{ name: 'acerca-de' }">Acerca de</RouterLink>
    <RouterLink :to="{ name: 'contacto' }">Contacto</RouterLink>
    <div v-if="authStore.isAuthenticated" class="ml-auto flex gap-9">
      <RouterLink class="btn-profile" :to="{ name: 'profile-layout' }">{{
        authStore.username
      }}</RouterLink>
      <button
        class="bg-red-700 hover:bg-red-600 transition text-white rounded-md px-4 py-3"
        @click="authStore.logout()"
      >
        Cerrar sesión
      </button>
    </div>
    <template v-else>
      <RouterLink class="ml-auto btn btn-primary" :to="{ name: 'auth' }">Iniciar sesión</RouterLink>
    </template>
  </nav>
  <main class="container mx-auto">
    <RouterView />
  </main>
</template>
