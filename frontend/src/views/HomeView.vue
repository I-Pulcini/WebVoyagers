<script setup>
// Abbiamo importato 'ref' per la reattività e 'onMounted' per gestire l'avvio della pagina
import { ref, onMounted } from 'vue'
// Abbiamo importato 'useRouter' per poter cambiare pagina via codice dopo il submit del form
import { useRouter } from 'vue-router'

/* VUE ROUTER: Abbiamo inizializzato il router per poter navigare tra le rotte 
   senza ricaricare il browser, mantenendo la logica Single Page Application */
const router = useRouter()

/* COMPOSITION API: Abbiamo usato ref() per creare variabili "intelligenti". 
   Quando queste liste o selezioni cambiano, Vue aggiorna l'HTML della pagina all'istante! */
const mesi = ref([]) // Qui salveremo la lista dei mesi caricata dal JSON
const paesi = ref([]) // Qui salveremo la lista dei paesi caricata dal JSON
const selectedMese = ref("") // Qui memorizzeremo cosa sceglie l'utente nel primo menu
const selectedPaese = ref("") // Qui memorizzeremo cosa sceglie l'utente nel secondo menu

/* LIFECYCLE HOOKS: Abbiamo usato onMounted perché vogliamo che i dati vengano 
   scaricati non appena l'utente apre la Home Page. */
onMounted(() => {
  // Abbiamo usato la funzione fetch per leggere il file 'destinazioni.json' nella cartella public
  fetch('/destinazioni.json')
    .then(res => res.json()) // Abbiamo convertito la risposta del server in un oggetto JavaScript
    .then(data => {
      // Abbiamo popolato le nostre variabili reattive con i dati estratti dal file
      mesi.value = data.mesi
      paesi.value = data.paesi

      // WEB STORAGE: Abbiamo aggiunto una funzione di memoria "di cortesia"
      // Abbiamo controllato se nel browser esiste una vecchia ricerca salvata
      const ultimaMeta = localStorage.getItem('ultimaMeta')
      if (ultimaMeta) {
        // Se esiste, l'abbiamo pre-selezionata nel menu a tendina per l'utente
        selectedPaese.value = ultimaMeta
      }
    })
    .catch(err => console.error("Errore fetch:", err)) // Abbiamo previsto un log in caso di file mancante
})

/* GESTIONE EVENTI: Abbiamo definito la logica che scatta quando si preme il tasto Cerca */
const cercaDestinazione = () => {
  // Abbiamo verificato che l'utente abbia selezionato entrambi i campi obbligatori
  if (selectedMese.value && selectedPaese.value) {
    
    // Abbiamo salvato la scelta del paese nel LocalStorage per ricordarcela alla prossima visita
    localStorage.setItem("ultimaMeta", selectedPaese.value)

    // Abbiamo trasformato le scelte dell'utente in un formato adatto all'URL (tutto minuscolo)
    let nomeMese = selectedMese.value.toLowerCase()
    // Abbiamo sostituito gli spazi con i trattini bassi (es: "Cape Verde" diventa "cape_verde")
    let nomePaese = selectedPaese.value.toLowerCase().replace(/ /g, "_")
    
    // Abbiamo costruito la stringa finale del percorso (es: /agosto_algeria)
    let pathName = `/${nomeMese}_${nomePaese}`

    // Abbiamo usato il router per "spingere" l'utente verso la nuova pagina del viaggio scelto
    router.push(pathName)
  }
}
</script>

<template>
  <div class="home-wrapper">
    <header>
      <h1 class="main-title">WebVoyagers</h1>
    </header>

    <main class="main-content">
      <form @submit.prevent="cercaDestinazione">
        
        <div class="form-group">
          <label for="parla">Quando? :</label>
          <select id="parla" v-model="selectedMese" required>
            <option value="" disabled>Scegli un periodo</option>
            <option v-for="mese in mesi" :key="mese" :value="mese">{{ mese }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="paese">Scegli un paese:</label>
          <select id="paese" v-model="selectedPaese" required>
            <option value="" disabled>Scegli una destinazione...</option>
            <option v-for="paese in paesi" :key="paese" :value="paese">{{ paese }}</option>
          </select>
        </div>

        <div class="form-group">
          <button type="submit" id="bottoneCerca">Cerca Destinazione</button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
/* Abbiamo aggiunto l'attributo 'scoped' per isolare questi stili solo alla Home Page */
.home-wrapper {
  /* Abbiamo richiamato l'immagine web.jpg dalla cartella public per lo sfondo */
  background-image: url('/web.jpg'); 
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  /* Abbiamo usato il posizionamento assoluto per assicurarci che lo sfondo copra tutto lo schermo */
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  /* Abbiamo aggiunto un padding per non far finire il titolo sotto il menu fisso */
  padding-top: 100px; 
}
</style>
