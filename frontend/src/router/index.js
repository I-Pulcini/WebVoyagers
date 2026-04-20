// Abbiamo importato le funzioni necessarie da 'vue-router' per creare il sistema di navigazione
import { createRouter, createWebHistory } from 'vue-router'
// Abbiamo importato i componenti delle singole pagine per poterli collegare ai rispettivi indirizzi URL
import HomeView from '../views/HomeView.vue'
import AlgeriaView from '../views/AlgeriaView.vue'
import ErrorView from '../views/ErrorView.vue'
import LoginView from '../views/LoginView.vue'
/* Abbiamo configurato il Router per gestire la nostra applicazione come una SPA (Single Page Application).
   Questo significa che il sito non ricarica mai l'intera pagina, ma sostituisce solo i componenti al centro dello schermo. */

// Abbiamo creato l'oggetto router che contiene tutta la logica della navigazione
const router = createRouter({
  // Abbiamo attivato 'createWebHistory' per avere degli URL puliti (es. /login) invece di quelli col cancelletto (es. /#/login)
  history: createWebHistory(import.meta.env.BASE_URL),
  
  // Abbiamo definito l'elenco delle rotte, ovvero l'associazione tra l'indirizzo scritto nel browser e il componente da mostrare
  routes: [
    {
      // Abbiamo impostato la rotta radice che corrisponde alla pagina principale del sito
      path: '/',
      // Abbiamo assegnato un nome univoco alla rotta per poterla richiamare facilmente nel codice
      name: 'home',
      // Abbiamo indicato a Vue di mostrare il componente HomeView quando l'utente si trova qui
      component: HomeView
    },
    {
      // Abbiamo creato il percorso per la pagina di accesso e registrazione
      path: '/login',
      // Abbiamo assegnato il nome 'login' a questa specifica destinazione
      name: 'login',
      // Abbiamo collegato questa rotta al componente LoginView che gestisce il form
      component: LoginView
    },
    {
      /* Abbiamo creato questa rotta specifica che si attiva quando l'utente seleziona 
         la combinazione 'Agosto' e 'Algeria' nel form di ricerca della Home */
      path: '/agosto_algeria',
      // Abbiamo chiamato questa rotta 'algeria'
      name: 'algeria',
      // Abbiamo impostato AlgeriaView come componente da visualizzare
      component: AlgeriaView
    },
    {
      /* Abbiamo implementato una Rotta CATCH-ALL (Acchiappa-tutto): 
         se l'utente scrive un URL che non esiste o cerca una combinazione di viaggio 
         che non abbiamo ancora creato (es. /luglio_peru), Vue lo intercetta. */
      path: '/:pathMatch(.*)*',
      // Abbiamo chiamato questa rotta 'not-found' per gestire gli errori 404
      name: 'not-found',
      // Abbiamo deciso di reindirizzare l'utente al componente ErrorView per mostrare un messaggio di cortesia
      component: ErrorView
    }
  ]
})

// Abbiamo esportato il router così da poterlo importare e attivare nel file main.js
export default router
