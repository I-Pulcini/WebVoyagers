<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { userStore } from './stores/userStore'



const isMenuOpen = ref(false)  
const isSubmenuOpen = ref(false)  


const route = useRoute() 

const router = useRouter()  

const mostraBottoneHome = computed(() => route.path !== '/')  


const toggleMenu = () => {   
  isMenuOpen.value = !isMenuOpen.value
}


const toggleSubmenu = (event) => {  
  event.preventDefault()
  isSubmenuOpen.value = !isSubmenuOpen.value
}


const closeMenu = () => {   
  isMenuOpen.value = false
  isSubmenuOpen.value = false
}


const closeMenuOnClickOutside = (event) => {   
  if (!event.target.matches('.hamburger') && !event.target.closest('.menu-dropdown')) {
    isMenuOpen.value = false
    isSubmenuOpen.value = false
  }
}


const verificaSessione = async () => {
  try {
    const response = await fetch('/api/me', {
      credentials: 'include'  
    })

    
    const data = await response.json()  
 
    if (data.loggato) {
    
      userStore.setUser(data.userId, data.username, data.isAdmin)  
    }
  } catch (err) {
    console.error('Errore nella verifica sessione:', err)
  }
}

   
const gestisciLogout = async () => {
  closeMenu()
  await userStore.logout() 
 
  router.push('/') 
}



onMounted(() => {
  verificaSessione()  
  window.addEventListener('click', closeMenuOnClickOutside)  


onUnmounted(() => {  
  window.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<template>
  
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

     //se l'utente non è loggato
      <RouterLink v-if="!userStore.loggato" to="/login" @click="closeMenu">Accedi / Registrati</RouterLink>
      <template v-else>
        <div class="utente-loggato"> //se l'utente è loggato
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


.utente-loggato {
  padding: 14px 20px;
  font-size: 16px;
  color: #00c4b4;
  border-top: 2px solid #00c4b4;
  background-color: #f9f9f9;
}


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
