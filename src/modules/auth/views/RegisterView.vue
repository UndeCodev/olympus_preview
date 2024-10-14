<script setup>
import { useRegister } from '../composables/useRegister';

const {
  // Properties
  formRegister,
  strengthPercent,
  checks,
  isPasswordVisible,
  isLoading,
  passwordStatus,
  v$,

  // Methods
  togglePasswordVisibility,
  checkPasswordStrength,
  checkPassword,
  onRegister,
} = useRegister();
</script>

<template>
  <form @submit.prevent="onRegister" class="form bg-white rounded-sm shadow-sm p-6">
    <h1 class="text-center text-4xl">Registro de usuario</h1>

    <div class="form-group grid gap-3">
      <label for="name">Nombre completo:</label>
      <input
        type="text"
        placeholder="Jane Doe"
        class="form-control"
        :class="{ 'form-control--error': v$.name.$error }"
        id="name"
        v-model.trim="formRegister.name"
      />
      <span v-if="v$.name.$error">
        <p v-for="error of v$.name.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </p>
      </span>
    </div>
    <div class="form-group grid gap-3">
      <label for="phone">Teléfono:</label>
      <input
        type="text"
        placeholder="8221234442"
        class="form-control"
        :class="{ 'form-control--error': v$.phone.$error }"
        maxlength="10"
        id="phone"
        v-model="formRegister.phone"
      />
      <span v-if="v$.phone.$error">
        <p v-for="error of v$.phone.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </p>
      </span>
    </div>
    <div class="form-group grid gap-3">
      <label for="email">Correo electrónico:</label>
      <input
        type="text"
        placeholder="janedoe@outlook.com"
        class="form-control"
        :class="{ 'form-control--error': v$.emailR.$error }"
        id="email"
        v-model.trim="formRegister.emailR"
      />
      <span v-if="v$.emailR.$error">
        <p v-for="error of v$.emailR.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </p>
      </span>
    </div>
    <div class="form-group grid gap-3">
      <label for="password">Contraseña:</label>
      <div class="password-container">
        <input
          :type="isPasswordVisible ? 'text' : 'password'"
          placeholder="**********"
          class="form-control"
          :class="{ 'form-control--error': v$.password.$error || passwordStatus }"
          v-model="formRegister.password"
          @input="checkPasswordStrength"
          @blur="checkPassword"
          id="password"
        />
        <button type="button" @click="togglePasswordVisibility" class="toggle-btn">
          {{ isPasswordVisible ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>
      <span v-if="passwordStatus.length">
        <p class="text-error">{{ passwordStatus }}</p>
      </span>
      <span v-if="v$.password.$error">
        <li v-for="error of v$.password.$errors" :key="error.$uid" class="text-error">
          {{ error.$message }}
        </li>
      </span>
      <div class="strength-meter">
        <div class="strength-meter-fill" :style="{ width: strengthPercent + '%' }"></div>
      </div>

      <ul>
        <li :class="{ passed: checks.lowercaseUppercase }">
          {{ checks.lowercaseUppercase ? '✔' : '✖️' }} Incluye mayúsculas y minúsculas
        </li>
        <li :class="{ passed: checks.number }">
          {{ checks.number ? '✔' : '✖️' }} Incluye un número
        </li>
        <li :class="{ passed: checks.specialChar }">
          {{ checks.specialChar ? '✔' : '✖️' }} Incluye un carácter especial (!@#$%^&*)
        </li>
        <li :class="{ passed: checks.minLength }">
          {{ checks.minLength ? '✔' : '✖️' }} Debe contener al menos 12 carácteres
        </li>
      </ul>
    </div>
    <div class="form-group grid gap-3">
      <label for="repeat-password">Repetir contraseña:</label>
      <input
        :type="isPasswordVisible ? 'text' : 'password'"
        placeholder="**********"
        class="form-control"
        :class="{ 'form-control--error': v$.confirmPassword.$error }"
        id="repeat-password"
        v-model="formRegister.confirmPassword"
      />
      <span v-if="v$.confirmPassword.$error">
        <p class="text-error">
          {{ v$.confirmPassword.$errors[0].$message }}
        </p>
      </span>
    </div>
    <button class="btn btn-primary">
      <span v-if="!isLoading">Registrarme</span>
      <div v-else class="sk-chase w-8 h-8 mx-auto">
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
      </div>
    </button>
    <span class="grid text-center"
      >¿Ya tienes una cuenta?
      <RouterLink class="text-link" :to="{ name: 'inicio-sesion' }"
        >Inicia sesión aquí</RouterLink
      ></span
    >
  </form>
</template>

<style scoped>
/* Estilos para el medidor */
.strength-meter {
  height: 10px;
  background-color: #eee;
  margin-top: 10px;
  border-radius: 5px;
}

.strength-meter-fill {
  height: 100%;
  background-color: #10ad64; /* Cambia el color para la fuerza */
  border-radius: 5px;
  transition: width 0.3s;
}

/* Estilos para los mensajes de validación */
ul {
  list-style: none;
  padding: 0;
}

li {
  color: gray;
}

.passed {
  color: #038247;
  font-weight: bold;
}
</style>
