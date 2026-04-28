import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AlgeriaView from '../views/AlgeriaView.vue'
import ErrorView from '../views/ErrorView.vue'
import LoginView from '../views/LoginView.vue'
import ViaggiDisponibiliView from '../views/ViaggiDisponibiliView.vue'
import ViaggiSoldOutView from '../views/ViaggiSoldOutView.vue'

/* --- VUE ROUTER (Rif: Parte 2.pdf) --- */
/* Configuro il Router per gestire la navigazione SPA (Single Page Application).
   L'oggetto history utilizza le API del browser per creare percorsi puliti senza il simbolo #. */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      /* Questa rotta si attiva quando l'utente seleziona Agosto e Algeria nel form */
      path: '/agosto_algeria',
      name: 'algeria',
      component: AlgeriaView
    },

     {
    path: '/soldout',
    name: 'SoldOut',
    component: ViaggiSoldOutView
  },

     
    {
      path: '/viaggi-disponibili',
      name: 'viaggi-disponibili',
      component: ViaggiDisponibiliView
    },
    {
      /* Rotta CATCH-ALL: Se l'utente cerca una combinazione non ancora esistente
         (es. /settembre_francia) o un URL inesistente, Vue lo reindirizza 
         automaticamente al componente ErrorView. */
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: ErrorView
    }
  ]
})

export default router
