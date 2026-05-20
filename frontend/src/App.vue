<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { userStore } from './stores/userStore'
// abbiamo importato RouterView cioè il contenitore in cui verranno messe le pagine Home,Errore ecc
//RouterLink il tag di Vue che serve per creare link sena far ricaricare il browser
// useRoute server per sapere le info sulla pafina attuale 
// useRouter, il comando per deviare l'utente su un'altra pagina via codice
//userStore, è un contenitore in cui vengono salvati i dati dell'utente loggato cosi da leggerli in qualsiasi parte del sito senza perderli



const isMenuOpen = ref(false)  //var.reattiva che imposta il menù hambuger chiuso
const isSubmenuOpen = ref(false)  //var.reattiva che imposta l'aperta del sottomenu


const route = useRoute() 

const router = useRouter()  //serve a prendere l'indirizzo in cui si trova l'utente in questo momento

const mostraBottoneHome = computed(() => route.path !== '/')  //clicchi il bottone con la casa e ti riporta alla home


const toggleMenu = () => {   // Abbiamo creato la funzione che apre/chiude il menu hamburger
  isMenuOpen.value = !isMenuOpen.value
}


const toggleSubmenu = (event) => {  // Abbiamo creato la funzione che apre/chiude il sottomenu "Esplora"
  event.preventDefault()
  isSubmenuOpen.value = !isSubmenuOpen.value
}


const closeMenu = () => {   // Abbiamo creato la funzione che chiude completamente tutti i menu
  isMenuOpen.value = false
  isSubmenuOpen.value = false
}


const closeMenuOnClickOutside = (event) => {   // Abbiamo creato la funzione che chiude il menu se si clicca fuori
  if (!event.target.matches('.hamburger') && !event.target.closest('.menu-dropdown')) {
    isMenuOpen.value = false
    isSubmenuOpen.value = false
  }
}

// Abbiamo creato una funzione asincrona che chiama il backend per sapere se c'è una sessione attiva
const verificaSessione = async () => {
  try {
    //il client invia una richiesta di tipo GET all'endpoint del server 
    const response = await fetch('/api/me', {
      credentials: 'include'  //serve a ricordare a clinet di mandare il cookie
    })


    
    const data = await response.json()  
 
    if (data.loggato) {
    
      userStore.setUser(data.userId, data.username, data.isAdmin)  //prende i dati inviate dal server, cosi tutto il sito sa chi è l'utente
    }
  } catch (err) {
    console.error('Errore nella verifica sessione:', err)
  }
}

   
// Abbiamo creato la funzione che esegue il logout chiamando lo store e poi reindirizza alla home
const gestisciLogout = async () => {
  // Abbiamo prima chiuso il menu hamburger
  closeMenu()
  // Abbiamo eseguito il logout completo tramite la funzione dello store
  await userStore.logout()  // await è un'operazione asincrona che blocca l'esecuzione dentro questa funzone finchè non arriva la risposra del server, ma non blovva ilbrowser dell'utente
 
  router.push('/') //se si fa logout si va nella pagina che ha la URL '/' cioè HomeView.vue
}



onMounted(() => {
  verificaSessione()  //verifichiamo se l'utente è gia loggato
  window.addEventListener('click', closeMenuOnClickOutside)  //il browser resta in ascolto ed ogni volta che l'utente clicca qualsiasi punto dello schermo deve attivare la fuznione closeMenuOnClickOutside
})


onUnmounted(() => {  //quando al pagina viene chiusa, rimuovimao il click cosi liberiamo memoria dal computer
  window.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<template>
  
  <RouterLink v-if="mostraBottoneHome" to="/" class="btn-home" aria-label="Torna alla home">  //prendo il pulsante home fuori dalla pagina homeView.vue ci riporta alla home
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">  //svg è un tag di html che ci da le coordinate per disegnare l'icona
     //viewBox="0 0 24 24=  questo è la tela virtuale del disegno, 24 altezza e 24 altezza 
      //fill="none" = dice che l'intrno della casetta non deve essere colorato
      //stroke="currentColor" = il colore della casetta deve adattarsi al colore del testo circostante
      <path d="M3 9.5L12 2l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>  //traccia materialmente le linee del disegno
    </svg>  //svg viene usato per disegnare elementi grafici
  </RouterLink>

  <nav class="menu-container">  //narra di navigazione del sito
    <div class="hamburger" @click="toggleMenu">&#9776;</div>  //serve per aprire e chiudere 

    <div class="menu-dropdown" :class="{ 'show': isMenuOpen }">  //si apre il menu ad hamburger
      <a href="#" @click="toggleSubmenu">Esplora &#9662;</a>  //&#9662; ovvero ▾

      <div class="submenu-content" :class="{ 'show': isSubmenuOpen }">  //mostrimao il sotto menù solo quando la funzione è vera
        <RouterLink to="/viaggi-disponibili" @click="closeMenu">Viaggi disponibili</RouterLink>
        <RouterLink to="/soldout" @click="closeMenu">Viaggi Sold Out</RouterLink>
        <RouterLink to="/viaggi-inarrivo" @click="closeMenu">Viaggi in arrivo</RouterLink>
        <RouterLink to="/viaggio-misterioso" @click="closeMenu">Viaggio Misterioso</RouterLink>
      </div>

      <RouterLink to="/chi-siamo" @click="closeMenu">Chi Siamo</RouterLink>
      <RouterLink to="/contattaci" @click="closeMenu">Contattaci</RouterLink>

     //se l'utente non è loggato
      <RouterLink v-if="!userStore.loggato" to="/login" @click="closeMenu">Accedi / Registrati</RouterLink>
      <template v-else>
        <div class="utente-loggato"> //se l'utente è loggato
          Ciao, <strong>{{ userStore.username ?? 'Utente' }}</strong>!
        </div>
        <RouterLink 
          v-if="userStore.isAdmin" //se l'utente è l'amministratore
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
        <a href="#" @click.prevent="gestisciLogout" class="btn-logout">Esci</a>  //href="#" = serve al link di non andare su una pagina specifica ma di rimanere nella stessa.@click.prevent="gestisciLogout"= se clicchiamo esci allora si fa la funzione di gestisci Logount e .prevent serve per far resyare il browser nella pagina in cui stiamo
      </template>
    </div>
  </nav>

  <RouterView />
</template>

<style>
//bottone della casetta, i colori
//. è un selettore mentre il nome dietro è il nome di una classe HTML ed è una classe hidden nascosta all'utente
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

// le mie prenotazione, !important forza il browser ad usare questo colore verde scuro
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

// il mio profilo, testo viola
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
//amministrazione
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

//logout
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
