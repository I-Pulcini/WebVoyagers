<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView , RouterLink} from 'vue-router'  /*routerlink serve per la navigazione */

/* --- SINTASSI VUE 3 (Composition API) --- */
/* In Vue.js la logica JavaScript viene incapsulata dentro il blocco <script setup>.
   Invece di usare getElementById per modificare le classi, in Vue usiamo le variabili "reattive" (ref).
   Quando il valore di una ref cambia, Vue aggiorna l'HTML automaticamente in tempo reale! */

// Variabili reattive per lo stato del menu (aperto/chiuso)
const isMenuOpen = ref(false)
const isSubmenuOpen = ref(false)

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
  <nav class="menu-container">
    
    <div class="hamburger" @click="toggleMenu">&#9776;</div>
    
    <div class="menu-dropdown" :class="{ 'show': isMenuOpen }">
      <a href="#" @click="toggleSubmenu">Esplora &#9662;</a>
      
      <div class="submenu-content" :class="{ 'show': isSubmenuOpen }">
        <RouterLink to="/viaggi-disponibili" @click="closeMenu">Viaggi disponibili</RouterLink>
       <RouterLink to="/soldout">Viaggi sold out</RouterLink>
         
        <a href="#" @click="closeMenu">Viaggi in arrivo</a>
        <a href="#" @click="closeMenu">Viaggio fai da te</a>
      </div>
      
      
      <a href="#" @click="closeMenu">Chi Siamo</a>
      <a href="#" @click="closeMenu">F.A.Q.</a>
      <a href="#" @click="closeMenu">Contattaci</a>
      <RouterLink to="/login" @click="closeMenu">Accedi / Registrati</RouterLink>
    </div>
  </nav>

  <RouterView />
</template>

<style>
/* Non inseriamo CSS qui, perché abbiamo già importato il nostro CSS globale in main.css! */
</style>
