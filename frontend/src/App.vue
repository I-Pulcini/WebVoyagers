<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { userStore } from './stores/userStore'


/* --- SINTASSI VUE 3 (Composition API) --- */
/* Abbiamo organizzato tutta la logica nel blocco script setup.
   Le variabili reattive (ref) si aggiornano automaticamente nell'HTML. */

// Abbiamo creato due variabili reattive per gestire lo stato del menu hamburger
const isMenuOpen = ref(false)
const isSubmenuOpen = ref(false)

// Abbiamo importato useRoute per sapere su quale pagina ci troviamo
const route = useRoute()
// Abbiamo importato il router per poter spostare l'utente programmaticamente (es. dopo il logout)
const router = useRouter()
// Abbiamo creato una proprietà calcolata che nasconde il bottone "casa" nella homepage
const mostraBottoneHome = computed(() => route.path !== '/')

// Abbiamo creato la funzione che apre/chiude il menu hamburger
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Abbiamo creato la funzione che apre/chiude il sottomenu "Esplora"
const toggleSubmenu = (event) => {
  event.preventDefault()
  isSubmenuOpen.value = !isSubmenuOpen.value
}

// Abbiamo creato la funzione che chiude completamente tutti i menu
const closeMenu = () => {
  isMenuOpen.value = false
  isSubmenuOpen.value = false
}

// Abbiamo creato la funzione che chiude il menu se si clicca fuori
const closeMenuOnClickOutside = (event) => {
  if (!event.target.matches('.hamburger') && !event.target.closest('.menu-dropdown')) {
    isMenuOpen.value = false
    isSubmenuOpen.value = false
  }
}

/* --- VERIFICA SESSIONE ALL'AVVIO --- */
// Abbiamo creato una funzione asincrona che chiama il backend per sapere se c'è una sessione attiva
const verificaSessione = async () => {
  try {
    // Abbiamo chiamato l'endpoint /api/me con credentials:'include' per inviare i cookie di sessione
    const response = await fetch('/api/me', {
      credentials: 'include'
    })
    // Abbiamo trasformato la risposta da JSON a oggetto JavaScript
    const data = await response.json()
    // Abbiamo controllato se il backend ha confermato che l'utente è loggato
    if (data.loggato) {
      // Abbiamo aggiornato lo store globale con i dati dell'utente recuperati dalla sessione
      userStore.setUser(data.userId, data.username, data.isAdmin)
    }
  } catch (err) {
    // Abbiamo stampato l'eventuale errore in console per il debug
    console.error('Errore nella verifica sessione:', err)
  }
}

/* --- LOGOUT --- */
// Abbiamo creato la funzione che esegue il logout chiamando lo store e poi reindirizza alla home
const gestisciLogout = async () => {
  // Abbiamo prima chiuso il menu hamburger per dare un feedback visivo immediato
  closeMenu()
  // Abbiamo eseguito il logout completo tramite la funzione dello store
  await userStore.logout()
  // Abbiamo reindirizzato l'utente alla homepage dopo aver effettuato il logout
  router.push('/')
}

/* --- LIFECYCLE HOOKS --- */
// Abbiamo agganciato la verifica sessione e il listener click al montaggio del componente
onMounted(() => {
  verificaSessione()
  window.addEventListener('click', closeMenuOnClickOutside)
})

// Abbiamo rimosso il listener click quando il componente viene distrutto
onUnmounted(() => {
  window.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<template>
  <!-- Abbiamo aggiunto il bottone "Torna alla home" visibile solo fuori dalla homepage -->
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
        <RouterLink to="/viaggio-misterioso" @click="closeMenu">Viaggio Misterioso</RouterLink>
      </div>

      <RouterLink to="/chi-siamo" @click="closeMenu">Chi Siamo</RouterLink>
      <RouterLink to="/contattaci" @click="closeMenu">Contattaci</RouterLink>

      <!-- Abbiamo aggiunto la logica condizionale: se l'utente è loggato vede il saluto, le sue prenotazioni e il logout, altrimenti vede il link Accedi -->
      <RouterLink v-if="!userStore.loggato" to="/login" @click="closeMenu">Accedi / Registrati</RouterLink>
      <template v-else>
        <div class="utente-loggato">
          Ciao, <strong>{{ userStore.username ?? 'Utente' }}</strong>!
        </div>
        <RouterLink 
          v-if="userStore.isAdmin" 
          to="/admin" 
          @click="closeMenu" 
          class="link-admin"
        >
          ⚡ Admin Panel
        </RouterLink>
        <RouterLink to="/profilo" @click="closeMenu" class="link-profilo">
          👤 Il mio profilo
        </RouterLink>
        <RouterLink to="/le-mie-prenotazioni" @click="closeMenu" class="link-prenotazioni">
          📋 Le mie prenotazioni
        </RouterLink>
        <a href="#" @click.prevent="gestisciLogout" class="btn-logout">Esci</a>
      </template>
    </div>
  </nav>

  <RouterView />
</template>

<style>
/* Bottone "Torna alla home": cerchio bianco con icona casa, sempre in alto a sinistra */
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

/* Stile per il saluto all'utente loggato dentro il menu hamburger */
.utente-loggato {
  padding: 14px 20px;
  font-size: 16px;
  color: #00c4b4;
  border-top: 2px solid #00c4b4;
  background-color: #f9f9f9;
}

/* Stile della voce "Le mie prenotazioni" nel menu hamburger */
.link-prenotazioni {
  display: block;
  padding: 14px 20px;
  color: #00897b !important;
  text-decoration: none;
  font-weight: bold;
  font-size: 15px;
  background-color: #e0f7f5;
  border-bottom: 1px solid #b2dfdb;
  transition: background-color 0.3s;
}

.link-prenotazioni:hover {
  background-color: #b2dfdb;
}

/* Stile della voce "Il mio profilo" nel menu hamburger */
.link-profilo {
  display: block;
  padding: 14px 20px;
  color: #4527a0 !important;
  text-decoration: none;
  font-weight: bold;
  font-size: 15px;
  background-color: #f3e5f5;
  border-bottom: 1px solid #d1c4e9;
  transition: background-color 0.3s;
}

.link-profilo:hover {
  background-color: #d1c4e9;
}
/* Stile della voce "Admin Panel" nel menu hamburger (visibile solo agli admin) */
.link-admin {
  display: block;
  padding: 14px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #302b63 100%);
  color: #d81b60 !important;
  text-decoration: none;
  font-weight: bold;
  font-size: 15px;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid #1a1a2e;
  transition: all 0.3s;
}

.link-admin:hover {
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  color: white !important;
}

/* Stile del bottone Logout dentro il menu hamburger */
.btn-logout {
  display: block;
  padding: 14px 20px;
  background-color: #d81b60;
  color: white !important;
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  font-size: 15px;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: #b01650;
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