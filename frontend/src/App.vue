<script setup>
// Abbiamo importato 'ref' per creare variabili reattive e gli 'hooks' per gestire il ciclo di vita del componente
import { ref, onMounted, onUnmounted } from 'vue'
// Abbiamo importato 'RouterView' per indicare a Vue dove proiettare le diverse pagine del sito
import { RouterView } from 'vue-router'

/* --- SINTASSI VUE 3 (Composition API) --- */
/* Abbiamo scelto questa sintassi perché è la più moderna. Invece di manipolare manualmente il DOM,
   abbiamo creato delle variabili "reattive" (ref) che dicono all'HTML come deve comportarsi. */

// Abbiamo creato una variabile reattiva per decidere se il menu principale deve essere visibile o meno
const isMenuOpen = ref(false)
// Abbiamo creato una variabile reattiva per gestire l'apertura della tendina "Esplora"
const isSubmenuOpen = ref(false)

// Abbiamo definito questa funzione per invertire lo stato del menu principale (se è chiuso si apre, e viceversa)
const toggleMenu = () => {
  // Abbiamo usato '.value' perché le ref di Vue sono oggetti e dobbiamo accedere al loro valore interno
  isMenuOpen.value = !isMenuOpen.value
}

// Abbiamo creato questa funzione per gestire il sottomenu quando l'utente clicca su "Esplora"
const toggleSubmenu = (event) => {
  // Abbiamo bloccato il comportamento predefinito del link per evitare che la pagina si ricarichi
  event.preventDefault()
  // Abbiamo invertito lo stato di apertura del sottomenu usando sempre la proprietà .value
  isSubmenuOpen.value = !isSubmenuOpen.value
}

// Abbiamo scritto questa logica per far sì che il menu si chiuda da solo se l'utente clicca fuori da esso
const closeMenuOnClickOutside = (event) => {
  // Abbiamo controllato se il clic dell'utente NON è avvenuto né sull'hamburger né dentro il menu
  if (!event.target.matches('.hamburger') && !event.target.closest('.menu-dropdown')) {
    // In caso positivo, abbiamo resettato entrambe le variabili a 'false' per chiudere tutto
    isMenuOpen.value = false
    isSubmenuOpen.value = false
  }
}

/* Lifecycle Hooks di Vue: abbiamo usato onMounted per attivare il controllo del clic globale 
   solo quando il sito è effettivamente caricato nel browser dell'utente */
onMounted(() => {
  // Abbiamo aggiunto un "ascoltatore" di eventi al browser per intercettare ogni clic sulla finestra
  window.addEventListener('click', closeMenuOnClickOutside)
})

/* Abbiamo usato onUnmounted per pulire le risorse: se l'utente cambia app o chiude il sito, 
   abbiamo rimosso l'ascoltatore per non sprecare memoria del computer */
onUnmounted(() => {
  // Abbiamo rimosso il listener che avevamo aggiunto precedentemente
  window.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<template>
  <nav class="menu-container">
    
    <div class="hamburger" @click="toggleMenu">&#9776;</div>
    
    <div class="menu-dropdown" :class="{ 'show': isMenuOpen }">
      <a href="#" @click="toggleSubmenu">Esplora &#9662;</a>
      
      <div class="submenu-content" :class="{ 'show': isSubmenuOpen }">
        <a href="#">Viaggi disponibili</a>
        <a href="#">Viaggi sold out</a>
        <a href="#">Viaggi in arrivo</a>
        <a href="#">Viaggio fai da te</a>
      </div>
      
      <a href="#">Chi Siamo</a>
      <a href="#">F.A.Q.</a>
      <a href="#">Contattaci</a>
      
      <RouterLink to="/login">Accedi / Registrati</RouterLink>
    </div>
  </nav>

  <RouterView />
</template>

<style>
/* Abbiamo deciso di non scrivere CSS qui per mantenere il file pulito e leggero, 
   visto che abbiamo già un file CSS globale che gestisce tutto lo stile del sito */
</style>
