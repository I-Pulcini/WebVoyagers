<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/* VUE ROUTER: Importiamo il router di Vue per poter cambiare pagina 
   senza ricaricare il browser (logica Single Page Application) */
const router = useRouter()

/* COMPOSITION API: Usiamo ref() per creare variabili reattive. 
   Quando queste cambiano, l'HTML si aggiorna da solo! */
const mesi = ref([])
const paesi = ref([])
const selectedMese = ref("")
const selectedPaese = ref("")

/* LIFECYCLE HOOKS: onMounted scatta non appena la pagina viene caricata.
   Qui facciamo la chiamata AJAX per prendere i dati dal JSON. */
onMounted(() => {
  // Il file destinazioni.json deve essere nella cartella /public
  fetch('/destinazioni.json')
    .then(res => res.json())
    .then(data => {
      // Popoliamo le variabili reattive con i dati del JSON
      mesi.value = data.mesi
      paesi.value = data.paesi

      // WEB STORAGE: Ripristiniamo l'ultima ricerca se esiste
      const ultimaMeta = localStorage.getItem('ultimaMeta')
      if (ultimaMeta) {
        selectedPaese.value = ultimaMeta
      }
    })
    .catch(err => console.error("Errore fetch:", err))
})

/* GESTIONE EVENTI: Funzione chiamata al submit del form */
const cercaDestinazione = () => {
  if (selectedMese.value && selectedPaese.value) {
    // Salviamo nel LocalStorage
    localStorage.setItem("ultimaMeta", selectedPaese.value)

    // Costruiamo il path (es: /agosto_algeria)
    let nomeMese = selectedMese.value.toLowerCase()
    let nomePaese = selectedPaese.value.toLowerCase().replace(/ /g, "_")
    let pathName = `/${nomeMese}_${nomePaese}`

    // Usiamo il router per navigare alla nuova pagina virtuale
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
/* SCOPED CSS: Aggiungendo 'scoped', queste regole CSS avranno effetto 
   SOLO su questa specifica pagina e non sballeranno il resto del sito. */
.home-wrapper {
  background-image: url('/web.jpg'); /* Prende l'immagine dalla cartella public */
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  padding-top: 100px; /* Lascia spazio in alto per il menu in App.vue */
}
</style>