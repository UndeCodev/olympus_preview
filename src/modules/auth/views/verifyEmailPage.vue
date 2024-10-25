<template>
  <div
    class="h-screen place-content-center place-items-center px-6 bg-gradient-red shadow-lg bg-slate-50"
  >
    <template v-if="!isLoadingData">
      <div
        v-if="ok"
        class="grid gap-6 info-card rounded-lg p-8 bg-white shadow sm:w-2/3 md:w-1/2 lg:w-1/2 xl:w-1/4"
      >
        <h3 class="text-2xl text-slate-900 font-semibold text-center">Olympus Gym</h3>
        <img
          src="@/assets/images/illustrations/undraw_mail_sent_re_0ofv.svg"
          alt="Vericiation Email"
          class="size-80 mx-auto"
        />
        <div class="grid gap-4">
          <h1 class="text-3xl lg:text-5xl text-center text-slate-900 font-semibold">
            ¡Enhorabuena!
          </h1>
          <p class="font-normal text-slate-700 text-center">
            Verificaste correctamente tú correo electrónico, ahora puedes
          </p>
        </div>
        <button class="btn btn-primary" @click="login">Aceptar e iniciar sesión</button>
      </div>
      <div
        v-else
        class="grid gap-6 info-card rounded-lg p-8 bg-white shadow sm:w-2/3 md:w-1/2 lg:w-1/2 xl:w-1/4"
      >
        <h3 class="text-2xl text-slate-900 font-semibold text-center">Olympus Gym</h3>
        <img
          src="@/assets/images/illustrations/undraw_server_down_s-4-lk.svg"
          alt="Vericiation Email"
          class="size-80 mx-auto"
        />
        <div class="grid gap-4">
          <h1 class="text-5xl lg:text-5xl text-center text-slate-900 font-semibold">Oops..!</h1>
          <p class="text-3xl font-normal text-slate-600 text-center">
            El token proporcionado es inválido o caducó, intenta reenviar un nuevo enlace
          </p>
        </div>
        <div class="flex place-content-center gap-4 mt-6">
          <RouterLink :to="{ name: 'inicio' }" class="btn btn-outline">
            <ArrowLeftIcon class="size-8" /> Ir al inicio
          </RouterLink>
          <button @click="resendVerificationEmail" class="btn btn-primary">
            <span v-if="!isSendingData">Reenviar enlace de verificación</span>

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
      </div>
    </template>
    <div v-else class="sk-chase w-24 h-24 mx-auto">
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
import { ref, onBeforeMount } from 'vue';
import olympusAPI from '@/api/olympusAPI';
import { useRoute } from 'vue-router';
import router from '@/router';
import { ArrowLeftIcon } from '@heroicons/vue/24/solid';
import { useToast } from 'vue-toast-notification';

// Instances
const route = useRoute();
const $toast = useToast();

const token = route.query?.token;
const email = route.query?.email;

const ok = ref(false);

const isLoadingData = ref(false);
const isSendingData = ref(false);

const resendVerificationEmail = async () => {
  try {
    const { data } = await olympusAPI.post('/auth/resend-verification-email', { email });

    $toast.open({
      message: data.message,
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });
  } catch (error) {
    const errorMessage = error.response.data.message;

    if (error.response.data.isEmailVerified) {
      router.replace({ name: 'inicio-sesion' });

      $toast.open({
        message: errorMessage,
        type: 'info',
        duration: 4000,
        pauseOnHover: true,
      });

      return;
    }

    $toast.open({
      message: errorMessage,
      type: 'error',
      duration: 4000,
      pauseOnHover: true,
    });
  }
};

const verifyToken = async () => {
  try {
    isLoadingData.value = true;
    await olympusAPI.put('/auth/verify-email', { token: token });

    ok.value = true;

    $toast.open({
      message: 'Bienvenido! Nos da gusto que seas parte de nuestro equipo',
      type: 'success',
      duration: 4000,
      pauseOnHover: true,
    });

    $toast.open({
      message: 'Ahora pudees iniciar sesión',
      type: 'info',
      duration: 4000,
      pauseOnHover: true,
    });
    isLoadingData.value = false;
  } catch (error) {
    isLoadingData.value = false;
    ok.value = false;
  }
};

const login = () => {
  router.replace({ name: 'inicio-sesion' });
};

onBeforeMount(async () => {
  if (!token || !email) return router.replace({ name: 'inicio' });

  await verifyToken();
});
</script>
