<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './modules/auth/store/useAuthStore';
import olympusAPI from './api/olympusAPI';

const authStore = useAuthStore();

const link = document.querySelector("link[rel~='icon']");

authStore.$subscribe(
  (_, state) => {
    if (state.authStatus === authStore.AuthStatus.UnAuthenticated) {
      authStore.checkAuthStatus();
      return;
    }
  },
  {
    immediate: true,
  },
);

const fetchDataWebsite = async () => {
  try {
    const { data } = await olympusAPI.get('/settings/company-profile');
    const { logo_min_url, titulo_sitio } = data;

    link.href = logo_min_url;
    document.title = titulo_sitio ?? 'Olympus GYM';
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  await fetchDataWebsite();
});
</script>
