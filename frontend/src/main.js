// Abbiamo importato il file CSS globale per assicurarci che gli stili siano applicati a tutto il sito fin dall'inizio
import './assets/main.css'

// Abbiamo importato la funzione 'createApp' dal pacchetto ufficiale di Vue per poter inizializzare la nostra applicazione
import { createApp } from 'vue'

// Abbiamo importato il componente 'App.vue', che abbiamo scelto come radice (il "padre") di tutti gli altri componenti
import App from './App.vue'

// Abbiamo importato la configurazione del router che abbiamo definito nella cartella 'router' per gestire la navigazione
import router from './router'

// Abbiamo creato l'istanza della nostra applicazione Vue passando il componente principale 'App'
const app = createApp(App)

// Abbiamo detto alla nostra applicazione di utilizzare il 'router', abilitando così la navigazione tra le diverse pagine
app.use(router)

// Abbiamo infine "montato" l'applicazione nell'elemento HTML che ha l'id 'app' all'interno del file index.html
app.mount('#app')
