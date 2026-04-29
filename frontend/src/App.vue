<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'

/* --- SINTASSI VUE 3 (Composition API) --- */
/* In Vue.js la logica JavaScript viene incapsulata dentro il blocco <script setup>.
   Invece di usare getElementById per modificare le classi, in Vue usiamo le variabili "reattive" (ref).
   Quando il valore di una ref cambia, Vue aggiorna l'HTML automaticamente in tempo reale! */

// Variabili reattive per lo stato del menu (aperto/chiuso)
const isMenuOpen = ref(false)
const isSubmenuOpen = ref(false)

// useRoute ci dà accesso alla rotta corrente, così possiamo nascondere il bottone "casa" 
// quando l'utente è già nella homepage
const route = useRoute()
const mostraBottoneHome = computed(() => route.path !== '/')

// Funzione per aprire/chiudere il menu principale
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Funzione per aprire/chiudere il sottomenu
const toggleSubmenu = (event) => {
  event.preventDefault()
  isSubmenuOpen.value = !isSubmenuOpen.value
}

// Funzione per chiudere tutto (da usare quando si clicca su un link)
const closeMenu = () => {
  isMenuOpen.value = false
  isSubmenuOpen.value = false
}

// Logica per chiudere il menu cliccando fuori
const closeMenuOnClickOutside = (event) => {
  if (!event.target.matches('.hamburger') && !event.target.closest('.menu-dropdown')) {
    isMenuOpen.value = false
    isSubmenuOpen.value = false
  }
}

/* Lifecycle Hooks di Vue: aggiungo il listener globale quando il componente 
   viene montato (onMounted) e lo rimuovo quando viene distrutto (onUnmounted) */
onMounted(() => {
  window.addEventListener('click', closeMenuOnClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<template>
  <!-- Bottone "Torna alla home" in alto a sinistra, visibile solo fuori dalla homepage -->
  <RouterLink v-if="mostraBottoneHome" to="/" class="btn-home" aria-label="Torna alla home">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9.5L12 2l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>
    </svg>
  </RouterLink>

  <nav class="menu-container">
    <div class="hamburger" @click="toggleMenu">&#9776;</div>

    <div class="menu-dropdown" :class="{ 'show': isMenuOpen }">
      <a href="#" @click="toggleSubmenu">Esplora &#9662;</a>

      <div class="submenu-content" :class="{ 'show': isSubmenuOpen }">
        <RouterLink to="/viaggi-disponibili" @click="closeMenu">Viaggi disponibili</RouterLink>
        <RouterLink to="/soldout" @click="closeMenu">Viaggi Sold Out</RouterLink>
        <RouterLink to="/viaggi-inarrivo" @click="closeMenu">Viaggi in arrivo</RouterLink>
        <a href="#" @click="closeMenu">Viaggio fai da te</a>
      </div>

      <RouterLink to="/chi-siamo" @click="closeMenu">Chi Siamo</RouterLink>
      <RouterLink to="/contattaci" @click="closeMenu">Contattaci</RouterLink>
      <RouterLink to="/login" @click="closeMenu">Accedi / Registrati</RouterLink>
    </div>
  </nav>

  <RouterView />
</template>

<style>
/* Bottone "Torna alla home": cerchio bianco con icona casa,
   sempre visibile in alto a sinistra grazie a position: fixed */
.btn-home {
  position: fixed;
  top: 15px;
  left: 20px;
  z-index: 1000;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00c4b4;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, background-color 0.3s, color 0.3s;
}

.btn-home:hover {
  background-color: #00c4b4;
  color: white;
  transform: scale(1.1);
}

.btn-home svg {
  width: 26px;
  height: 26px;
}

@media (max-width: 600px) {
  .btn-home {
    width: 42px;
    height: 42px;
    top: 10px;
    left: 12px;
  }
  .btn-home svg {
    width: 22px;
    height: 22px;
  }
}
</style>
