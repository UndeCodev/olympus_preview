<template>
  <nav class="container mx-auto mt-8 shadow-sm rounded-sm p-5 flex gap-10">
    <RouterLink class="" :to="{ name: 'inicio' }">Inicio</RouterLink>
    <RouterLink class="" :to="{ name: 'productos' }">Productos</RouterLink>
    <RouterLink class="" :to="{ name: 'acerca-de' }">Acerca de</RouterLink>
    <RouterLink class="" :to="{ name: 'contacto' }">Contacto</RouterLink>
    <RouterLink class="ml-auto" :to="{ name: 'auth' }">Iniciar sesión</RouterLink>
  </nav>
  <main class="container mx-auto">
    <RouterView />
  </main>
</template>
