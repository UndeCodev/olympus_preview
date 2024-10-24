<template>
  <div>
    <div class="grid gap-4 md:grid-flow-col md:place-content-start py-8 px-2 bg-slate-900 rounded">
      <RouterLink
        :to="{ name: 'politica-privacidad' }"
        class="text-white py-2 px-4 rounded-full mx-2 hover:bg-slate-700 transition duration-300 ease-in-out"
        active-class="bg-slate-700"
      >
        Políticas de Privacidad
      </RouterLink>

      <RouterLink
        :to="{ name: 'terminos-condiciones' }"
        class="text-white py-2 px-4 rounded-full mx-2 hover:bg-slate-700 transition duration-300 ease-in-out"
        active-class="bg-slate-700"
      >
        Términos y Condiciones
      </RouterLink>

      <RouterLink
        :to="{ name: 'deslinde-legal' }"
        class="text-white py-2 px-4 rounded-full mx-2 hover:bg-slate-700 transition duration-300 ease-in-out"
        active-class="bg-slate-700"
      >
        Deslinde legal
      </RouterLink>
    </div>

    <main class="my-10 overflow-x-auto">
      <RouterView />
    </main>
  </div>
</template>
