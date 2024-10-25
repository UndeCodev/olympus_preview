<template>
  <div class="flex h-screen bg-gray-100">
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 transform bg-white transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 grid place-content-between gap-10 p-8 sidebar"
      :class="{ 'translate-x-0': sidebarOpen, '-translate-x-full': !sidebarOpen }"
    >
      <div class="flex items-center justify-between h-16 px-4 border-b">
        <span class="text-2xl font-semibold text-pink-500">Olympus GYM</span>
        <button @click="sidebarOpen = false" class="lg:hidden">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
      <nav class="mt-5 grid gap-6">
        <RouterLink
          v-for="item in defaultItems"
          :key="item.name"
          :to="{ name: item.path }"
          class="flex items-center profile-nav__item"
        >
          <component :is="item.icon" class="size-9" />
          <span>{{ item.name }}</span>
        </RouterLink>
        <template v-if="authStore.isAdmin">
          <hr />
          <RouterLink
            v-for="item in adminItems"
            :key="item.name"
            :to="{ name: item.path }"
            class="flex items-center profile-nav__item"
          >
            <component :is="item.icon" class="size-9" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </template>
      </nav>
      <div class="flex gap-4 mt-72">
        <RouterLink :to="{ name: 'inicio' }" class="btn btn-outline">
          <ArrowLeftIcon class="size-8" /> Volver al inicio
        </RouterLink>
        <button
          @click="onLogout"
          class="btn btn-primary flex place-content-center place-items-center"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="flex items-center justify-between h-16 px-6 bg-white border-b">
        <button @click="sidebarOpen = true" class="lg:hidden">
          <Bars3BottomLeftIcon class="size-10" />
        </button>
      </header>

      <main class="flex-1 overflow-auto bg-gray-100 py-10 px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
// import { ref } from 'vue';

import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/vue/24/outline';
import router from '@/router';

import { ref } from 'vue';

const sidebarOpen = ref(false);

const defaultItems = [
  { name: 'Cambiar contraseña', icon: LockClosedIcon, path: 'reset-password' },
  { name: 'Autenticación de dos pasos', icon: FingerPrintIcon, path: 'mfa-setup' },
];

const adminItems = [
  { name: 'Configuración del sitio', icon: AdjustmentsHorizontalIcon, path: 'perfil-empresa' },
  { name: 'Documentos legales', icon: DocumentTextIcon, path: 'documentos-legales' },
];

// Store
const authStore = useAuthStore();

// Methods
const onLogout = () => {
  router.replace({ name: 'inicio' });
  authStore.logout();
};
</script>

<style scoped>
.profile-nav__item {
  border-radius: 5px;
  font-weight: 500;
  font-size: 1.6rem;
  padding: 1.2rem 1.6rem;

  display: grid;
  grid-auto-flow: column;
  place-items: center;
  place-content: start;
  gap: 1.2rem;
  color: #797a7b;

  position: relative;
  transition: ease 0.4s;
}

.profile-nav__item:hover {
  color: #1f2223;
}

.router-link-exact-active .profile-nav__icon,
.router-link-active {
  color: #57595a;
}

.router-link-exact-active::before,
.router-link-active::before,
.profile-nav__item:hover::before {
  content: '';
  position: absolute;
  right: 0;
  width: 2px;
  height: 100%;
  background-color: #57595a;
}
</style>
