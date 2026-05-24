import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ErrorView from '../views/ErrorView.vue'
import LoginView from '../views/LoginView.vue'
import ViaggiDisponibiliView from '../views/ViaggiDisponibiliView.vue'
import ViaggiSoldOutView from '../views/ViaggiSoldOutView.vue'
import ViaggiInArrivoView from '../views/ViaggiInArrivoView.vue'
import ChiSiamoView from '../views/ChiSiamoView.vue'
import ContattaciView from '../views/ContattaciView.vue'
import ViaggioMisteriosoView from '../views/ViaggioMisteriosoView.vue'
import ConfermaMisteriosaView from '../views/ConfermaMisteriosaView.vue'
import ScopriViaggioView from '../views/ScopriViaggioView.vue'
import LePrenotazioniView from '../views/LePrenotazioniView.vue'
import ProfiloView from '../views/ProfiloView.vue'
import AdminView from '../views/AdminView.vue'


import DettaglioViaggioView from '../views/DettaglioViaggioView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/viaggi-disponibili', name: 'viaggi-disponibili', component: ViaggiDisponibiliView },
    { path: '/soldout', name: 'SoldOut', component: ViaggiSoldOutView },
    { path: '/viaggi-inarrivo', name: 'viaggi-inarrivo', component: ViaggiInArrivoView },
    
    
    { path: '/chi-siamo', name: 'chi-siamo', component: ChiSiamoView },
    { path: '/contattaci', name: 'contattaci', component: ContattaciView },
    { path: '/le-mie-prenotazioni', name: 'le-mie-prenotazioni', component: LePrenotazioniView },
    { path: '/profilo', name: 'profilo', component: ProfiloView },
    { path: '/admin', name: 'admin', component: AdminView },

    // ROTTE VIAGGIO MISTERIOSO 
    { path: '/viaggio-misterioso', name: 'viaggio-misterioso', component: ViaggioMisteriosoView },
    { path: '/viaggio-misterioso/conferma', name: 'conferma-misteriosa', component: ConfermaMisteriosaView },
    { path: '/scopri-viaggio', name: 'scopri-viaggio', component: ScopriViaggioView },

    //  ROTTA DINAMICA PER TUTTI I VIAGGI 
    { path: '/viaggio/:id', name: 'dettaglio-viaggio', component: DettaglioViaggioView },

    
    {
      // Se l'utente cerca un URL inesistente, Vue lo reindirizza a ErrorView 
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: ErrorView
    }
  ]
})

export default router
